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

			// Map each filter to a promise returning whether or not the message matches that filter
			if (!isValidRule(rule)) {
				log.error('Invalid rulE???', rule);
				return false;
			}

			// As soon as any of those promises resolves to true, we know the message is invalid, so we delete it
			if (await messageMatchesRule(message, rule)) {
				message.delete().catch(() => {});
				return;
			}
		}
	}

	// If the message wasn't sent in a guild, or if none of the guild's filters matched, process commands on it
	client.processCommand(message);
});
