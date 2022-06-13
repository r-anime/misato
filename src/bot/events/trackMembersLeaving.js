import {EventListener} from 'yuuko';
import config from '../../../config';

export default new EventListener('guildMemberRemove', async (guild, member, {client}) => {
	if (member.bot) return;
	if (guild.id !== config.TEMP_guildID) return;

	await client.createMessage(config.TEMP_leavingChannelID, {
		content: `User **<@!${member.id}> (${member.username}#${member.discriminator})** has left the server`,
	}).catch(() => {});
});
