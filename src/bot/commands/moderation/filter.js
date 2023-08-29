import {Command} from 'yuuko';
const {HOST} = process.env;

function filterConfigURL (guildID) {
	return `${HOST}/guilds/${guildID}/filter`;
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
