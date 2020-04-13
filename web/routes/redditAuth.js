const polka = require('polka');
const log = require('another-logger');

const config = require('../../config');

const redditAuth = polka({
	onNoMatch (request, response) {
		response.end('???');
	},
});

redditAuth.get('/reddit', (request, response) => {
	const state = `${Math.random()}`; // TODO: this should be secure
	request.session.state = state;
	const scope = 'identity';
	const duration = 'permanent';
	response.redirect(`https://old.reddit.com/api/v1/authorize?client_id=${config.reddit.clientId}&response_type=code&state=${state}&redirect_uri=${config.reddit.redirectHost}/auth/reddit/callback&scope=${scope}&duration=${duration}`);
});

redditAuth.get('/reddit/callback', (request, response) => {
	const {error, state, code} = request.query;

	// Check for errors or state mismatches
	if (error) {
		log.error('Error in auth flow:', error);
		response.end('uh-oh');
		process.exit(1);
	}
	if (state !== request.session.state) {
		log.error('State mismatch in auth flow: session had', request.session.state, '; reddit gave', state);
		response.end('uh-oh');
		process.exit(1);
	}

	// Get the access token from Reddit
	// TODO
	response.end('dab');
});

module.exports = redditAuth;
