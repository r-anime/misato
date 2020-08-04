const log = require('another-logger')({label: 'command:kick'});
const {Command} = require('yuuko');
const {parseGuildMember, awaitReaction} = require('../../util/discord');

const confirmationEmoji = '👢';

module.exports = new Command('kick', async (message, args, {db}) => {
	const [member, reason] = parseGuildMember(args.join(' '), message.channel.guild);
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

	message.channel.createMessage(`Kicked <@${member.id}>.`).catch(() => {});
}, {
	permissions: [
		'kickMembers',
	],
});
