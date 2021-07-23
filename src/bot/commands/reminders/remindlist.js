// Lists all your pending reminders.

import {Command} from 'yuuko';
import log from 'another-logger';

const command = new Command(['remindlist', 'reminderlist', 'listreminders'], async (message, args, {db}) => {
	try {
		// Get the latest reminder
		const reminders = await db.collection('reminders').find({userID: message.author.id}).toArray();
		if (!reminders.length) {
			await message.channel.createMessage('No reminders.');
			return;
		}
		message.channel.createMessage(`${reminders.length} reminders.\n${
			// TODO: make this output more useful
			reminders.map(reminder => `- For ${reminder.due.toLocaleString()}`).join('\n')
		}`);
	} catch (error) {
		log.error(error);
	}
});
command.help = {
	desc: 'Lists all your reminders.',
	args: '',
};
export default command;
