// Lists all your pending reminders.

const {Command} = require('yuuko');
const log = require('another-logger');

module.exports = new Command(['remindlist', 'reminderlist', 'listreminders'], async (message, args, {db}) => {
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
