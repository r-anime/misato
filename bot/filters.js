/**
 * Returns whether or not a message satisfies a given rule
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
				return rule.children.every(child => messageMatchesRule(message, child));
			} else if (rule.op === 'or') {
				return rule.children.som(child => messageMatchesRule(message, child));
			}
			throw new Error('unknown multiple-rule op', rule.op);
		}

		// Matches messages whose content contains given text (doesn't care about word boundaries)
		case 'contentContainsText': {
			return message.content.includes(rule.text);
		}

		// Matches messages whose content matches a given regular expression
		case 'contentMatchesRegexp': {
			return new RegExp(rule.pattern, rule.flags.join('')).test(message.content);
		}

		// Matches messages with an attachment whose filename matches a given regular expression
		case 'attachmentFilenameMatchesRegexp': {
			return message.attachments.some(attachment => new RegExp(rule.pattern, rule.flags).test(attachment.filename));
		}

		// This should never happen if we're doing proper DB validation
		default: throw new Error('unknown rule type', rule.type);
	}
}

/**
 * Determines if an object is a valid rule definition for database validation.
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
		case 'contentContainsText': {
			// text must be a key and its value must be a string
			if (typeof rule.text !== 'string') return false;
			// no keys other than type and text can be present
			if (Object.keys(rule).length !== 2) return false;
			return true;
		}

		// Rules that compare things against regexps
		case 'contentMatchesRegexp':
		case 'attachmentFilenameMatchesRegexp': {
			// pattern must be a key and its value must be a string
			if (typeof rule.pattern !== 'string') return false;
			// flags must be a key and its value must be a string
			if (typeof rule.flags !== 'string') return false;
			// no keys other than type, pattern, flags can be present
			if (Object.keys(rule).length !== 3) return false;
			return true;
		}

		default: return false;
	}
}
