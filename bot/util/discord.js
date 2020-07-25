module.exports = {
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
	awaitReaction (message, emote, userID, {timeout = 30000} = {}) {
		const client = message.channel.guild ? message.channel.guild._client : message.channel._client;
		return new Promise((resolve, reject) => {
			function reactionListener (reactedMessage, reactedEmote, reactedUserID) {
				// reaction has to be on the message we sent, by the user who sent the command, with the same emoji
				if (reactedMessage.id !== message.id) return;
				if (reactedUserID !== userID) return;
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
	},

	/**
	 * Tries to get a guild member from the beginning of a string.
	 * @param {string} str
	 * @param {Eris.Guild} guild
	 * @returns {Array} An array where the first item is either a Member or
	 * undefined, and the second item is the rest of the string.
	 */
	parseGuildMember (str, guild) {
		let match = str.match(/^(?:<@!?)(\d+)(?:>)(?:\s+|$)/);
		if (match) {
			const member = guild.members.get(match[1]);
			if (member) return [member, str.substr(match[0].length)];
		}

		match = str.match(/^([^#]{2,32})#(\d{4})(?:\s+|$)/);
		if (match) {
			const member = guild.members.find(m => m.username === match[1] && m.discriminator === match[2]);
			if (member) return [member, str.substr(match[0].length)];
		}

		return [undefined, str];
	},
};
