const {Command} = require('yuuko');
const {escape} = require('../../util/formatting');

module.exports = new Command('rssfeeds', async (message, args, {client, db}) => {
	const collection = db.collection('rssFeeds');
	let str = '';
	const feeds = await collection.find().toArray();

	if (feeds.length === 0) {
		message.channel.createMessage('No feeds found.').catch(() => { });
		return;
	}

	for (const feed of feeds) {
		const channelName = client.getChannel(feed.channelId).name;
		str += `Feed: **${escape(feed.name)}**\nChannel: **${escape(channelName)}**\nURL: <${feed.url}> \n \n`;
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
