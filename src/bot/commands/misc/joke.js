// Fetches a joke JSON from https://github.com/15Dkatz/official_joke_api
// and posts it in chat for moderate amounts of fun.

import {Command} from 'yuuko';
import fetch from 'node-fetch';

const command = new Command('joke', async msg => {
	try {
		const res = await fetch('https://official-joke-api.appspot.com/random_joke');
		if (res.status !== 200) {
			throw new Error('Error getting joke.');
		}
		const joke = await res.json();
		msg.channel.createMessage(`${joke.setup}\n${joke.punchline}`);
	} catch (err) {
		msg.channel.createMessage(err.message).catch(() => {});
	}
});
command.help = {
	desc: 'Fetches a random joke from <https://github.com/15Dkatz/official_joke_api>',
};
export default command;
