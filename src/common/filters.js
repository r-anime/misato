// Provides message filtering capabilities. Defines the spec for storing filter
// rules in the database. Still work in progress.

/**
 * Determines whether or not a message matches a given rule. Throws an error if
 * a rule with unknown option values is provided, but doesn't do full validation
 * on the rule - we're assuming that if it's been written to the database, it's
 * already made it past `isValidRule()`.
 * @param {Eris.Message} message The message object to check
 * @param {object} rule The rule to check against
 * @returns {Promise<boolean>}
 */
// Async for futureproofing
// eslint-disable-next-line require-await
async function messageMatchesRule (message, rule) {
	switch (rule.type) {
		// Matches a logical combination of other rules
		case 'multiple': {
			if (rule.op === 'and') {
				// Wow doing async array iteration is a pain in the ass
				return Promise.all(rule.children.map(child => messageMatchesRule(message, child)))
					.then(results => results.every(result => result));
			} else if (rule.op === 'or') {
				return Promise.all(rule.children.map(child => messageMatchesRule(message, child)))
					.then(results => results.some(result => result));
			}
			throw new Error('unknown multiple-rule op', rule.op);
		}

		// Matches messages where a given field contains given text (doesn't care about word boundaries)
		case 'containsText': {
			switch (rule.field) {
				case 'content': return message.content.includes(rule.text);
				case 'filename': return message.attachments.some(attachment => attachment.filename.includes(rule.text));
				default: throw new Error('unknown search field', rule.field);
			}
		}

		// Matches messages where a given field matches a given regular expression
		case 'matchesRegexp': {
			const regexp = new RegExp(rule.pattern, rule.flags);
			switch (rule.field) {
				case 'content': return regexp.test(message.content);
				case 'filename': return message.attachments.some(attachment => regexp.test(attachment.filename));
				default: throw new Error('unknown search field', rule.field);
			}
		}

		// This should never happen if we're doing proper DB validation
		default: throw new Error('unknown rule type', rule.type);
	}
}

/** An array of all valid field names for text-based match rules. */
const textFields = [
	'content',
	'filename',
];

/**
 * Determines if an object is a valid rule definition. Used for database
 * validation, so this function is designed to be very picky and includes
 * lots of explicit, verbose checks.
 * @param {any} rule
 * @returns {boolean}
 */
function isValidRule (rule) {
	// Rules must be objects
	if (typeof rule !== 'object' || Array.isArray(rule)) return false;

	// Rules must have the type key and it must match one of these values
	switch (rule.type) {
		// Rules that logically join other rules
		case 'multiple': {
			// op must be a key and its value must be either 'and' or 'or'
			if (rule.op !== 'and' && rule.op !== 'or') return false;
			// children must be an array
			if (!Array.isArray(rule.children)) return false;
			// no keys other than type, op, children can be present
			if (Object.keys(rule).length !== 3) return false;
			// all children must be valid rules
			if (rule.children.some(child => !isValidRule(child))) return false;
			return true;
		}

		// Rules that compare things against text
		case 'containsText': {
			// text must be a key and its value must be a string
			if (typeof rule.text !== 'string') return false;
			// field must be a key and its value must be one of the known field names
			if (!textFields.includes(rule.field)) return false;
			// no keys other than type and text can be present
			if (Object.keys(rule).length !== 3) return false;
			return true;
		}

		// Rules that compare things against regexps
		case 'matchesRegexp': {
			// pattern must be a key and its value must be a string
			if (typeof rule.pattern !== 'string') return false;
			// flags must be a key and its value must be a string
			if (typeof rule.flags !== 'string') return false;
			// field must be a key and its value must be one of the known field names
			if (!textFields.includes(rule.field)) return false;
			// no keys other than type, pattern, flags can be present
			if (Object.keys(rule).length !== 4) return false;
			return true;
		}

		default: return false;
	}
}

module.exports = {
	isValidRule,
	messageMatchesRule,
	textFields,
};
