// Allows executing arbitrary Javascript expressions in bot scope (owner-only).

module.exports = require('yuuko/dist/commands/debug');

module.exports.help = {
	args: '',
	desc: 'Allows the bot owner to execute aribrary JavaScript expressions in the same scope as the bot',
};
