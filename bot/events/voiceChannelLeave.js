const {EventListener} = require('yuuko');
module.exports = new EventListener('voiceChannelLeave', async (member, oldChannel, context) => {
	const voiceRoleId = '336954476315541515'; // TODO: put these in a file for role/channel ids
	const radioRoleId = '710506067943227416';
	const botLogChannelId = '284412480833191936'; // botlog text channel
	try {
		// remove every role the member may have (if the bot went down there could be a mismatch of roles)
		if (member.roles.includes(radioRoleId)) await member.removeRole(radioRoleId, 'Voice/Radio Channel Left');
		if (member.roles.includes(voiceRoleId)) await member.removeRole(voiceRoleId, 'Voice/Radio Channel Left');
	} catch (error) {
		context.client.createMessage(botLogChannelId, `Error in handling voice channel roles (Leave) for member ${member.username}#${member.discriminator} in ${oldChannel.name}`).catch(() => {});
	}
});
