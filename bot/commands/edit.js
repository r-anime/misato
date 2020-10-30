// Edits the message and logs the old content in #bot-log
const {Command} = require('yuuko');

module.exports = new Command('edit', async (msg, args, context) => {
	if (args.length < 2) {
		msg.channel.createMessage(`Command can be used with: \`${context.prefix}say [channelId] [messageId] [text...]\`
Be sure to use the first line and not leave any whitespace/newline immediately after the channel/message IDs.`).catch(() => {});
		return;
	}

	const botLogChannelId = '284412480833191936'; // botlog text channel TODO: Change this to a file
	const channelId = args[0];
	const messageId = args[1];
	const newMessageContent = args.slice(2, args.length).join(' ');
	const oldMessage = await context.client.getMessage(channelId, messageId).catch(() => {});

	// log the old content just in case
	context.client.createMessage(botLogChannelId, oldMessage.content).catch(() => {});
	// same reason as in .say
	if (newMessageContent.length > 1950) {
		msg.channel.createMessage('Message is too big!').catch(() => {});
		return;
	}

	// edit the message
	context.client.editMessage(channelId, messageId, newMessageContent).catch(() => {});
}, {permissions: ['manageMessages']});

// TODO: add args
module.exports.help = {
	args: '',
	desc: 'Edits the message with the given ID, and logs the old content in #bot-log',
};
