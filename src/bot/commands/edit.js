// Edits the message and logs the old content in #bot-log
import {Command} from 'yuuko';

const botLogChannelId = '284412480833191936'; // botlog text channel TODO: Change this to a file

const command = new Command('edit', async (msg, args, context) => {
	if (args.length < 2) {
		return context.sendHelp(msg, context);
	}

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
command.help = {
	args: '<channel ID> <message ID> <message text...>',
	desc: `Edits the given message to have the given content. Logs the previous content in <#${botLogChannelId}>.`,
};
export default command;
