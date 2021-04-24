const {Command} = require('yuuko');
const log = require('another-logger')({label: 'command:deleterssfeed'});

module.exports = new Command('deleterssfeed', async (message, args, context) => {
	const {db} = context;
	const collection = db.collection('rssFeeds');
	const rssFeedName = args[0];

	await collection.deleteOne({rssFeedName})
		.then(result => {
			if (result.deletedCount === 0) {
				message.channel.createMessage('Could not find anything to delete. Did you spell the name of the feed correctly?').catch(() => {});
			} else {
				message.channel.createMessage(`RSS feed **${rssFeedName}** has been deleted.`).catch(() => {});
			}
		})
		.catch(error => {
			message.channel.createMessage('Couldn\'t delete feed. Have a developer check the logs, this should not happen.').catch(() => {});
			log.error(error);
		});
}, {
	permissions: [
		'manageMessages',
	],
});

module.exports.help = {
	args: '<rssFeedName>',
	desc: 'Deletes RSS feed with given name.',
};
