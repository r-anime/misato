const {Command} = require('yuuko');
const {parseGuildMember} = require('../../util/discord');

module.exports = new Command('ban', async (message, args) => {
	const [member, reason] = parseGuildMember(args.join(' '), message.channel.guild);
	if (!member) {
		message.channel.createMessage('Not sure who you want me to ban. Start your message with a mention, exact tag, or user ID.').catch(() => {});
		return;
	}
	// TODO: accept time, store bans in db, etc
	try {
		await member.ban(0, reason);
		message.channel.createMessage('Banned!').catch(() => {});
	} catch (_) {
		message.channel.createMessage('Failed to ban. Are my permissions set up correctly?').catch(() => {});
	}
}, {
	permissions: [
		'banMembers',
	],
});
