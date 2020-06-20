const log = require('another-logger')({label: 'messageCreate'});
const {EventListener} = require('yuuko');
const {messageMatchesRule, isValidRule} = require('../filters');

/**
 * Given a list of promises and a condition, returns a new promise that resolves
 * to `true` as soon as any promise in the list resolves to a value that
 * fulfills the condition. The returned promise will resolve to `false` if none
 * of the given promises resolve to a matching value.
 * @param {Array<Promise>} promises An array of promises that will always
 * resolve and never reject. Rejecting promises are hot handled.
 * @param {Function} condition Takes a single promise resolution as an argument,
 * and returns a boolean.
 * @returns {Promise<Boolean>}
 */
function promiseRaceWithCondition (promises, condition) {
	return new Promise(resolve => {
		let resolved = false;
		Promise.all(promises.map(p => p.then(val => {
			// When an individual promise fulfills, check if the result matches
			if (condition(val) && !resolved) {
				resolved = true;
				resolve(true);
			}
		}))).then(() => {
			// All promises have resolved, but none have matched the condition
			if (!resolved) {
				resolve(false);
			}
		});
	});
}

module.exports = new EventListener('messageCreate', async (message, {client, db}) => {
	if (message.author.bot) return;
	if (message.guildID) {
		// Fetch filters for this guild
		const filters = await db.collection('messageFilters').find({guildID: message.guildID}).toArray();

		// Map each filter to a promise returning whether or not the message matches that filter
		const promises = filters.map(filter => {
			if (!isValidRule(filter.rule)) {
				log.error('Invalid rulE???', filter);
				return false;
			}
			return messageMatchesRule(message, filter.rule);
		});

		// As soon as any of those promises resolves to true, we know the message is invalid, so we delete it
		if (await promiseRaceWithCondition(promises, val => val)) {
			message.delete().catch(() => {});
			return;
		}
	}

	// If the message wasn't sent in a guild, or if none of the guild's filters matched, process commands on it
	client.processCommand(message);
});
