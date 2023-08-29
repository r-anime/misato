import {EventListener} from 'yuuko';
import {formatDateRelative} from '../util/discord';

const {TEMP_GUILD_ID, TEMP_LOGGING_CHANNEL_ID} = process.env;

export default new EventListener('guildBanAdd', (guild, member, {db, client}) => {
	setTimeout(async () => {
		if (guild.id !== TEMP_GUILD_ID) return;
		if (member.bot) return;

		let content = `User **<@!${member.id}> (${member.username}#${member.discriminator})** has been`;
		// Find an unrevoked ban if any
		const ban = await db.collection('bans').findOne({
			guildID: guild.id,
			userID: member.id,
			revokeDate: {$exists: false},
			autoRevokeDate: {$exists: false},
		});

		if (ban) {
			if (ban.expirationDate) {
				content = `${content} banned and will be unbanned ${formatDateRelative(new Date(ban.expirationDate))}`;
			} else {
				content = `${content} permabanned`;
			}
		} else {
			content = `${content} manually permabanned`;
		}

		client.createMessage(TEMP_LOGGING_CHANNEL_ID, {
			content,
		}).catch(() => {});
	}, 5000);
});
