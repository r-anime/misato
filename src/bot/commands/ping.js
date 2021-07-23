// Tests the bot's response time.
// Shows the current commit hash and repo URL

import {Command} from 'yuuko';
import childProcess from 'child_process';

let commitHash;
childProcess.exec('git rev-parse --short HEAD', (err, stdout) => {
	if (err) {
		commitHash = 'Unknown';
		return;
	}
	commitHash = stdout.trim();
});

const command = new Command('ping', async msg => {
	const then = Date.now();
	const newMsg = await msg.channel.createMessage(`Pong!\nCommit: ${commitHash}\nRepo: <https://github.com/r-anime/discord-mod-bot>`);
	newMsg.edit(newMsg.content.replace('Pong!', `Pong! (${Date.now() - then}ms)`));
});
command.help = {
	desc: 'Pings the bot and shows how long it takes to send a response. This will also display the current commit hash as well as the repo URL',
};
export default command;
