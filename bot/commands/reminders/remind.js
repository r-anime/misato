// Sets reminders for the future. Actually sending the messages later is handled
// in bot/reminder.js but will probably be moved later.

const {Command} = require('yuuko');
const log = require('another-logger');

module.exports = new Command('remind', async (message, args, context) => {
	if (!args.length) {
		return context.sendHelp(message, context);
	}
	const {db} = context;

	// TODO: actually parse a date from arguments
	const due = new Date(Date.now() + 1000 * 60); // one minute from now
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
