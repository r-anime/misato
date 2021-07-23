// logs the regular users of the server

import {Command} from 'yuuko';

// TODO: first off this doesn't print everything if there's too many elements, also everything else in this sucks
// also good chance this would freeze the bot for a long ass time in production
const command = new Command('regulars', async (msg, args, context) => {
	const channel = context.client.getChannel(args[0]);
	const messages = await channel.getMessages(500000, undefined, args[1]);
	const usernames = messages.map(message => message.author.username);
	const userData = [];
	for (let i = 0; i < usernames.length; i++) {
		const user = {
			username: '',
			messageCount: 0,
		};

		if (i === 0) {
			user.username = usernames[i];
			userData.push(user);
		}

		userData.forEach(u => {
			// if the user doesn't exist, make a new one else just increment the messageCount
			if (!userData.some(e => e.username === usernames[i])) {
				user.username = usernames[i];
				user.messageCount += 1;
				userData.push(user);
			} else if (u.username === usernames[i]) {
				u.messageCount += 1;
			}
		});
	}
	const newArr = userData.filter(user => user.messageCount > 100);
	newArr.sort((a, b) => {
		if (a.messageCount > b.messageCount) {
			return -1;
		}
		if (a.messageCount < b.messageCount) {
			return 1;
		}
		return 0;
	});
	console.log(newArr);
});
command.help = {
	args: '',
	desc: 'Logs the regular users of the server.',
};
export default command;
