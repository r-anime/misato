const log = require('another-logger');
const {EventListener} = require('yuuko');
const Parser = require('rss-parser');
const rssParser = new Parser();

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
			for (const post of rssFeed.items) {
				if (Date.parse(post.isoDate) > Date.parse(storedFeed.lastCheck)) {
					client.getChannel(storedFeed.channelId).createMessage(post.link).catch(() => {});
					// TODO: Here we can check the DB to know if anything in post.title matches a channel name
					// and if so post it there, but that has to be mapped by a human because channel names can get weird
					// Additionally, we could also make embeds here prettier in the future.
				}
			}

			// update the DB with the date of the last post we checked.
			const query = {name: storedFeed.name};
			const update = {
				$set: {
					lastCheck: new Date(rssFeed.items[0].isoDate),
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
