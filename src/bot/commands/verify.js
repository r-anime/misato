import createLogger from 'another-logger';
const log = createLogger({label: 'cmd:verify'});
import {Command} from 'yuuko';
import {awaitReaction, parseGuildMember} from '../util/discord';
import {escape} from '../util/formatting';

const confirmationEmoji = '✅';

const command = new Command('verify', async (msg, args, context) => {
	if (!args.length) {
		return context.sendHelp(msg, context);
	}
	const {db, client} = context;

	args = args.join(' ').trim();

	// This command takes two arguments, a reddit user and a Discord user. Each
	// can take several forms. We try to identify obvious ones first, and
	// failing that, we make best guesses.
	let redditUsername;
	let discordUserID;

	// If we're making a best-guess and can't be certain, we'll have the user
	// confirm our guess before doing anything.
	let needsConfirmation = false;

	// Do we have an explicit Discord mention?
	const discordMatch = args.match(/<@!?(\d+)>/);
	if (discordMatch) {
		discordUserID = discordMatch[1];
		args = args.substr(0, discordMatch.index) + args.substr(discordMatch.index + discordMatch[0].length).trim();
	}

	// Do we have a Reddit /u/ link?
	const redditMatch = args.match(/(?:^|\s+)\/?u\/([a-zA-Z0-9-_]+)(?:\s+|$)/);
	if (redditMatch) {
		redditUsername = redditMatch[1];
		args = args.substr(0, redditMatch.index) + args.substr(redditMatch.index + redditMatch[0].length).trim();
	}

	// Do we have a Discord tag at the beginning of the message?
	if (!discordUserID) {
		const [member, rest] = await parseGuildMember(args, msg.channel.guild);
		if (member) {
			discordUserID = member.id;
			args = rest.trim();
			// If the reddit name was before the Discord tag, there's ambiguity, because Discord tags can start with /u/ and contain spaces. So we flag it as a guess.
			if (redditMatch && redditMatch.index === 0) {
				needsConfirmation = true;
			}
		}
	}

	// If we found the discord user but not the reddit name, guess whatever's left is the reddit name
	if (discordUserID && !redditUsername) {
		// reddit names definitely can't have spaces, so we do some array shenanigans to get our guess
		const argArray = args.split(' ');
		redditUsername = argArray.shift(); // removes first element from array
		needsConfirmation = true;
		args = argArray.join(' ').trim();
	}

	// If we don't even have a best guess by now, just give up
	if (!discordUserID || !redditUsername) {
		msg.channel.createMessage(`Couldn't figure out which ${[redditUsername ? '' : 'Reddit account', discordUserID ? '' : 'Discord account'].filter(s => s).join(' or ')} you meant.`).catch(() => {});
		return;
	}

	if (needsConfirmation) {
		const discordUser = await client.users.get(discordUserID);
		const discordTag = `${discordUser.username}#${discordUser.discriminator}`;
		const redditTag = `/u/${redditUsername}`;

		try {
			// send message and wait for confirmation from the command's author
			const confirmationMessage = await msg.channel.createMessage(`Did you mean **${escape(discordTag)}** and **${escape(redditTag)}**? React ${confirmationEmoji} to confirm.`);
			// it's fine if the bot can't add a reaction, the command caller might still be able to
			confirmationMessage.addReaction(confirmationEmoji).catch(() => {});
			await awaitReaction(confirmationMessage, confirmationEmoji, msg.author.id);
		} catch (error) {
			log.warn('aborted');
			// Unable to send message or the user didn't press the reaction
			return;
		}
	}

	// okay now that that's done we can actually verify the users
	const existing = await db.collection('redditAccounts').findOne({
		userID: discordUserID,
		guildID: msg.channel.guild.id,
		redditName: redditUsername,
	});
	if (existing) {
		msg.channel.createMessage('These accounts are already linked.').catch(() => {});
	} else {
		try {
			await db.collection('redditAccounts').insertOne({
				userID: discordUserID,
				guildID: msg.channel.guild.id,
				redditName: redditUsername,
			});
			msg.channel.createMessage('Accounts linked!').catch(() => {});
		} catch (error) {
			log.error('Failed to link two accounts:', error);
			msg.channel.createMessage('Failed to link the two accounts.').catch(() => {});
		}
	}
}, {
	permissions: [
		'manageRoles',
	],
});
command.help = {
	args: '<discord user> <reddit username or /u/ link>',
	desc: 'Forces link between mentioned accounts (does not go through OAuth)',
};
export default command;
