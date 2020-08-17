const log = require('another-logger')({label: 'command:ban'});
const {Command} = require('yuuko');
const {parseGuildMember, parseTime, formatDateTime, awaitReaction} = require('../../util/discord');
const {escape, blockquote} = require('../../util/formatting');

const confirmationEmoji = '🔨';

/**
 * Generatesa message to be sent to a user who will be banned.
 * @param {Eris.guild} guild The guild the user is being banned from
 * @param {string} reason The reason for the ban
 * @param {expirationDate} expirationDate The date the ban will expire, if any
 * @returns {string}
 */
function banMessage (guild, reason, expirationDate) {
	return `You've been banned from __${escape(guild.name)}__ ${expirationDate ? `until ${formatDateTime(expirationDate)}` : 'permanently'}.\n${reason ? blockquote(escape(reason)) : ''}`;
}

module.exports = new Command('ban', async (message, args, {db}) => {
	const [member, rest] = parseGuildMember(args.join(' '), message.channel.guild);
	if (!member) {
		message.channel.createMessage('Not sure who you want me to ban. Start your message with a mention, exact tag, or user ID.').catch(() => {});
		return;
	}
	const [duration, reason] = parseTime(rest);
	const expirationDate = duration ? new Date(Date.now() + duration) : undefined;
	log.debug(member.id, duration, reason);

	// If reason or duration is implicitly blank, confirm intention
	if (!reason || !duration && reason === rest) {
		try {
			// oh inline array filterjoins how i missed you
			// TODO: split this message into a separate function; optimize
			const confirmation = await message.channel.createMessage(`Ban <@${member.id}> ${[duration ? '' : 'permanently', reason ? '' : 'without a reason'].filter(s => s).join(', ')}? React ${confirmationEmoji} to confirm.`);
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
		await dmChannel.createMessage(banMessage(message.channel.guild, reason, expirationDate));
		messageSent = true;
	} catch (error) {
		log.debug(error);
		messageSent = false;
	}

	// Ban the user
	try {
		// TODO: check if member is already banned before banning again
		// TODO: service to clear bans after they expire
		await member.ban(0, reason);
	} catch (_) {
		message.channel.createMessage('Failed to ban. Are permissions set up correctly? I need the "Ban Members" permission, and I can\'t ban users with a higher role than me.').catch(() => {});
		return;
	}

	// Create the ban record in the database
	const banRecord = {
		userID: member.id,
		guildID: message.channel.guild.id,
		modID: message.author.id,
		date: new Date(),
		note: reason,
		expirationDate,
	};
	try {
		// Insert information to database
		await db.collection('bans').insertOne(banRecord);
	} catch (error) {
		message.channel.createMessage(`Banned <@${member.id}>, but there was an error writing the ban to the database. Have a developer check the logs, this should not happen.`).catch(() => {});
		log.error(error);
		log.error('Rejected document:', banRecord);
		return;
	}

	message.channel.createMessage(`Banned <@${member.id}> ${duration ? `until ${formatDateTime(expirationDate)}` : 'permanently'}.${messageSent ? '' : ' Failed to send notification because of privacy settings.'}`).catch(() => {});
}, {
	permissions: [
		'banMembers',
	],
});
