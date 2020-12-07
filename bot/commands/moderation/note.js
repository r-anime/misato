const log = require('another-logger')({label: 'command:note'});
const {Command} = require('yuuko');
const {parseUser} = require('../../util/discord');

module.exports = new Command('note', async (message, args, {db}) => {
	const [member, reason] = parseUser(args.join(' '), message.channel.guild);
	if (!member) {
		message.channel.createMessage('Not sure who you want me to add the note to. Start your message with a mention, exact tag, or user ID.').catch(() => {});
		return;
	}
	if (!reason) {
		message.channel.createMessage('Not sure what you want the note to say.').catch(() => {});
		return;
	}

	log.debug(member.id, reason);

	// Create the ban record in the database
	const noteRecord = {
		userID: member.id,
		guildID: message.channel.guild.id,
		modID: message.author.id,
		date: new Date(),
		note: reason,
	};
	try {
		// Insert information to database
		await db.collection('notes').insertOne(noteRecord, {ignoreUndefined: true});
	} catch (error) {
		message.channel.createMessage('There was an error writing the ban to the database. Have a developer check the logs, this should not happen.').catch(() => {});
		log.error(error);
		log.error('Rejected document:', noteRecord);
		return;
	}

	message.channel.createMessage(`Left a note on <@${member.id}>.`).catch(() => {});
}, {
	permissions: [
		'manageMessages',
	],
});

module.exports.help = {
	args: '<user> <message>',
	desc: 'Adds a note about the specified user to the database.',
};
