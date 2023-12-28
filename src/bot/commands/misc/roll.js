// Rolls between 2 numbers provided or a default 0-6

import {Command} from 'yuuko';

function getRandomInt (min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const command = new Command('roll', (msg, args, {sendMessage}) => {
	let min = 0;
	let max = 6;

	if (args.length === 2) {
		min = parseInt(args[0], 10);
		max = parseInt(args[1], 10);
	}

	if (isNaN(min) || isNaN(max)) {
		sendMessage(msg, 'Please enter a valid number!').catch(() => {});
	} else {
		sendMessage(msg, `You rolled a ${getRandomInt(min, max)}`).catch(() => {});
	}
});
command.help = {
	args: '[lowest number] [highest number]',
	desc: 'Rolls between 2 numbers provided or a default interval of 0-6',
};
export default command;
