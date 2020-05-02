// Provides helper functions for formatting Discord messages.

module.exports = {

	/**
	 * Wraps the given text in a blockquote by adding `>` to the beginning of
	 * each line of the text.
	 * @param {string} text
	 * @returns {string}
	 */
	blockquote (text) {
		return text.replace(/^|\n(?!$)/g, '$&> ');
	},

};
