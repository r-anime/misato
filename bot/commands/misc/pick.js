// Picks from the options provided

const {Command} = require('yuuko');

function getRandomInt (min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = new Command('pick', (msg, args, context) => {
	// We use a comma as a separator for each choice, and we don't use args because want choices to have spaces
	let choices = msg.content.split(',');

	// Remove the command from the first choice, don't want the bot to say 'I pick .pick firstChoice'
	choices[0] = choices[0].replace(`${context.prefix}pick`, '');

	choices = choices.map(element => element.trim());

	if (choices.length < 2) {
		msg.channel.createMessage('Not enough things to pick from!').catch(() => {});
	} else {
		msg.channel.createMessage(`I pick **${choices[getRandomInt(0, choices.length - 1)]}**`).catch(() => {});
	}
});

// TODO: add args
module.exports.help = {
	args: '',
	desc: 'Picks from the options provided, separate them with a comma.',
};
