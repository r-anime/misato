import createLogger from 'another-logger';
const log = createLogger({label: 'command:warn'});
import {Command} from 'yuuko';
import {parseGuildMember, awaitReaction} from '../../util/discord';
import {escape, blockquote} from '../../util/formatting';

const confirmationEmoji = '⚠️';

/**
 * Generatesa message to be sent to a user who will be warned.
 * @param {Eris.guild} guild The guild the user is being warned from
 * @param {string} reason The reason for the warning
 * @returns {string}
 */
function warnMessage (guild, reason) {
	return `You've been issued a warning in __${escape(guild.name)}__.\n${reason ? blockquote(escape(reason)) : ''}`;
}

const command = new Command('warn', async (message, args, context) => {
	if (!args.length) {
		return context.sendHelp(message, context);
	}
	const {db} = context;

	const [member, reason] = await parseGuildMember(args.join(' '), message.channel.guild);
	if (!member) {
		message.channel.createMessage('Not sure who you want me to warn. Start your message with a mention, exact tag, or user ID.').catch(() => {});
		return;
	}

	log.debug(member.id, reason);

	// If reason or duration is implicitly blank, confirm intention
	if (!reason) {
		try {
			// oh inline array filterjoins how i missed you
			// TODO: split this message into a separate function; optimize
			const confirmation = await message.channel.createMessage(`Warn <@${member.id}> without a reason? React ${confirmationEmoji} to confirm.`);
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
		await dmChannel.createMessage(warnMessage(message.channel.guild, reason));
		messageSent = true;
	} catch (error) {
		log.debug(error);
		messageSent = false;
	}

	// Create the warning record in the database
	const warnRecord = {
		userID: member.id,
		guildID: message.channel.guild.id,
		modID: message.author.id,
		date: new Date(),
		note: reason,
	};
	try {
		// Insert information to database
		await db.collection('warnings').insertOne(warnRecord, {ignoreUndefined: true});
	} catch (error) {
		message.channel.createMessage(`Warned <@${member.id}>, but there was an error writing the warning to the database. Have a developer check the logs, this should not happen.`).catch(() => {});
		log.error(error);
		log.error('Rejected document:', warnRecord);
		return;
	}

	let text;
	if (messageSent) {
		text = `Warned <@${member.id}>.`;
	} else {
		text = `Recorded a warning for <@${member.id}>, but failed to notify them because of privacy settings. Make sure they're aware.`;
	}
	message.channel.createMessage(text).catch(() => {});
}, {
	permissions: [
		'manageMessages',
	],
});
command.help = {
	args: '<user> <message>',
	desc: 'Sends a warning to the specified user, and saves the warning for future reference.',
};
export default command;
