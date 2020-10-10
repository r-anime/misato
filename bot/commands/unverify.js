const log = require('another-logger')({label: 'cmd:unverify'});
const {Command} = require('yuuko');
const {awaitReaction, parseGuildMember} = require('../util/discord');
const {escape} = require('../util/formatting');
const config = require('../../config');

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
		confirmationText = `Unlink ${existing.length} Reddit accounts from <@${discordUserID}>? React ${confirmationEmoji} to confirm.`;
	} else {
		confirmationText = `Unlink /u/${redditUsername} from ${existing.length} Discord accounts? React ${confirmationEmoji} to confirm.`;
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

	// Get a list of unique Discord users affected by this change
	const discordUserIDs = existing.map(doc => doc.userID).filter((id, index, arr) => arr.indexOf(id) === index);
	log.debug(discordUserIDs);

	// Remove verifications from database
	try {
		await db.collection('redditAccounts').deleteMany(searchCriteria);
	} catch (error) {
		log.error('Failed to unlink accounts:', error);
		msg.channel.createMessage('Failed to unlink the accounts.').catch(() => {});
	}

	// Check all impacted users - if they don't have any other Reddit accounts linked, remove the verified role from them
	// TODO: this is hardcoded
	const failures = [];
	await Promise.all(discordUserIDs.map(async id => {
		log.debug('processing id', id);
		const linkedAccounts = await db.collection('redditAccounts').find({
			userID: id,
			guildID: msg.channel.guild.id,
		}).toArray();
			// If the user still has linked accounts, leave them as-is
		if (linkedAccounts.length) {
			return;
		}
		// If the user isn't in the guild, we can't do anything about them
		// (to check this, we first look for the member in the guild's member cache, and if they don't show up
		// there, we try to find them in the REST API, which will fail if they're not in the guild)
		if (!msg.channel.guild.members.get(id) && !await msg.channel.guild.getRESTMember(id).catch(() => null)) {
			log.debug('member not in guild', id);
			return;
		}
		// They're in the guild and have no more linked accounts, try to yeet the role
		// potential error intentionally not handled
		try {
			await msg.channel.guild.removeMemberRole(id, config.TEMP_roleID);
		} catch (error) {
			log.error('Error removing role', config.TEMP_roleID, 'from user', id, ':', error);
			failures.push(id);
		}
	}));

	// Send final message and wrap up
	let messageText = `Unlinked ${existing.length} account${existing.length === 1 ? '' : 's'}.`;
	// If one or more role removals failed, include that in the response
	if (failures.length) {
		messageText += ` Couldn't remove the role from ${failures.length} member${failures.length === 1 ? '' : 's'}; do this manually. Are my permissions correct?`;
		messageText += failures.map(id => `\n- <@${id}>`).join('');
	}
	msg.channel.createMessage(messageText).catch(() => {});
}, {
	permissions: [
		'manageRoles',
	],
});
