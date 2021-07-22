const log = require('another-logger');
const {EventListener} = require('yuuko');
const Parser = require('rss-parser');
const rssParser = new Parser();

/**
 * Builds an embed object to use when posting a feed.
 * @param {object} post The parsed feed entry to generate an embed for.
 * @param {string} url The URL of the source of the content.
 * @returns {object}
 */
function buildRssEmbed (post, url) {
	let tempTitle = post.title;
	// titles in embeds have a 256 char limit
	if (post.title.length > 253) {
		tempTitle = post.title.substring(0, 252).concat('...');
	}

	// build embed
	const embed = {
		author: {
			name: post.author,
		},
		title: tempTitle,
		url: post.link,
		timestamp: post.isoDate,
		footer: {
			text: url,
		},
	};

	// Unique processing for different services
	if (url.match(/^https?:\/\/(\w+\.)?reddit\.com/)) {
		embed.color = 0xFF4500;
		embed.footer.icon_url = 'https://i.imgur.com/F66Nd8H.png';
		// TODO: fetch author's avatar and display it in author.icon_url
	}

	return embed;
}

module.exports = new EventListener('ready', ({client, db}) => {
	const collection = db.collection('rssFeeds');

	// Calls itself repeatedly 60 seconds after retrieving RSS feeds (or failing to do so)
	async function checkFeeds () {
		const storedFeeds = await collection.find().toArray();

		log.debug('Checking feeds');
		// go through and handle all the feeds,
		// do not start the countdown again until all feeds were checked
		await Promise.all(storedFeeds.map(async storedFeed => {
			const rssFeed = await rssParser.parseURL(storedFeed.url);

			// check every post, if it was posted after the latest check for this feed, post it in a channel
			// Also keep track of the latest date of the items we process so we don't try to process them again
			let latestDate = storedFeed.lastCheck;
			for (const post of rssFeed.items) {
				const itemDate = new Date(post.isoDate);
				// If this item is from after the last check, process it
				if (itemDate > storedFeed.lastCheck) {
					const embed = buildRssEmbed(post, storedFeed.url);
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
	}

	setInterval(() => {
		if (client.ready) {
			checkFeeds().catch(log.error);
		} else {
			log.warn('Client disconnected while trying to check RSS feeds; skipping');
		}
	}, 60 * 1000);
}, {
	once: true,
});
