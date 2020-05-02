// This file defines helpful functions for working with HTTP responses.

module.exports = (request, response, next) => {
	Object.assign(response, {

		/**
		 * Ends the response by redirecting to another location.
		 * @param {number} [status=302] Response status code
		 * @param {string} location Where to redirect to
		 */
		redirect (status, location) {
			if (typeof status !== 'number') {
				location = status;
				status = 302;
			}
			this.writeHead(status, {
				Location: location,
			});
			this.end();
		},

	});
	next();
};
