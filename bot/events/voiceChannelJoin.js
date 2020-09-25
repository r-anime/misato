const {EventListener} = require('yuuko');
module.exports = new EventListener('voiceChannelJoin', (user, channel) => {
	const voiceRoleId = '336954476315541515'; // TODO: put these in a file for role/channel ids
	const radioRoleId = '710506067943227416';
	const radioChannelId = '290594195687735298';

	if (channel.id === radioChannelId) {
		// remove the wrong role first, if the user somehow has it. If the user already has the role, do nothing
		if (user.roles.includes(voiceRoleId)) user.removeRole(voiceRoleId, 'Radio Channel Joined');
		if (user.roles.includes(radioRoleId)) return;

		user.addRole(radioRoleId, 'Joined Voice Channel');
	} else {
		if (user.roles.includes(radioRoleId)) user.removeRole(radioRoleId, 'Voice Channel Joined');
		if (user.roles.includes(voiceRoleId)) return;

		user.addRole(voiceRoleId, 'Joined Voice Channel');
	}
});
