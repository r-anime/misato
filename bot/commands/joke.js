// Fetches a joke JSON from https://github.com/15Dkatz/official_joke_api
// and posts it in chat for moderate amounts of fun.

const {Command} = require('yuuko');
const fetch = require('node-fetch');

module.exports = new Command('joke', async msg => {
	await fetch('https://official-joke-api.appspot.com/random_joke')
		.then(res => res.json())
		.then(data => {
			msg.channel.createMessage(`${data.setup}\n${data.punchline}`);
		});
});

module.exports.help = {
	args: '',
	desc: 'Fetches a random joke from https://github.com/15Dkatz/official_joke_api',
};
