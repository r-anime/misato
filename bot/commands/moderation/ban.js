const log = require('another-logger')({label: 'command:ban'});
const {Command} = require('yuuko');
const {parseGuildMember, parseTime, formatDateTime, awaitReaction} = require('../../util/discord');

const confirmationEmoji = '🔨';

module.exports = new Command('ban', async (message, args, {db}) => {
	const [member, rest] = parseGuildMember(args.join(' '), message.channel.guild);
	if (!member) {
		message.channel.createMessage('Not sure who you want me to ban. Start your message with a mention, exact tag, or user ID.').catch(() => {});
		return;
	}
	const [duration, reason] = parseTime(rest);
	const expirationDate = new Date(Date.now() + duration);
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
	};
	// expirationDate is only stored if the duration is not zero
	if (duration !== 0) {
		banRecord.expirationDate = expirationDate;
	}
	try {
		// Insert information to database
		await db.collection('bans').insertOne(banRecord);
	} catch (error) {
		message.channel.createMessage(`Banned <@${member.id}>, but there was an error writing the ban to the database. Have a developer check the logs, this should not happen.`).catch(() => {});
		log.error(error);
		log.error('Rejected document:', banRecord);
		return;
	}

	message.channel.createMessage(`Banned <@${member.id}> ${duration ? `until ${formatDateTime(expirationDate)}` : 'permanently'}.`).catch(() => {});
}, {
	permissions: [
		'banMembers',
	],
});
