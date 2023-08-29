import {EventListener} from 'yuuko';
import createLogger from 'another-logger';
const log = createLogger({label: 'event:verification'});
import {formatDate, formatDateRelative} from '../util/discord';

const {TEMP_GUILD_ID, TEMP_JOINING_CHANNEL_ID} = process.env;

// Check if members are already verified when being added to a guild
// TODO more verification hardcoding
export default new EventListener('guildMemberAdd', async (guild, member, {db, client}) => {
	if (member.bot) return;
	if (guild.id !== TEMP_GUILD_ID) return;

	client.createMessage(TEMP_JOINING_CHANNEL_ID, {
		content: `User **<@!${member.id}> (${member.username}#${member.discriminator})** has joined \nAccount Created:  ${formatDate(new Date(member.createdAt))} (${formatDateRelative(new Date(member.createdAt))})`,
	}).catch(() => {});

	let roleID;
	try {
		const verificationConfig = await db.collection('verificationConfiguration').findOne({
			guildID: guild.id,
		});
		if (!verificationConfig) {
			return;
		}
		roleID = verificationConfig.roleID;
	} catch (error) {
		log.error(`Database error fetching verification config for guild ${guild.id}:`, error);
		return;
	}

	const count = await db.collection('redditAccounts').countDocuments({userID: member.id});
	if (!count) {
		return;
	}
	try {
		await member.addRole(roleID);
		log.debug(`User <@${member.id}> already verified, added role`);
	} catch (error) {
		log.error(`Failed to add role to user <@${member.id}> already verified\n`, error);
	}
});
