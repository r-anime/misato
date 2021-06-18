// Converts from one currency to another based on this API: http://exchangeratesapi.io/

const {Command} = require('yuuko');
const config = require('../../../config');
const fetch = require('node-fetch');
const convert = require('convert-units');

/**
 * Attempts to convert between common units.
 * @param {number} baseValue
 * @param {string} baseType Base unit
 * @param {string} targetType Target unit
 * @returns {strung} Success message
 * @throws {Error} Generic error if conversion fails
 */
function convertUnits (baseValue, baseType, targetType) {
	const conversion = convert(baseValue).from(baseType).to(targetType);
	return `${baseValue}${baseType} is equal to ${conversion.toFixed(2)}${targetType}`;
}

/**
 * Attempts to convert between currencies using an exchange rate API.
 * @param {number} baseValue
 * @param {string} baseType Base unit
 * @param {string} targetType Target unit
 * @returns {Promise<string, Error>} Message to the user if successful, rejects generic error if unsuccessful
 */
async function convertCurrency (baseValue, baseType, targetType) {
	baseType = baseType.toUpperCase();
	targetType = targetType.toUpperCase();
	const res = await fetch(`http://api.exchangeratesapi.io/latest?access_key=${config.thirdParty.exchangeRates}&base=${baseType}&symbols=${targetType}`);
	if (res.status !== 200) {
		throw new Error('non-OK status code');
	}
	const conversions = await res.json();
	const result = conversions.rates[targetType] * baseValue;
	return `${baseValue}${baseType} is roughly equal to ${result.toFixed(2)}${targetType}`;
}

/** Regular expression matching input arguments for this command. */
const argRegex = /^(?<num>\d+([.,]\d+)?)?\s*(?<baseType>[^\s\d]+)(\s*to)?\s*(?<targetType>\S+)$/;

/** Map of unit aliases. */
const unitAliases = {
	'"': 'ft',
	'\'': 'in',
	'foot': 'ft',
	'feet': 'ft',
	'inch': 'in',
	'inches': 'in',
};

module.exports = new Command('convert', async (msg, args, context) => {
	const match = args.join(' ').match(argRegex);

	if (!match) {
		return context.sendHelp(msg, context);
	}

	let {baseType, targetType} = match.groups;

	for (const [key, value] of Object.entries(unitAliases)) {
		if (baseType === key) baseType = value;
		if (targetType === key) targetType = value;
	}

	let baseValue = parseFloat(match.groups.num.replace(',', '.'));
	if (isNaN(baseValue)) {
		baseValue = 1;
	}

	let message;
	try {
		// see if it can convert it normally first
		message = convertUnits(baseValue, baseType, targetType);
	} catch (_) {
		try {
			// if it can't convert it normally, try to find it as a currency, throws if it can't find a currency either
			message = await convertCurrency(baseValue, baseType, targetType);
		} catch (__) {
			message = `Couldn't convert from ${baseValue} ${baseType} to ${targetType}. Type \`${context.prefix}convert\` to see all available units.`;
		}
	}

	msg.channel.createMessage(message).catch(() => {});
});

module.exports.help = {
	args: '[amount] <source currency or unit> <destination currency or unit>',
	desc: `Converts units and currency. Uses <http://exchangeratesapi.io/> for live currency exchange rates. If no amount is specified, assumes 1.
For a list of valid currency codes, visit: <https://www.xe.com/en/iso4217.php>
For a list of valid units, visit: <https://www.npmjs.com/package/convert-units#supported-units>`,
};
