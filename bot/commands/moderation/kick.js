const {Command} = require('yuuko');
const {parseGuildMember} = require('../../util/discord');

module.exports = new Command('kick', async (message, args) => {
	const [member, reason] = parseGuildMember(args.join(' '), message.channel.guild);
	if (!member) {
		message.channel.createMessage('Not sure who you want me to ban. Start your message with a mention, exact tag, or user ID.').catch(() => {});
		return;
	}
	try {
		await member.kick(reason);
		message.channel.createMessage('Kicked!').catch(() => {});
	} catch (_) {
		message.channel.createMessage('Failed to kick. Are my permissions set up correctly?').catch(() => {});
	}
}, {
	permissions: [
		'kickMembers',
	],
});
