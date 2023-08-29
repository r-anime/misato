// Edits the message into an embed and logs the old content in #bot-log
import {Command} from 'yuuko';
const {TEMP_LOGGING_CHANNEL_ID} = process.env;

const command = new Command('embededit', async (msg, args, context) => {
	if (args.length < 2) {
		return context.sendHelp(msg, context);
	}

	const channelId = args[0];
	const messageId = args[1];
	const newMessageContent = args.slice(2).join(' ');
	const oldMessage = await context.client.getMessage(channelId, messageId).catch(() => {});

	// log the old content just in case
	if (oldMessage) {
		let oldContent;
		// If the message is an embed show an embed message
		if (oldMessage.embeds.length > 0) {
			oldContent = {
				embed: {
					description: oldMessage.embeds[0].description,
				},
			};
		} else {
			oldContent = oldMessage.content;
		}
		context.client.createMessage(TEMP_LOGGING_CHANNEL_ID, oldContent).catch(() => {});
	}
	// same reason as in .embedsay
	if (newMessageContent.length > 4000) {
		msg.channel.createMessage('Message is too big!').catch(() => {});
		return;
	}

	// edit the message
	context.client.editMessage(channelId, messageId, {
		embed: {
			description: newMessageContent,
		},
		content: '',
	}).catch(() => {});
}, {permissions: ['manageMessages']});
command.help = {
	args: '<channel or thread ID> <message ID> <message text...>',
	desc: `Edits the given message to have the given content wrapped in an embed. Logs the previous content in <#${TEMP_LOGGING_CHANNEL_ID}>.`,
};
export default command;
