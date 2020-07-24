const Eris = require('eris');

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
	 * Searches for a member of a guild by name.
	 * @param {Eris.Guild} guild
	 * @param {string} search The name to search for in the guild
	 * @returns {Eris.Member | undefined}
	 */
	guildMemberSearch (guild, search) {
		const byID = guild.members.get(search);
		if (byID) return byID;

		// name will always be present, discrim may or may not be
		const [name, discrim] = search.match(/^(.+)(?:#(\d{4}))$/);

		const exactMatch = guild.members.find(member => member.name === name && (discrim ? member.discriminator === discrim : true));
		if (exactMatch) return exactMatch;

		const nickMatch = guild.members.find(member => member.nickname === name && (discrim ? member.discriminator === discrim : true));
		if (nickMatch) return nickMatch;

		// we tried
		return guild.members.find(member => member.name.includes(name) || member.nickname.includes(name));
	},
};
