// Shows the server avatar of the user provided

import {Command} from 'yuuko';
import {AVATAR_IMAGE_SIZE, parseGuildMember} from '../../util/discord';

function resizeAvatarURL (url, size) {
	return `${url.split('?size=')[0]}?size=${size}`;
}

const command = new Command('avatar', async (msg, args, {sendMessage}) => {
	if (args.length === 0) {
		sendMessage(msg, resizeAvatarURL(msg.member.avatarURL, AVATAR_IMAGE_SIZE)).catch(() => {});
		return;
	}
	const [member] = await parseGuildMember(args.join(' '), msg.channel.guild, msg.member);
	if (!member) {
		sendMessage(msg, 'Member not found, check if what you\'re using is correct or try using an ID.').catch(() => {});
		return;
	}

	sendMessage(msg, resizeAvatarURL(member.avatarURL, AVATAR_IMAGE_SIZE)).catch(() => {});
});
command.help = {
	args: '[user]',
	desc: 'Shows your server avatar, or the server avatar of the given user.',
};
export default command;
