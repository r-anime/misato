const log = require('another-logger')({label: 'messageCreate'});
const {EventListener} = require('yuuko');
const {messageMatchesRule, isValidRule} = require('../../common/filters');

module.exports = new EventListener('messageCreate', async (message, {client, db}) => {
	if (message.author.bot) return;
	if (message.guildID) {
		// Fetch filter for this guild
		const configuration = await db.collection('messageFilters').findOne({guildID: message.guildID});
		if (configuration && configuration.rule) {
			const {rule} = configuration;
			if (isValidRule(rule)) {
				if (await messageMatchesRule(message, rule)) {
					message.delete().catch(() => {});
					return;
				}
			} else {
				// weird
				log.error('Encountered invalid rule in guild', message.guildID, rule);
			}
		}
	}

	// If the message wasn't sent in a guild, or if none of the guild's filters matched, process commands on it
	client.processCommand(message);
});
