// Command to set reminders in the future.

const {Command} = require('yuuko');
const log = require('another-logger');

module.exports = new Command('remind', async (message, args, {db}) => {
	// TODO: actually parse a date from arguments
	const due = new Date(Date.now() + 1000 * 60); // one minute from now
	const text = args.join(' ');
	try {
		await db.collection('reminders').insertOne({
			userID: message.author.id,
			channelID: message.channel.id,
			requested: new Date(),
			due,
			text,
		});
		await message.channel.createMessage(`Reminder created for ${due.toLocaleString()}.`);
	} catch (error) {
		log.error(error);
	}
});
