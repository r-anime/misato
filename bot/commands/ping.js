// Tests the bot's response time.

const {Command} = require('yuuko');

module.exports = new Command('ping', async msg => {
	const then = Date.now();
	const newMsg = await msg.channel.createMessage('Pong!');
	newMsg.edit(`${newMsg.content} (${Date.now() - then}ms)`);
});
module.exports.help = {
	desc: 'Pings the bot and shows how long it takes to send a response.',
};
