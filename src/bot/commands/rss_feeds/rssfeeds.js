import {Command} from 'yuuko';
import {escape} from '../../util/formatting';

const command = new Command('rssfeeds', async (message, args, {client, db}) => {
	const collection = db.collection('rssFeeds');

	const feeds = await collection.find({
		guildId: message.guildID,
		// in DMs, filtering by guild isn't enough; filter to the specific DM
		channelId: message.guildId ? undefined : message.channel.id,
	}).toArray();

	if (!feeds.length) {
		message.channel.createMessage('No feeds found.').catch(() => { });
		return;
	}

	let str = '';
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
command.help = {
	args: '',
	desc: 'Lists all RSS feeds the bot is tracking.',
};
export default command;
