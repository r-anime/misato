// Shows the avatar of the user provided

const {Command} = require('yuuko');
const {parseUser} = require('../../util/discord');

module.exports = new Command('avatar', async (msg, args) => {
	if (args.length === 0) {
		msg.channel.createMessage(msg.author.avatarURL).catch(() => {});
		return;
	}
	const [member] = await parseUser(args.join(' '), msg.channel.guild, msg.author);
	if (!member) {
		msg.channel.createMessage('Member not found, check if what you\'re using is correct or try using an ID.').catch(() => {});
		return;
	}
	msg.channel.createMessage(member.avatarURL).catch(() => {});
});

module.exports.help = {
	args: '[user]',
	desc: 'Shows your avatar, or the avatar of the given user.',
};
