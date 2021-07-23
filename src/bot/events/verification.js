const {EventListener} = require('yuuko');
const log = require('another-logger')({label: 'event:verification'});

// Check if members are already verified when being added to a guild
// TODO more verification hardcoding
module.exports = new EventListener('guildMemberAdd', async (guild, member, {db}) => {
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
