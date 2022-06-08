import {EventListener} from 'yuuko';
import config from '../../../config';

export default new EventListener('guildMemberUpdate', (guild, member, oldMember, {client}) => {
	if (member.bot) return;
	if (guild.id !== config.TEMP_guildID) return;

	if (oldMember.premiumSince !== null && member.premiumSince === null) {
		client.createMessage(config.TEMP_loggingChannelID, {
			content: `User **<@${member.id}> (${member.username}#${member.discriminator})** has stopped boosting`,
			allowedMentions: {
				users: false,
			},
		}).catch(() => {});
	}
});
