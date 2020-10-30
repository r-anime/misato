// Says the contents in the specified channel, or in the same channel if no channel is passed

const {Command} = require('yuuko');

module.exports = new Command('say', async (msg, args, context) => {
	// try to get the channel, if none is found just post it in the channel the message was sent
	// let channel;
	// throws an error if no argument is supplied, has to be caught
	// try {
	// channel = context.client.getChannel(args[0]);
	// } catch (err) {
	// channel = undefined;
	// }
	const channel = await context.client.getChannel(args[0]).catch(() => console.log('test'));
	console.log('test2');

	if (channel) {
		const messageContent = args.slice(1, args.length).join(' ');
		context.client.createMessage(channel.id, messageContent).catch(() => {});
	} else if (args.length > 0) {
		const messageContent = args.slice(0, args.length).join(' ');
		context.client.createMessage(msg.channel.id, messageContent).catch(() => {});
		// delete the message from the person that used the say command, if it was sent without a channel argument
		context.client.deleteMessage(msg.channel.id, msg.id, 'Say Command');
	} else {
		msg.channel.createMessage(`Command can be used with: \`${context.prefix}say [channelId] [text...]\``).catch(() => {});
	}
}, {permissions: ['manageMessages']});

// TODO: add args
module.exports.help = {
	args: '',
	desc: 'Says the contents in the specified channel, or in the same channel if no channel is passed',
};
