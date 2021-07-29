/**
 * Waits for a specific user to add a specific emoji to a specific message.
 * @param {Eris.Message} message The message to wait for a reaction on
 * @param {string} emote An emote name or ID (unicode string for native emojis)
 * @param {string} userID The user to wait for a reaction from
 * @param {object} [options]
 * @param {number} [options.timeout=30000] How long to wait before aborting
 * @returns {Promise} Resolves if the specified reaction is added. Rejects if
 * the timeout is exceeded.
 */
export function awaitReaction (message, emote, userID, {timeout = 30000} = {}) {
	// TODO: use a single listener for this rather than adding and removing, this will not scale well
	const client = message.channel.guild ? message.channel.guild._client : message.channel._client;
	return new Promise((resolve, reject) => {
		function reactionListener (reactedMessage, reactedEmote, reactingMember) {
			// reaction has to be on the message we sent, by the user who sent the command, with the same emoji
			if (reactedMessage.id !== message.id) return;
			if (reactingMember.id !== userID) return;
			if (reactedEmote.name !== emote && reactedEmote.id !== emote) return;
			client.removeListener('messageReactionAdd', reactionListener);
			resolve();
		}
		client.on('messageReactionAdd', reactionListener);
		setTimeout(() => {
			client.removeListener('messageReactionAdd', reactionListener);
			reject();
		}, timeout);
	});
}

/**
 * Tries to get a user from the beginning of a string. Will try identifying
 * from a direct mention or user ID, and optionally a user#discrim tag (if
 * `guild` is provided) or the word "me" (if `me` is provided).
 * optionally the word "me".
 * @param {string} str
 * @param {Eris.Guild} [guild] If passed, enables matching user#discrim tags
 * from the given guild (otherwise limited to taking mentions and raw IDs)
 * @param {Eris.User} [me] If passed, the word "me" will be interpreted as
 * referencing the specified user
 * @returns {Array} An array where the first item is either a Member or
 * undefined, and the second item is the rest of the string
 */
export async function parseUser (str, guild, me) {
	let match;

	// The "me" keyword, if we're provided with a context for it
	if (me) {
		match = str.match(/^me(\s+|$)/i);
		if (match) return [me, str.substr(match[0].length)];
	}

	// Members of the given guild, if any
	if (guild) {
		const [member, rest] = await parseGuildMember(str, guild, me);
		if (member) return [member.user, rest];
	}

	// Actual user mentions and raw IDs
	match = str.match(/^(?:<@!?)?(\d+)>?(?:\s+|$)/);
	if (match) {
		const member = guild._client.users.get(match[1]) || await guild._client.getRESTUser(match[1]).catch(() => undefined);
		if (member) return [member, str.substr(match[0].length)];
	}

	// nothing
	return [undefined, str];
}

/**
 * Tries to get a guild member from the beginning of a string. Will try
 * identifying from a direct mention, user ID, tag (user#discrim), or
 * optionally the word "me" (if `me` is provided).
 * @param {string} str
 * @param {Eris.Guild} guild
 * @param {Eris.Member} [me] If passed, the word "me" will be interpreted
 * as referencing the specified member
 * @returns {Array} An array where the first item is either a Member or
 * undefined, and the second item is the rest of the string
 */
export async function parseGuildMember (str, guild, me) {
	let match;

	// The "me" keyword, if we're provided with a context for it
	if (me) {
		match = str.match(/^me(\s+|$)/i);
		if (match) return [me, str.substr(match[0].length)];
	}

	// Actual user mentions and raw IDs
	match = str.match(/^(?:<@!?)?(\d+)>?(?:\s+|$)/);
	if (match) {
		const member = guild.members.get(match[1]) || await guild.getRESTMember(match[1]).catch(() => undefined);
		if (member) return [member, str.substr(match[0].length)];
	}

	// User tags (name#discrim)
	match = str.match(/^([^#]{2,32})#(\d{4})(?:\s+|$)/);
	if (match) {
		const member = guild.members.find(m => m.username === match[1] && m.discriminator === match[2]);
		if (member) return [member, str.substr(match[0].length)];
	}

	// Nothing found
	return [undefined, str];
}

/**
 * Tries to parse a string representing a relative amount of time. Accepts
 * stuff in the form "4h", "3 days", "1 hour 2 minutes". May be expanded to
 * support more formats in the future.
 * @param {string} str The string to parse the info from
 * @returns {Array} An array of two values. The first is the number of
 * milliseconds represented by the input. The second is a string containing
 * any leftover text from the end of the string.
 */
export function parseTime (str) {
	let total = 0;
	// attempt to process the entire string
	while (str) {
		// find things that look like times at the start of the string
		const match = str.match(/^\s*(\d+)\s*(w|weeks?|d|days?|h|hours?|m|min(?:ute)?s?|s|seconds?)/i);
		if (!match) {
			break;
		}
		str = str.slice(match[0].length);
		let val = parseInt(match[1], 10);

		// pretty naive, messy relative time processing
		// TODO: there's probably a module for this lol
		/* eslint-disable no-fallthrough */
		switch (match[2].toLowerCase()) {
			// 12ish months in a year
			case 'y':
			case 'year':
			case 'years':
				val *= 20;
			// 30(ish) days in a month
			case 'mo':
			case 'mos':
			case 'month':
			case 'months':
				val *= 30;
			// 7 days in a week
			case 'w':
			case 'week':
			case 'weeks':
				val *= 7;
			// 24 hours in a day
			case 'd':
			case 'day':
			case 'days':
				val *= 24;
			// 60 minutes in an hour
			case 'h':
			case 'hour':
			case 'hours':
				val *= 60;
			// 60 seconds in a minute
			case 'm':
			case 'min':
			case 'mins':
			case 'minute':
			case 'minutes':
				val *= 60;
			// 1000 ms in a second
			case 's':
			case 'sec':
			case 'secs':
			case 'second':
			case 'seconds':
				val *= 1000;
			default: break;
		}
		/* eslint-enable no-fallthrough */

		total += val;
	}

	return [total, str.trim()];
}

/**
 * Formats a date and time using Discord's styled unix timestamp format.
 * @param {Date} date
 * @returns {string}
 */
export const formatDateTime = date => `<t:${Math.round(date.getTime() / 1000)}:f>`;

/**
 * Formats a date using Discord's styled unix timestamp format.
 * @param {Date} date
 * @returns {string}
 */
export const formatDate = date => `<t:${Math.round(date.getTime() / 1000)}:d>`;

/**
 * Formats a time using Discord's styled unix timestamp format.
 * @param {Date} date
 * @returns {string}
 */
export const formatTime = date => `<t:${Math.round(date.getTime() / 1000)}:t>`;

/**
 * Formats a date/time using Discord's relative unix timestamp format.
 * @param {Date} date
 * @returns {string}
 */
export const formatDateRelative = date => `<t:${Math.round(date.getTime() / 1000)}:R>`;
