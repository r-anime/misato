// A middleware that adds permissive access control headers to all responses in
// debugging. This middleware is only used in development; production access
// control headers are set via the production web server stack.

export default (request, response, next) => {
	// Allow all credentials
	response.setHeader('access-control-allow-credentials', 'true');

	// Allow the requesting origin/all origins
	if (request.headers.origin) {
		response.setHeader('access-control-allow-origin', request.headers.origin);
	} else {
		response.setHeader('access-control-allow-origin', '*');
	}

	// Allow the requested headers and method (preflight requests)
	if (request.headers['access-control-request-method']) {
		response.setHeader('access-control-allow-methods', request.headers['access-control-request-method']);
	} else {
		response.setHeader('access-control-allow-methods', '*');
	}
	if (request.headers['access-control-request-headers']) {
		response.setHeader('access-control-allow-headers', request.headers['access-control-request-headers']);
	} else {
		response.setHeader('access-control-allow-headers', '*');
	}

	// We don't otherwise use the OPTIONS method, so assume OPTIONS requests
	// are CORS preflight requests and respond with a 204 immediately
	if (request.method === 'OPTIONS') {
		response.writeHead(204);
		response.end();
		return;
	}

	next();
};
