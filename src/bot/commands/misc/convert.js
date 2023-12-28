// Converts from one currency to another based on this API: http://exchangeratesapi.io/

import {Command} from 'yuuko';
import fetch from 'node-fetch';
import convert from 'convert-units';

const {FREECURRENCYAPI_KEY} = process.env;

// Cache the rates so we don't hit the API too often
let rates = {};
let lastRateFetch = 0;
let fetchingRates = null;
async function fetchLatestRates () {
	fetchingRates = (async () => {
		// NOTE: This API only seems to return EUR rates if you request certain
		//       base currencies, no idea why.
		try {
			const response = await fetch(`https://api.currencyapi.com/v3/latest?base_currency=USD&apikey=${FREECURRENCYAPI_KEY}`).then(r => r.json());
			rates = {};
			for (const [currency, info] of Object.entries(response.data)) {
				rates[currency] = info.value;
			}
		} catch (error) {
			console.error('Error while fetching latest currency rates:', error);
			throw error;
		}
		console.debug('Rates:', rates);
		lastRateFetch = Date.now();
		fetchingRates = null;
	})();
	await fetchingRates;
}

/**
 * Attempts to convert between common units.
 * @param {number} baseValue
 * @param {string} baseType Base unit
 * @param {string} targetType Target unit
 * @returns {string} Success message
 * @throws {Error} Generic error if conversion fails
 */
function convertUnits (baseValue, baseType, targetType) {
	const conversion = convert(baseValue).from(baseType).to(targetType);
	const fractionDigits = getFractionDigits(conversion);
	return `${baseValue.toString()}${baseType} is equal to ${conversion.toFixed(fractionDigits)}${targetType}`;
}

/**
 * Gets the count of zeroes after the decimal point but before a non-zero number
 * @param {number} value
 * @returns {number} Number of zeroes
 */
function getCountOfZeroesAfterDecimalPoint (value) {
	let fractionalPart = value % 1;
	let numberOfZeroes = -1;

	while (fractionalPart < 1 && fractionalPart > 0) {
		fractionalPart *= 10;
		numberOfZeroes++;
	}
	return Math.max(0, numberOfZeroes);
}

/**
 * Gets the number of fraction digits needed to display our result with toFixed
 * @param {number} value
 * @returns {number} Number of fraction digits
 */
function getFractionDigits (value) {
	const numberOfZeroes = getCountOfZeroesAfterDecimalPoint(value);
	// Return 2 if there are no zeroes, otherwise return the number of zeroes plus 2
	// Max value returned is 20
	return Math.max(2, Math.min(numberOfZeroes + 2, 20));
}

/**
 * Attempts to convert between currencies using an exchange rate API.
 * @param {number} baseValue
 * @param {string} baseType Base unit
 * @param {string} targetType Target unit
 * @returns {Promise<string, Error>} Message to the user if successful, rejects generic error if unsuccessful
 */
async function convertCurrency (baseValue, baseType, targetType) {
	// If we're currently fetching new rates, wait for that to complete.
	// Otherwise, if it's been more than 10 minutes since the last check, fetch
	// new rates.
	if (fetchingRates) {
		await fetchingRates;
	} else if (Date.now() > lastRateFetch + 10 * 60 * 1000) {
		await fetchLatestRates();
	}

	baseType = baseType.toUpperCase();
	targetType = targetType.toUpperCase();

	// Verify baseType and targetType in rates
	const isValidRates = rates[baseType] != null && rates[targetType] != null;
	if (!isValidRates) {
		throw new Error('Incorrect Currency');
	}
	// Convert between the two rates
	const result = baseValue * rates[targetType] / rates[baseType];
	const fractionDigits = getFractionDigits(result);
	return `${baseValue}${baseType} is roughly equal to ${result.toFixed(fractionDigits)}${targetType}`;
}

/** Regular expression matching input arguments for this command. */
const argRegex = /^(?<num>\d+([.,]\d+)?)?\s*(?<baseType>[^\s\d]+)(\s*to)?\s*(?<targetType>\S+)$/;

/** Map of unit aliases. */
const unitAliases = {
	'"': 'ft',
	"'": 'in',
	'foot': 'ft',
	'feet': 'ft',
	'inch': 'in',
	'inches': 'in',
	'f': 'F',
	'c': 'C',
	'k': 'K',
	'r': 'R',
};

const command = new Command('convert', async (msg, args, context) => {
	const match = args.join(' ').match(argRegex);

	if (!match) {
		return context.sendHelp(msg, context);
	}

	let {baseType, targetType} = match.groups;

	for (const [key, value] of Object.entries(unitAliases)) {
		if (baseType === key) baseType = value;
		if (targetType === key) targetType = value;
	}

	let baseValue = parseFloat((match.groups.num || '1').replace(',', '.'));
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

	context.sendMessage(msg, message).catch(() => {});
});
command.help = {
	args: '[amount] <source currency or unit> <destination currency or unit>',
	desc: `Converts units and currency. Uses <http://exchangeratesapi.io/> for live currency exchange rates. If no amount is specified, assumes 1.
For a list of valid currency codes, visit: <https://www.xe.com/en/iso4217.php>
For a list of valid units, visit: <https://www.npmjs.com/package/convert-units#supported-units>`,
};
export default command;
