// Checks for pending reminders every so often and sends out reminder messages
// while cleaning them from the DB.

import log from 'another-logger';
import {EventListener} from 'yuuko';

import {blockquote} from '../util/formatting';

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

export default new EventListener('ready', ({client, db}) => {
	const collection = db.collection('reminders');

	// This function calls itself every 30 seconds as long as the bot is running.
	// TODO: This bit should really be moved to the web server part, and reminders should be sent in response to
	//       IPC broadcasts rather than polling from this process. This change will make the bot process future-proof in
	//       case sharding is needed in the future.
	async function checkReminders () {
		// Fetch reminders from the database that have become due since the last check
		const now = new Date();
		const reminders = await collection.find({due: {$lt: now}}).toArray();
		log.debug('Due reminders:', reminders);

		try {
			// Delete the reminders we're about to send from the database, throwing if it fails for some reason
			await collection.deleteMany({due: {$lt: now}});

			// Queue each reminder to be sent
			// We don't need to await each message, since we already deleted the records from the DB there won't be dupes
			reminders.forEach(reminder => sendReminder(client, reminder).catch(() => {}));
		} catch (error) {
			log.error('Error deleting due reminders from database (reminders not sent):', error);
		}
	}

	setInterval(() => {
		if (client.ready) {
			checkReminders().catch(log.error);
		} else {
			log.warn('Client disconnected while trying to send reminders; skipping');
		}
	}, 30 * 1000);
}, {
	once: true,
});
