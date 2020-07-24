const log = require('another-logger')({label: 'cmd:verify'});
const {Command} = require('yuuko');
const {awaitReaction, guildMemberSearch} = require('../util/discord');

const redditTagRegex = /\/?u\//i;
const confirmationEmoji = '✅';

module.exports = new Command('verify', async (msg, args, {db, client}) => {
	// This command takes two arguments, a reddit user and a Discord user. Each
	// can take several forms. We try to identify obvious ones first, and
	// failing that, we make best guesses.
	let redditUsername;
	let discordUserID;

	// If we're making a best-guess and can't be certain, we'll have the user
	// confirm our guess before doing anything.
	const needsConfirmation = false;

	// Do we have a Discord mention? (TODO: this will break if using the bot mention as a prefix)
	if (msg.mentions.length === 1) {
		discordUserID = msg.mentions[0].id;
		// remove mention from argument list
		args.splice(args.findIndex(arg => arg.includes(discordUserID)), 1);
	}

	// Do we have a Reddit /u/ link?
	const argIndexWithRedditMention = args.findIndex(arg => redditTagRegex.test(arg));
	if (argIndexWithRedditMention !== -1) {
		redditUsername = args[argIndexWithRedditMention].replace(redditTagRegex, '');
		args.splice(argIndexWithRedditMention, 1);
	}

	// If we have neither of those, look for a Discord search at the start of the message and a reddit name at the end
	if (!redditUsername && !discordUserID) {
		redditUsername = args.pop();
	}

	// If we already have a Reddit name, try interpreting the rest of the message as a Discord search
	if (redditUsername && !discordUserID) {
		const member = guildMemberSearch(msg.channel.guild, args.join(' '));
		if (member) {
			discordUserID = member.id;
		}
	}

	// If we already have a Discord name and not a Reddit name, try to get

	// If we don't even have a best guess by now, just give up
	if (!discordUserID || !redditUsername) {
		msg.channel.createMessage(`Couldn't figure out which ${[redditUsername ? '' : 'Reddit account', discordUserID ? '' : 'Discord account'].filter(s => s).join(' or ')} you meant.`).catch(() => {});
		return;
	}

	if (needsConfirmation) {
		// TODO: escaping
		const discordUser = await client.users.get(discordUserID);
		const discordTag = `${discordUser.username}#${discordUser.discriminator}`;
		const redditTag = `/u/${redditUsername}`;

		try {
			// send message and wait for confirmation from the command's author
			const confirmationMessage = await msg.channel.createMessage(`Did you mean ${discordTag} and ${redditTag}? React with ${confirmationEmoji} to go with that, or try again and be more specific.`);
			// it's fine if the bot can't add a reaction, the command caller might still be able to
			confirmationMessage.addReaction(confirmationEmoji).catch(() => {});
			await awaitReaction(confirmationMessage, confirmationEmoji, msg.author.id);
		} catch (error) {
			log.warn('aborted');
			// Unable to send message or the user didn't press the reaction
			return;
		}

		// okay now that that's done we can actually verify the users
		const existing = await db.collection('redditAccounts').findOne({userID: discordUserID, redditName: redditUsername});
		if (existing) {
			msg.channel.createMessage('These accounts are already linked.').catch(() => {});
		} else {
			try {
				await db.collection('redditAccounts').insertOne({userID: discordUserID, redditName: redditUsername});
				msg.channel.createMessage('Accounts linked!').catch(() => {});
			} catch (error) {
				log.error('Failed to link two accounts:', error);
				msg.channel.createMessage('Failed to link the two accounts.').catch(() => {});
			}
		}
	}
}, {
	permissions: [
		'manageRoles',
	],
});
