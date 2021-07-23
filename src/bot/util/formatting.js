// Provides helper functions for formatting Discord messages.

/**
 * Wraps the given text in a blockquote by adding `>` to the beginning of
 * each line of the text.
 * @param {string} text
 * @returns {string}
 */
export function	blockquote (text) {
	return text.replace(/^|\n(?!$)/g, '$&> ');
}

/**
 * Wraps the given text in a code block of the given language. Inserts
 * zero-width spaces into existing sequences of triple backticks to avoid
 * malicious formatting, unless the unsafe argument is set to true.
 * @param {string} text
 * @param {string} [lang='']
 * @param {boolean} [unsafe=false]
 * @returns {string}
 */
export function	code (text, lang = '', unsafe = false) {
	return `\`\`\`${lang ? `${lang}\n` : ''}${unsafe ? text : text.replace(/```/g, '`​`​`')}\`\`\``;
}

/**
 * Escapes a string for display without formatting.
 * @param {string} text
 * @returns {string}
 */
export function	escape (text) {
	return text.replace(/[*_`~]|(\n|^)>/g, '\\$&');
}
