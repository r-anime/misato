// Says the contents in the specified channel, or in the same channel if no channel is passed

const {Command} = require('yuuko');

module.exports = new Command('say', async (msg, args, context) => {
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
		const messageContent = args.slice(1, args.length).join(' ');
		// because .edit requires an extra argument, I'm giving us some breathing room here to not cause a deadlock
		// where a high char count message would not be editable (the user would not be able to send the command message)
		// even if keeping the same char count.
		// Can probably optimize this further to be the exact char count the edit command would take up but different channel IDs
		// can vary in size iirc (in my tests the total length for .edit was 43 on my server)
		if (messageContent.length > 1950) {
			msg.channel.createMessage('Message is too big!').catch(() => {});
			return;
		}

		context.client.createMessage(channel.id, messageContent).catch(() => {});
	} else {
		const messageContent = args.slice(0, args.length).join(' ');
		// same as above
		if (messageContent.length > 1950) {
			msg.channel.createMessage('Message is too big!').catch(() => {});
			return;
		}

		context.client.createMessage(msg.channel.id, messageContent).catch(() => {});
		// delete the message from the person that used the say command, if it was sent without a channel argument
		context.client.deleteMessage(msg.channel.id, msg.id, 'Say Command').catch(() => {});
	}
}, {permissions: ['manageMessages']});

// TODO: add args
module.exports.help = {
	args: '<channel> <message>',
	desc: 'Says the contents passed after the specified channel, or in the same channel if no channel is passed.',
};
