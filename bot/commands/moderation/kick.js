const log = require('another-logger')({label: 'command:kick'});
const {Command} = require('yuuko');
const {parseGuildMember, awaitReaction} = require('../../util/discord');
const {escape, blockquote} = require('../../util/formatting');

const confirmationEmoji = '👢';

/**
 * Generatesa message to be sent to a user who will be kicked.
 * @param {Eris.guild} guild The guild the user is being banned from
 * @param {string} reason The reason for the ban
 * @param {expirationDate} expirationDate The date the ban will expire, if any
 * @returns {string}
 */
function kickMessage (guild, reason) {
	return `You've been kicked from __${escape(guild.name)}__.\n${reason ? blockquote(escape(reason)) : ''}`;
}

module.exports = new Command('kick', async (message, args, context) => {
	if (!args.length) {
		return context.sendHelp(message, context);
	}
	const {db} = context;

	const [member, reason] = await parseGuildMember(args.join(' '), message.channel.guild);
	if (!member) {
		message.channel.createMessage('Not sure who you want me to kick. Start your message with a mention, exact tag, or user ID.').catch(() => {});
		return;
	}
	if (!reason) {
		try {
			const confirmation = await message.channel.createMessage(`Kick <@${member.id}> without a reason? React ${confirmationEmoji} to confirm.`);
			confirmation.addReaction(confirmationEmoji).catch(() => {});
			await awaitReaction(confirmation, confirmationEmoji, message.author.id);
		} catch (_) {
			// couldn't send confirmation message or user aborted
			return;
		}
	}

	// Send the notification
	let messageSent;
	try {
		const dmChannel = await member.user.getDMChannel();
		await dmChannel.createMessage(kickMessage(message.channel.guild, reason));
		messageSent = true;
	} catch (error) {
		log.debug(error);
		messageSent = false;
	}

	// Kick the member
	try {
		await member.kick(reason);
	} catch (_) {
		message.channel.createMessage('Failed to kick. Are my permissions set up correctly?').catch(() => {});
		return;
	}

	// Record the kick to the database
	const kickRecord = {
		userID: member.id,
		guildID: message.channel.guild.id,
		modID: message.author.id,
		date: new Date(),
		note: reason,
	};
	try {
		db.collection('kicks').insertOne(kickRecord);
	} catch (error) {
		message.channel.createMessage(`Kicked <@${member.id}>, but there was an error writing the kick to the database. Have a developer check the logs, this should not happen.`).catch(() => {});
		log.error(error);
		log.error('Rejected document:', kickRecord);
		return;
	}

	message.channel.createMessage(`Kicked <@${member.id}>.${messageSent ? '' : ' Failed to send notification because of privacy settings.'}`).catch(() => {});
}, {
	permissions: [
		'kickMembers',
	],
});

module.exports.help = {
	args: '<user> [message]',
	desc: 'Kick indicated user with indicated message, or no message if message left blank. (Note: User can immediately rejoin server)',
};
