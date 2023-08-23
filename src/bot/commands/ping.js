// Tests the bot's response time.
// Shows the current commit hash and repo URL

import createLogger from 'another-logger';
import {Command} from 'yuuko';
import childProcess from 'child_process';

const {GIT_COMMIT_HASH, GIT_REPO_URI} = process.env;

const log = createLogger({label: 'cmd:ping'});

let commitHash = GIT_COMMIT_HASH;
if (!commitHash) {
	childProcess.exec('git rev-parse --short HEAD', (err, stdout) => {
		if (err) {
			return;
		}
		commitHash = stdout.trim();
	});
}

let gitRepoURI = GIT_REPO_URI;
if (!gitRepoURI) {
	childProcess.exec('git remote get-url origin', (err, stdout) => {
		if (err) {
			log.warn('Failed to fetch git remote URI:', err);
			return;
		}
		gitRepoURI = stdout.trim().replace(/\.git$/, '');
	});
}

const command = new Command('ping', async (msg, args, {prefix, client}) => {
	let messageContent = 'Pong!';
	if (commitHash != null) {
		messageContent += `\nCommit: ${commitHash}`;
	}
	if (gitRepoURI != null) {
		messageContent += `\nRepo: <${gitRepoURI}>`;
	}
	// prefix is shown for clarity, but not if a mention was used as the prefix,
	// because that doesn't show up nicely (logic stolen from yuuko's `help`)
	messageContent += `\nUse \`${prefix.match(client.mentionPrefixRegExp) ? '' : prefix}help\` for a list of commands.`;

	const then = Date.now();
	const newMsg = await msg.channel.createMessage(messageContent);
	newMsg.edit(newMsg.content.replace('Pong!', `Pong! (${Date.now() - then}ms REST round-trip)`));
});
command.help = {
	desc: 'Pings the bot and shows how long it takes to send a response. This will also display the current commit hash as well as the repo URL',
};
export default command;
