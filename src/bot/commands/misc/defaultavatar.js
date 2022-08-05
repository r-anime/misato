// Shows the default avatar of the user provided

import {Command} from 'yuuko';
import {AVATAR_IMAGE_SIZE, parseUser} from '../../util/discord';

const command = new Command('defaultavatar', async (msg, args) => {
	if (args.length === 0) {
		msg.channel.createMessage(msg.author.dynamicAvatarURL('', AVATAR_IMAGE_SIZE)).catch(() => {});
		return;
	}
	const [user] = await parseUser(args.join(' '), msg.channel.guild, msg.author);
	if (!user) {
		msg.channel.createMessage('Member not found, check if what you\'re using is correct or try using an ID.').catch(() => {});
		return;
	}

	msg.channel.createMessage(user.dynamicAvatarURL('', AVATAR_IMAGE_SIZE)).catch(() => {});
});
command.help = {
	args: '[user]',
	desc: 'Shows your default avatar, or the default avatar of the given user.',
};
export default command;
