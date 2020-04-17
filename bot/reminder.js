// Checks for pending reminders every so often and sends out reminders while cleaning them from the DB.

const log = require('another-logger');
const {blockquote} = require('./util/formatting');

function formatReminder (reminder) {
	return `${blockquote(reminder.text)}\n<@!${reminder.userID}>, here's your reminder from ${reminder.requested.toLocaleString()}.`;
}

async function sendReminder (client, reminder) {
	const text = formatReminder(reminder);
	try {
		await client.createMessage(reminder.channelID, text);
	} catch (error) {
		const channel = await client.getDMChannel(reminder.userID);
		if (channel.id === reminder.channelID) {
			throw error;
		}
		await channel.createMessage(text);
	}
}

module.exports = ({client, db}) => {
	const collection = db.collection('reminders');
	(async function checkReminders () {
		log.info('Checking reminders');
		const reminders = await collection.find({due: {$lt: new Date()}}).toArray();
		log.info(reminders);
		reminders.forEach(reminder => {
			sendReminder(client, reminder).catch(error => log.warn('Reminder failed to send:', reminder, error));
			collection.deleteOne({_id: reminder._id}).catch(log.error);
		});

		setTimeout(checkReminders, 30 * 1000);
	})();
};
