const log = require('another-logger')({label: 'web'});

module.exports = (request, response, next) => {
	log.hit(request.method, request.url);
	next();
};
