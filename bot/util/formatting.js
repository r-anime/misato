// Provides helper functions for formatting Discord messages.

module.exports = {
	blockquote (text) {
		// Place a > at the beginning of the string and after every newline
		return text.replace(/^|\n(?!$)/g, '$&> ');
	},
};
