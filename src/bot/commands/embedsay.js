// Says the contents in the specified channel inside an embed, or in the same channel if no channel is passed

import {Command} from 'yuuko';

const command = new Command('embedsay', async (msg, args, context) => {
	if (!args.length) {
		return context.sendHelp(msg, context);
	}

	// try to get the channel, if none is found just post it in the channel the message was sent
	let channel;
	try {
		channel = context.client.getChannel(args[0].split('\n')[0]) || await context.client.getRESTChannel(args[0]);
	} catch (_) {
		// pass, channel stays undefined
	}

	if (channel) {
		const messageContent = args.slice(1).join(' ');
		// The character limit for embed descriptions is 4096 so I set 4000 to leave room for the IDs though 96 might be overkill
		if (messageContent.length > 4000) {
			msg.channel.createMessage('Message is too big!').catch(() => {});
			return;
		}

		context.client.createMessage(channel.id, {
			embed: {
				description: messageContent,
			},
		}).catch(() => {});
	} else {
		const messageContent = args.join(' ');
		// same as above
		if (messageContent.length > 4000) {
			msg.channel.createMessage('Message is too big!').catch(() => {});
			return;
		}

		context.client.createMessage(msg.channel.id, {
			embed: {
				description: messageContent,
			},
		}).catch(() => {});
		// delete the message from the person that used the say command, if it was sent without a channel argument
		context.client.deleteMessage(msg.channel.id, msg.id, 'EmbedSay Command').catch(() => {});
	}
}, {permissions: ['manageMessages']});
command.help = {
	args: '<channel or thread ID> <message>',
	desc: 'Says the contents passed after the specified channel inside an embed, or in the same channel if no channel is passed.',
};
export default command;
