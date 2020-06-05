const {EventListener} = require('yuuko');
const {messageMatchesRule} = require('../filters');

console.log('caleld');

module.exports = new EventListener('messageCreate', async (message, context) => {
	// TODO: filter rules have to be cached/fetched from the db somewhere
	if (await messageMatchesRule(message, {
		type: 'multiple',
		op: 'or',
		children: [
			{
				type: 'containsText',
				field: 'content',
				text: 'testone',
			},
			{
				type: 'matchesRegexp',
				field: 'content',
				pattern: '^asdf$',
				flags: 'i',
			},
		],
	})) {
		return;
	}
	console.log('dab on em');

	context.client.processCommand(message);
});
