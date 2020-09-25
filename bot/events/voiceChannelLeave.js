const {EventListener} = require('yuuko');
module.exports = new EventListener('voiceChannelLeave', user => {
	const voiceRoleId = '336954476315541515'; // TODO: put these in a file for role/channel ids
	const radioRoleId = '710506067943227416';

	// remove every role the user may have (if the bot went down there could be a mismatch of roles)
	if (user.roles.includes(radioRoleId)) user.removeRole(radioRoleId, 'Voice/Radio Channel Left');
	if (user.roles.includes(voiceRoleId)) user.removeRole(voiceRoleId, 'Voice/Radio Channel Left');
});
