// Shows the server avatar of the user provided

import {Command} from 'yuuko';
import {parseGuildMember} from '../../util/discord';

const command = new Command('avatar', async (msg, args) => {
	const MAX_AVATAR_IMAGE_SIZE = 512;

	if (args.length === 0) {
		msg.channel.createMessage(`${msg.member.avatarURL.split('?size=')[0]}?size=${MAX_AVATAR_IMAGE_SIZE}`).catch(() => {});
		return;
	}
	const [member] = await parseGuildMember(args[0], msg.channel.guild, msg.member);
	if (!member) {
		msg.channel.createMessage('Member not found, check if what you\'re using is correct or try using an ID.').catch(() => {});
		return;
	}

	msg.channel.createMessage(`${member.avatarURL.split('?size=')[0]}?size=${MAX_AVATAR_IMAGE_SIZE}`).catch(() => {});
});
command.help = {
	args: '[user]',
	desc: 'Shows your server avatar, or the server avatar of the given user.',
};
export default command;
