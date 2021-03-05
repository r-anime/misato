const {Command} = require('yuuko');
const config = require('../../../config');

function filterConfigURL (guildID) {
	return `${config.web.host}/guilds/${guildID}/filter`;
}

module.exports = new Command(['filter', 'filters'], msg => {
	const url = filterConfigURL(msg.channel.guild.id);
	msg.channel.createMessage(`Edit the message filter here: <${url}>`).catch(() => {});
}, {
	guildOnly: true,
	permissions: [
		'manageMessages',
	],
});
