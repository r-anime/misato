// Provides a list of executable commands and usage information for individual commands.

// TODO: custom help command
module.exports = require('yuuko/dist/commands/help');

module.exports.help = {
	args: '<command>',
	desc: 'Fetches help file on indicated command (currently non-working?)',
};