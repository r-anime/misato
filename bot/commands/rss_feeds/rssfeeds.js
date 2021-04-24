const {Command} = require('yuuko');

module.exports = new Command('rssfeeds', async (message, args, context) => {
	const {db} = context;
	const collection = db.collection('rssFeeds');
	let str = '';
	const feeds = await collection.find().toArray();

	if (feeds.length === 0) {
		message.channel.createMessage('No feeds found.').catch(() => { });
		return;
	}

	for (const feed of feeds) {
		const channelName = context.client.getChannel(feed.channelId).name;
		str += `Feed: **${feed.rssFeedName}**\nChannel: **${channelName}**\nURL: ${feed.rssFeedUrl} \n \n`;
	}

	message.channel.createMessage(str).catch(() => { });
}, {
	permissions: [
		'manageMessages',
	],
});

module.exports.help = {
	args: '',
	desc: 'Lists all RSS feeds the bot is tracking.',
};
