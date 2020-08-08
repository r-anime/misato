const {EventListener} = require('yuuko');
const log = require('another-logger')({label: 'event:verification'});
const config = require('../../config');

// Check if members are already verified when being added to a guild
// TODO more verification hardcoding
module.exports = new EventListener('guildMemberAdd', async (guild, member, {db}) => {
	if (guild.id !== config.TEMP_guildID) {
		return;
	}
	const count = await db.collection('redditAccounts').countDocuments({userID: member.id});
	if (!count) {
		return;
	}
	try {
		await member.addRole(config.TEMP_roleID);
		log.debug(`User <@${member.id}> already verified, added role`);
	} catch (error) {
		log.error(`Failed to add role to user <@${member.id}> already verified\n`, error);
	}
});
