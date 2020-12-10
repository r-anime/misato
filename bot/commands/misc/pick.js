// Picks from the options provided

const {Command} = require('yuuko');

function getRandomInt (min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = new Command('pick', (msg, args, context) => {
	if (!args.length) {
		return context.sendHelp(msg, context);
	}

	// We use a comma as a separator for each choice
	const choices = args.join(' ').split(',').map(str => str.trim());

	msg.channel.createMessage(`I pick **${choices[getRandomInt(0, choices.length - 1)]}**`).catch(() => {});
});

// TODO: add args
module.exports.help = {
	args: '<choice>, <choice>, <more choices...>',
	desc: 'Picks randomly from the given options. Options are separated with commas.',
};
