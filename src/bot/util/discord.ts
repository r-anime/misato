import {Guild, Member, Message, User} from 'eris';

/**
 * Waits for a specific user to add a specific emoji to a specific message.
 * @returns A promise which resolves if the specified reaction is added, or
 * rejects if the timeout is exceeded.
 */
export function awaitReaction (
	/** The message to wait for a reaction on */
	message: Message,
	/** An emote name or ID (unicode string for native emojis) */
	emote: string,
	/** The user to wait for a reaction from */
	userID: string,
	/** Additional options */
	{
		timeout = 30000,
	}: {
		/** How long to wait before aborting */
		timeout?: number;
	} = {},
) {
	// TODO: use a single listener for this rather than adding and removing, this will not scale well

	// TODO: don't hack into messages/channels for the client like this, it will break things
	// @ts-expect-error stupid undocumented internal property bullshit
	const client = message.channel.guild ? message.channel.guild._client : message.channel._client;

	return new Promise<void>((resolve, reject) => {
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
 * @returns A tuple (array) where the first item is either a user object or
 * `undefined`, and the second item is the rest of the string.
 */
export async function parseUser (
	/** The string to parse */
	str: string,
	/** If passed, enables matching user#discrim tags */
	guild?: Guild,
	/**
	 * If passed, the word "me" in the input string will be interpreted as
	 * referencing the specified user
	 */
	me?: User,
): Promise<[User | undefined, string]> {
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
		// TODO: don't hack into messages/channels for the client like this, it will break things
		// @ts-expect-error stupid undocumented internal property bullshit
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
 * @returns A tuple (array) where the first item is either a member object or
 * `undefined`, and the second item is the rest of the string
 */
export async function parseGuildMember (
	/** The string to parse */
	str,
	/** The guild in which to look for members */
	guild,
	/**
	 * If passed, the word "me" in the input string will be interpreted as
	 * referencing the specified member
	 */
	me,
): Promise<[Member | undefined, string]> {
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
 * @returns A tuple (array) of two values. The first is the number of
 * milliseconds represented by the input. The second is a string containing
 * any leftover text from the end of the string.
 */
export function parseTime (str: string): [number, string] {
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

/** Formats a date and time using Discord's styled unix timestamp format. */
export const formatDateTime = (date: Date) => `<t:${Math.round(date.getTime() / 1000)}:f>`;

/** Formats a date using Discord's styled unix timestamp format. */
export const formatDate = (date: Date) => `<t:${Math.round(date.getTime() / 1000)}:d>`;

/** Formats a time using Discord's styled unix timestamp format. */
export const formatTime = (date: Date) => `<t:${Math.round(date.getTime() / 1000)}:t>`;

/** Formats a date/time using Discord's relative unix timestamp format. */
export const formatDateRelative = (date: Date) => `<t:${Math.round(date.getTime() / 1000)}:R>`;

/** Size of avatars shown from the avatar and defaultavatar command */
export const AVATAR_IMAGE_SIZE = 512;

/**
 * Truncates a string to the given number of characters, adding an ellipsis
 * at the end if part of the string had to be cut off.
 * @param n The maximum number of characters for the returned string
 * @param str The string to be truncated
 * @see https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object
 */
export function truncate (n: number, str: string) {
	if (str.length <= n) {
		return str;
	}
	// U+2026 is a single-character ellipsis
	return `${str.slice(0, n - 1)}\u2026`;
}
