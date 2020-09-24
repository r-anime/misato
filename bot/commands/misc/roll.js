// Rolls between 2 numbers provided or a default 0-6

const {Command} = require('yuuko');

function getRandomInt (min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = new Command('roll', (msg, args) => {
	let min = 0;
	let max = 6;

	if (args.length === 2) {
		min = parseInt(args[0], 10);
		max = parseInt(args[1], 10);
	}

	if (isNaN(min) || isNaN(max)) {
		msg.channel.createMessage('Please enter a valid number!').catch(() => {});
	} else {
		msg.channel.createMessage(`You rolled a ${getRandomInt(min, max)}`);
	}
});

// TODO: add args
module.exports.help = {
	args: '',
	desc: 'Rolls between 2 numbers provided or a default interval of 0-6',
};
