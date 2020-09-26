const {EventListener} = require('yuuko');
module.exports = new EventListener('voiceChannelSwitch', async (member, newChannel, oldChannel, context) => {
	const voiceRoleId = '336954476315541515'; // TODO: put these in a file for role/channel ids
	const radioRoleId = '710506067943227416';
	const radioChannelId = '290594195687735298'; // radio voice channel
	const botLogChannelId = '284412480833191936'; // botlog text channel
	try {
		if (newChannel.id === radioChannelId) {
			// if the member already has the roles for some reason (e.g: this bot going down);
			// remove the roles and give them the correct one;
			if (member.roles.includes(radioRoleId)) {
				if (member.roles.includes(voiceRoleId)) await member.removeRole(voiceRoleId, 'Radio Channel Switched To');
				return;
			}

			await member.removeRole(voiceRoleId, 'Radio Voice Switched To');
			await member.addRole(radioRoleId, 'Radio Voice Switched To');
		} else {
			if (member.roles.includes(voiceRoleId)) {
				if (member.roles.includes(radioRoleId)) await member.removeRole(radioRoleId, 'Voice Channel Switched To');
				return;
			}

			await member.removeRole(radioRoleId, 'Joined Voice Switched To');
			await member.addRole(voiceRoleId, 'Joined Voice Switched To');
		}
	} catch (error) {
		context.client.createMessage(botLogChannelId, `Error in handling voice channel roles (Switch) for member ${member.username}#${member.discriminator} in ${oldChannel.name}`).catch(() => {});
	}
});
