const {Command} = require('yuuko');
const log = require('another-logger')({label: 'command:createrssfeed'});

module.exports = new Command('createrssfeed', async (message, args, context) => {
	if (!args.length || args.length < 3) {
		return context.sendHelp(message, context);
	}

	const [rssFeedName, rssFeedUrl, channelId] = args;
	const {db} = context;
	const collection = db.collection('rssFeeds');

	// try to get the channel
	// NOTE: Although it reminds the user to make sure the channel is visible, it would still be able to find a channel regardless of its visiblity (but not read its contents)
	try {
		context.client.getChannel(channelId) || await context.client.getRESTChannel(channelId);
	} catch (error) {
		message.channel.createMessage('Couldn\'t find the channel with the specified ID. Please make sure it is visible to me and the ID is correct.').catch(() => {});
		log.error(error);
	}

	// Check if there isn't a feed with that name already in use
	const previousFeed = await collection.findOne({rssFeedName}).catch(() => {});

	if (previousFeed) {
		message.channel.createMessage('There is already a feed with that name.').catch(() => {});
		return;
	}

	// Create a feed and store it in DB
	const feed = {
		rssFeedName,
		rssFeedUrl,
		channelId,
		lastCheck: new Date(),
	};

	try {
		// Insert information to database
		await collection.insertOne(feed, {ignoreUndefined: true});
	} catch (error) {
		message.channel.createMessage('Could not write feed to database. Have a developer check the logs, this should not happen.').catch(() => {});
		log.error(error);
		log.error('Rejected document:', feed);
		return;
	}

	message.channel.createMessage(`Feed ${rssFeedName} created successfully.`);
}, {
	permissions: [
		'manageMessages',
	],
});

module.exports.help = {
	args: '<rssFeedName> <rssFeedUrl> <channelId>',
	desc: 'Creates an RSS feed from a given URL that will post new content every 60 seconds on the given channel.',
};
