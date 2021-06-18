const log = require('another-logger');
const {EventListener} = require('yuuko');
const Parser = require('rss-parser');
const rssParser = new Parser();

/**
 * Builds an embed object to use when posting a feed.
 * @param {string} title The title of the embed.
 * @param {string} author  The author of the content in the embed.
 * @param {Date} date The date the content was made available.
 * @param {number} color The color of the embed frame.
 * @param {string} url The URL of the source of the content.
 * @returns {object}
 */
function buildRssEmbed (title, author, date, color, url) {
	let tempTitle = title;
	// titles in embeds have a 256 char limit
	if (title.length > 253) {
		tempTitle = title.substring(0, 252).concat('...');
	}
	// build the footer
	const footerText = `${date.getUTCFullYear()}/${date.getUTCMonth()}/${date.getUTCDate()} - ${date.getUTCHours()}:${date.getUTCMinutes()} UTC | ${url}`;
	// build embed
	const embed = {
		title: tempTitle,
		author: {name: author},
		footer: {text: footerText},
		color,
	};
	// temporary way to get a pretty (standardized) thumbnail if the source is reddit
	if (url.includes('reddit')) {
		embed.thumbnail = {url: 'https://i.imgur.com/F66Nd8H.png'};
	}

	return embed;
}

module.exports = new EventListener('ready', ({client, db}) => {
	const collection = db.collection('rssFeeds');

	// Calls itself repeatedly 60 seconds after retrieving RSS feeds (or failing to do so)
	(async function checkFeeds () {
		const storedFeeds = await collection.find().toArray();

		// go through and handle all the feeds,
		// do not start the countdown again until all feeds were checked
		await Promise.all(storedFeeds.map(async storedFeed => {
			const rssFeed = await rssParser.parseURL(storedFeed.url);
			log.debug('Checked feeds.');

			// check every post, if it was posted after the latest check for this feed, post it in a channel
			// Also keep track of the latest date of the items we process so we don't try to process them again
			let latestDate = storedFeed.lastCheck;
			for (const post of rssFeed.items) {
				const itemDate = Date.parse(post.isoDate);
				// If this item is from after the last check, process it
				if (itemDate > storedFeed.lastCheck) {
					const embed = buildRssEmbed(post.title, post.author, itemDate, 0xFF4401, storedFeed.url);
					client.getChannel(storedFeed.channelId).createMessage({content: post.link, embed}).catch(error => {
						log.error('Failed to post feed in RSS Feed event.', error);
					});
					// TODO: Here we can check the DB to know if anything in post.title matches a channel name
					// and if so post it there, but that has to be mapped by a human because channel names can get weird
				}
				// Check if this is the latest post we've seen yet
				if (itemDate > latestDate) {
					latestDate = itemDate;
				}
			}

			// update the DB with the date of the latest post we found
			const query = {name: storedFeed.name};
			const update = {
				$set: {
					lastCheck: latestDate,
				},
			};
			await collection.updateOne(query, update, {upsert: false}).catch(error => log.error('Failed to update document in feed event:', error));
		}));
		// Queue this check to run again in 60 seconds
		setTimeout(checkFeeds, 60 * 1000);
	})();
}, {
	once: true,
});
