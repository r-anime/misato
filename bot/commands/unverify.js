const log = require('another-logger')({label: 'cmd:unverify'});
const {Command} = require('yuuko');
const {awaitReaction, parseGuildMember} = require('../util/discord');
const {escape} = require('../util/formatting');

const confirmationEmoji = '💔';

module.exports = new Command(['unverify', 'deverify'], async (msg, args, {db}) => {
	args = args.join(' ').trim();

	// This command takes two arguments, a Reddit username and a Discord user;
	// however, only one or the other *needs* to be provided. If both are given,
	// the connection between the given accounts is deleted; if only one or the
	// other is provided, *all* connections with the given account are deleted.
	let redditUsername;
	let discordUserID;

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
		const [member, rest] = parseGuildMember(args, msg.channel.guild);
		if (member) {
			discordUserID = member.id;
			args = rest.trim();
		}
	}

	// Guess whatever's left is the reddit name
	if (!redditUsername) {
		// reddit names definitely can't have spaces, so we do some array shenanigans to get our guess
		const argArray = args.split(' ');
		redditUsername = argArray.shift(); // removes first element from array
		args = argArray.join(' ').trim();
	}

	// If we don't have a Reddit name *or* a Discord user, we probably weren't passed anything
	if (!discordUserID && !redditUsername) {
		msg.channel.createMessage('Not sure what you meant. Pass a Discord user and/or a Reddit user.').catch(() => {});
		return;
	}

	// Construct our search criteria
	const searchCriteria = {guildID: msg.channel.guild.id};
	if (discordUserID) {
		searchCriteria.userID = discordUserID;
	}
	if (redditUsername) {
		searchCriteria.redditName = redditUsername;
	}

	log.debug(searchCriteria);

	// Search the database for all verifications that will be affected
	const existing = await db.collection('redditAccounts').find(searchCriteria).toArray();
	log.debug(existing);
	if (!existing.length) {
		msg.channel.createMessage('No existing verifications matching the given criteria.').catch(() => {});
		return;
	}

	// Send confirmation before doing anything
	let confirmationText = '';
	if (existing.length === 1) {
		confirmationText = `Unlink /u/${escape(existing[0].redditName)} from <@${existing[0].userID}>? React ${confirmationEmoji} to confirm.`;
	} else if (discordUserID) {
		confirmationText = `Unlink all ${existing.length} Reddit accounts from <@${discordUserID}>? React ${confirmationEmoji} to confirm.`;
	} else {
		confirmationText = `Unlink /u/${redditUsername} from all ${existing.length} Discord accounts? React ${confirmationEmoji} to confirm.`;
	}
	try {
		const confirmationMessage = await msg.channel.createMessage(confirmationText);
		confirmationMessage.addReaction(confirmationEmoji).catch(() => {});
		await awaitReaction(confirmationMessage, confirmationEmoji, msg.author.id);
	} catch (error) {
		// Unable to send message or user didn't click reaction
		log.debug('aborted');
		return;
	}

	// Remove verifications from database
	try {
		await db.collection('redditAccounts').deleteMany(searchCriteria);
		msg.channel.createMessage(`Unlinked ${existing.length === 1 ? '1 account' : `${existing.length} accounts`}.`);
	} catch (error) {
		log.error('Failed to unlink accounts:', error);
		msg.channel.createMessage('Failed to unlink the accounts.').catch(() => {});
	}
}, {
	permissions: [
		'manageRoles',
	],
});
