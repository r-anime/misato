// Shows the avatar of the user provided

const {Command} = require('yuuko');
const {parseUser} = require('../../util/discord');

module.exports = new Command('avatar', async (msg, args) => {
	const MAX_AVATAR_IMAGE_SIZE = 512;

	if (args.length === 0) {
		msg.channel.createMessage(msg.author.dynamicAvatarURL('', MAX_AVATAR_IMAGE_SIZE)).catch(() => {});
		return;
	}
	const [member] = await parseUser(args.join(' '), msg.channel.guild, msg.author);
	if (!member) {
		msg.channel.createMessage('Member not found, check if what you\'re using is correct or try using an ID.').catch(() => {});
		return;
	}
	msg.channel.createMessage(member.dynamicAvatarURL('', MAX_AVATAR_IMAGE_SIZE)).catch(() => {});
});

module.exports.help = {
	args: '[user]',
	desc: 'Shows your avatar, or the avatar of the given user.',
};
