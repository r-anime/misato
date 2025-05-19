import log from 'another-logger';
import {EventListener} from 'yuuko';
import {NewsChannel} from 'eris';
import Parser from 'rss-parser';
import {truncate} from '../util/discord';
const rssParser = new Parser();

/**
 * Builds a message content object to use when posting a feed item.
 * @param {object} post The parsed feed entry to generate an embed for.
 * @param {string} feedURL The URL of the source of the content.
 * @returns {object}
 */
function buildRssMessageContent (post, feedURL) {
	// titles in embeds have a 256 char limit
	const tempTitle = truncate(post.title, 256);

	// build embed
	const contentObject = {
		content: post.link,
		embed: {
			author: {
				name: post.author,
			},
			title: tempTitle,
			url: post.link,
			timestamp: post.isoDate,
			footer: {
				text: feedURL,
			},
		},
	};

	// Unique processing for different services
	if (feedURL.match(/^https?:\/\/(\w+\.)?reddit\.com/)) {
		contentObject.embed.color = 0xFF4500;
		contentObject.embed.footer.icon_url = 'https://i.imgur.com/F66Nd8H.png';
		// TODO: fetch author's avatar and display it in author.icon_url
	}

	if (feedURL.match(/^https?:\/\/nitter/)) {
		delete contentObject.embed;
		contentObject.content = post.link.replace(/nitter.*?\//, 'twitter.com/').replace(/[?#].*$/, '');
	}

	return contentObject;
}

export default new EventListener('ready', ({client, db}) => {
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
			const feedChannelID = storedFeed.channelId;
			log.info(`Feed ${storedFeed.url}: Latest check is`, latestDate);
			await Promise.all(rssFeed.items.map(async post => {
				const itemDate = new Date(post.isoDate);
				log.info(`Feed ${storedFeed.url}: item ${post.guid}:`, itemDate, post);
				// If this item is from after the last check, process it
				if (itemDate > storedFeed.lastCheck) {
					log.info(`Feed ${storedFeed.url}: item ${post.guid}: sending message`);
					const contentObject = buildRssMessageContent(post, storedFeed.url);
					try {
						const message = await client.createMessage(feedChannelID, contentObject);
						// If this is an announcement channel, publish the message
						if (message.channel instanceof NewsChannel) {
							await message.crosspost();
						}
					} catch (error) {
						log.error('Failed to post feed in RSS Feed event.', error);
					}
					// TODO: Here we can check the DB to know if anything in post.title matches a channel name
					// and if so post it there, but that has to be mapped by a human because channel names can get weird
				}
				// Check if this is the latest post we've seen yet
				if (itemDate > latestDate) {
					log.info(`Feed ${storedFeed.url}: item ${post.guid}: greater than current latestDate`, latestDate);
					latestDate = itemDate;
				}
			}));

			// update the DB with the date of the latest post we found
			const query = {name: storedFeed.name};
			const update = {
				$set: {
					lastCheck: latestDate,
				},
			};
			log.info(`Feed ${storedFeed.url}: updating lastCheck to`, latestDate);
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
