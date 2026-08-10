// Sets reminders for the future. Actually sending the messages later is handled
// in bot/reminder.js but will probably be moved later.

import {Command} from 'yuuko';
import log from 'another-logger';
import {formatDateRelative} from '../../util/discord';

// TODO: There's gotta be a better way to do this
const msPerUnit = {
	m: 60 * 1000,
	min: 60 * 1000,
	mins: 60 * 1000,
	minute: 60 * 1000,
	minutes: 60 * 1000,
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
 * specifier string, or `0` if the string is not a duration specifier.
 * And also the string with the duration part stripped
 * @param {string} str
 * @returns {[number, str]}
 */
function parseDurationSpecifier (str) {
	if (!str) return [0, str];
	let time = 0;
	while (true) {
		// match the longer units preferentially
		const match = str.match(/^(\d+)\s*(minutes?|mins?|hours?|hr|h|days?|d|weeks?|wks?|w|months?|mo|m|years?|y)\s*/i);
		if (!match) break;
		time += parseInt(match[1], 10) * msPerUnit[match[2]];
		str = str.slice(match[0].length); // strip duration match
	}
	return [time, str];
}

const command = new Command(['remind', 'remindme'], async (message, args, context) => {
	if (!args.length) {
		return context.sendHelp(message, context);
	}
	const {db} = context;

	// Parse date from initial arguments
	const [msIntoFuture, text] = parseDurationSpecifier(args.join(' '));
	if (msIntoFuture === 0) {
		message.channel.createMessage('Tell me how long to wait before reminding you! Format it like "1h 30m" - units from minutes to years are supported.').catch(() => {});
		return;
	}
	const due = new Date(Date.now() + msIntoFuture);
	log.debug('due:', due);

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
	context.sendMessage(message, `Will remind you ${formatDateRelative(due)}.`).catch(() => {});
});
command.help = {
	desc: "Sets a reminder that you'll get pinged for in the future.",
	args: '<time in "2d 3h 10m" format> [optional message...]',
};
export default command;
