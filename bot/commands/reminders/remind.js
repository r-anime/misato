// Sets reminders for the future. Actually sending the messages later is handled
// in bot/reminder.js but will probably be moved later.

const {Command} = require('yuuko');
const log = require('another-logger');

// TODO: There's gotta be a better way to do this
const msPerUnit = {
	m: 60 * 1000,
	min: 60 * 1000,
	mins: 60 * 1000,
	h: 60 * 60 * 1000,
	hr: 60 * 60 * 1000,
	hour: 60 * 60 * 1000,
	hours: 60 * 60 * 1000,
	d: 24 * 60 * 60 * 1000,
	day: 24 * 60 * 60 * 1000,
	days: 24 * 60 * 60 * 1000,
	w: 7 * 24 * 60 * 60 * 1000,
	wk: 7 * 24 * 60 * 60 * 1000,
	wks: 7 * 24 * 60 * 60 * 1000,
	week: 7 * 24 * 60 * 60 * 1000,
	weeks: 7 * 24 * 60 * 60 * 1000,
	mo: 30 * 24 * 60 * 60 * 1000,
	month: 30 * 24 * 60 * 60 * 1000,
	months: 30 * 24 * 60 * 60 * 1000,
	y: 365 * 24 * 60 * 60 * 1000,
	year: 365 * 24 * 60 * 60 * 1000,
	years: 365 * 24 * 60 * 60 * 1000,
};
/**
 * Returns the number of milliseconds represented by a human-readable duration
 * specifier string, or `null` if the string is not a duration specifier.
 * @param {string} str
 * @returns {number | null}
 */
function parseDurationSpecifier (str) {
	if (!str) return null;
	const match = str.match(/^(\d+)(m|mins?|minutes?|h|hr|hours?|d|days?|w|wks?|weeks?|mo|months?|y|years?)$/i);
	if (!match) return null;
	return parseInt(match[1], 10) * msPerUnit[match[2]];
}

module.exports = new Command('remind', async (message, args, context) => {
	if (!args.length) {
		return context.sendHelp(message, context);
	}
	const {db} = context;

	// Parse date from initial arguments
	let msIntoFuture = 0;
	let timeAddition;
	while ((timeAddition = parseDurationSpecifier(args[0])) != null) {
		msIntoFuture += timeAddition;
		args.shift();
	}
	if (msIntoFuture === 0) {
		message.channel.createMessage('Tell me how long to wait before reminding you! Format it like "1h 30m" - units from minutes to years are supported.').catch(() => {});
		return;
	}
	const due = new Date(Date.now() + msIntoFuture);
	log.debug('due:', due);

	// Reminder's text is just the entire rest of the message
	const text = args.join(' ');

	// Add the reminder to the database
	try {
		await db.collection('reminders').insertOne({
			userID: message.author.id,
			channelID: message.channel.id,
			requested: new Date(),
			due,
			text,
		});
	} catch (error) {
		log.error('Error writing new reminder:', error);
		message.channel.createMessage('There was an error creating your reminder. Try again or contact a bot developer.');
	}

	// Send confirmation, throw away any possible errors
	message.channel.createMessage(`Reminder created for ${due.toLocaleString()}.`).catch(() => {});
});
module.exports.help = {
	desc: "Sets a reminder that you'll get pinged for in the future. In development; currently doesn't take a time and always sets the reminder for one minute in the future.",
	args: '<optional message...>',
};
