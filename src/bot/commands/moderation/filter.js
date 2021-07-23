import {Command} from 'yuuko';
import config from '../../../../config';

function filterConfigURL (guildID) {
	return `${config.web.host}/guilds/${guildID}/filter`;
}

export default new Command(['filter', 'filters'], msg => {
	const url = filterConfigURL(msg.channel.guild.id);
	msg.channel.createMessage(`Edit the message filter here: <${url}>`).catch(() => {});
}, {
	guildOnly: true,
	permissions: [
		'manageMessages',
	],
});
