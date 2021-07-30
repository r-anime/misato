// A middleware that adds the header `Access-Control-Allow-Origin: *` to all
// outgoing requests.
export default (request, response, next) => {
	if (request.headers.origin) {
		response.setHeader('access-control-allow-origin', request.headers.origin);
	} else {
		response.setHeader('access-control-allow-origin', '*');
	}
	response.setHeader('access-control-allow-credentials', 'true');
	next();
};
