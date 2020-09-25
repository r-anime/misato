const {EventListener} = require('yuuko');
module.exports = new EventListener('voiceChannelSwitch', (user, newChannel) => {
	const voiceRoleId = '336954476315541515'; // TODO: put these in a file for role/channel ids
	const radioRoleId = '710506067943227416';
	const radioChannelId = '290594195687735298';

	if (newChannel.id === radioChannelId) {
		// if the user already has the roles for some reason (e.g: this bot going down);
		// remove the roles and give them the correct one;
		if (user.roles.includes(radioRoleId)) {
			if (user.roles.includes(voiceRoleId)) user.removeRole(voiceRoleId, 'Radio Channel Switched To');
			return;
		}

		user.removeRole(voiceRoleId, 'Radio Voice Switched To');
		user.addRole(radioRoleId, 'Radio Voice Switched To');
	} else {
		if (user.roles.includes(voiceRoleId)) {
			if (user.roles.includes(radioRoleId)) user.removeRole(radioRoleId, 'Voice Channel Switched To');
			return;
		}

		user.removeRole(radioRoleId, 'Joined Voice Switched To');
		user.addRole(voiceRoleId, 'Joined Voice Switched To');
	}
});
