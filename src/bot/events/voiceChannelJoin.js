import {EventListener} from 'yuuko';
export default new EventListener('voiceChannelJoin', async (member, channel, context) => {
	const voiceRoleId = '336954476315541515'; // TODO: put these in a file for role/channel ids
	const radioRoleId = '710506067943227416';
	const radioChannelId = '290594195687735298'; // radio voice channel
	const botLogChannelId = '284412480833191936'; // botlog text channel
	try {
		if (channel.id === radioChannelId) {
			// remove the wrong role first, if the member somehow has it. If the member already has the role, do nothing
			if (member.roles.includes(voiceRoleId)) await member.removeRole(voiceRoleId, 'Radio Channel Joined');
			if (member.roles.includes(radioRoleId)) return;

			await member.addRole(radioRoleId, 'Joined Voice Channel');
		} else {
			if (member.roles.includes(radioRoleId)) await member.removeRole(radioRoleId, 'Voice Channel Joined');
			if (member.roles.includes(voiceRoleId)) return;

			await member.addRole(voiceRoleId, 'Joined Voice Channel');
		}
	} catch (error) {
		context.client.createMessage(botLogChannelId, `Error in handling voice channel roles (Join) for member ${member.username}#${member.discriminator} in ${channel.name}`).catch(() => {});
	}
});
