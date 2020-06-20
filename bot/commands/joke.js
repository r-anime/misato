// Fetches a joke JSON from https://github.com/15Dkatz/official_joke_api
// and posts it in chat for moderate amounts of fun.

const {Command} = require('yuuko');
const fetch = require('node-fetch');

module.exports = new Command('joke', async msg => {
	const res = await fetch('https://official-joke-api.appspot.com/random_joke');
	const joke = await res.json();
	msg.channel.createMessage(`${joke.setup}\n${joke.punchline}`);
});

module.exports.help = {
	args: '',
	desc: 'Fetches a random joke from <https://github.com/15Dkatz/official_joke_api>',
};
