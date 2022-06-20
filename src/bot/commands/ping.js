// Tests the bot's response time.
// Shows the current commit hash and repo URL

import createLogger from 'another-logger';
import {Command} from 'yuuko';
import childProcess from 'child_process';

const log = createLogger({label: 'cmd:ping'});

let commitHash = null;
childProcess.exec('git rev-parse --short HEAD', (err, stdout) => {
	if (err) {
		return;
	}
	commitHash = stdout.trim();
});

let gitRepoURI = null;
childProcess.exec('git remote get-url origin', (err, stdout) => {
	if (err) {
		log.warn('Failed to fetch git remote URI:', err);
		return;
	}
	gitRepoURI = stdout.trim().replace(/\.git$/, '');
});

const command = new Command('ping', async msg => {
	let messageContent = 'Pong!';
	if (commitHash != null) {
		messageContent += `\nCommit: ${commitHash}`;
	}
	if (gitRepoURI != null) {
		messageContent += `\nRepo: <${gitRepoURI}>`;
	}

	const then = Date.now();
	const newMsg = await msg.channel.createMessage(messageContent);
	newMsg.edit(newMsg.content.replace('Pong!', `Pong! (${Date.now() - then}ms REST round-trip)`));
});
command.help = {
	desc: 'Pings the bot and shows how long it takes to send a response. This will also display the current commit hash as well as the repo URL',
};
export default command;
