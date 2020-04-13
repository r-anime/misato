const polka = require('polka');
const log = require('another-logger');

const config = require('../../config');

// The redirect URI for Discord to send the user back to
const redditRedirectURI = `${config.web.host}/auth/reddit/callback`;

// The base of the URI that starts the OAuth flow
/* eslint-disable operator-linebreak */ // Long URIs suck
const redditAuthURIBase = 'https://old.reddit.com/api/v1/authorize'
	+ `?client_id=${config.reddit.clientID}`
	+ '&response_type=code'
	+ `&redirect_uri=${encodeURIComponent(redditRedirectURI)}`
	+ '&scope=identity'
	+ '&duration=permanent';
/* eslint-enable */

// Generates an auth URI to redirect the user to given a state
function authURI (state) {
	return `${redditAuthURIBase}&state=${encodeURIComponent(state)}`;
}
const redditAuth = polka();

redditAuth.get('/', (request, response) => {
	const state = `${Math.random()}`; // TODO: this should be secure
	request.session.state = state;
	response.redirect(authURI(state));
});

redditAuth.get('/callback', (request, response) => {
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
	log.info(code);
	request.session.redditCode = code; // very temporary
	response.redirect('/');
});

module.exports = redditAuth;
