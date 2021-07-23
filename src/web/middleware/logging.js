import createLogger from 'another-logger';
const log = createLogger({label: 'web'});

export default (request, response, next) => {
	log.hit(request.method, request.url);
	next();
};
