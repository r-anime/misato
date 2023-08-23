import {EventListener} from 'yuuko';

const {TEMP_GUILD_ID, TEMP_LEAVING_CHANNEL_ID} = process.env;

export default new EventListener('guildMemberRemove', async (guild, member, {client}) => {
	if (member.bot) return;
	if (guild.id !== TEMP_GUILD_ID) return;

	await client.createMessage(TEMP_LEAVING_CHANNEL_ID, {
		content: `User **<@!${member.id}> (${member.username}#${member.discriminator})** has left the server`,
	}).catch(() => {});
});
