// Checks for pending reminders every so often and sends out reminder messages
// while cleaning them from the DB.

const log = require('another-logger');
const {EventListener} = require('yuuko');

const {blockquote} = require('../util/formatting');

/**
 * Formats a reminder into a string for sending as a message.
 * @param {object} reminder
 * @returns {string}
 */
function formatReminder (reminder) {
	return `${reminder.text ? `${blockquote(reminder.text)}\n` : ''}<@!${reminder.userID}>, here's your reminder from ${reminder.requested.toLocaleString()}.`;
}

/**
 * Sends a reminder message for the given reminder. Sends to the same channel
 * the reminder was created in, or the creator's DMs failing that. May still
 * fail and throw an error if the user has DMs disabled.
 * @param {Client} client The Discord client used to send the message
 * @param {object} reminder
 */
async function sendReminder (client, reminder) {
	const text = formatReminder(reminder);
	try {
		// Send the message to the same channel the reminder was made in
		await client.createMessage(reminder.channelID, text);
	} catch (error) {
		// If that didn't work, try sending it to the user's DM channel instead
		const channel = await client.getDMChannel(reminder.userID);
		// If the first channel we tried was already the DM channel, don't waste a request trying again, just rethrow
		if (channel.id === reminder.channelID) {
			throw error;
		}
		await channel.createMessage(text);
	}
}

module.exports = new EventListener('ready', ({client, db}) => {
	const collection = db.collection('reminders');

	// This function calls itself every 30 seconds as long as the bot is running.
	// TODO: This bit should really be moved to the web server part, and reminders should be sent in response to
	//       IPC broadcasts rather than polling from this process. This change will make the bot process future-proof in
	//       case sharding is needed in the future.
	(async function checkReminders () {
		log.debug('Checking reminders');

		// Fetch reminders from the database that have become due since the last check
		const reminders = await collection.find({due: {$lt: new Date()}}).toArray();
		log.debug(reminders);

		reminders.forEach(reminder => {
			// Send the reminder, but don't wait to complete, and silently throw away any errors)
			sendReminder(client, reminder).catch(() => {});
			// Remove the reminder from the database, don't wait to complete, just log on error
			collection.deleteOne({_id: reminder._id}).catch(log.error);
		});

		// Queue this check to run again in 30 seconds
		setTimeout(checkReminders, 30 * 1000);
	})();
});
