module.exports = (request, response, next) => {
	Object.assign(response, {

		// Ends the response by redirecting to another location
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
