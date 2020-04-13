const polka = require('polka');
const log = require('another-logger');

const config = require('../../config');

// The redirect URI for Discord to send the user back to
const discordRedirectURI = `${config.web.host}/auth/discord/callback`;

// The base of the URI that starts the OAuth flow
/* eslint-disable operator-linebreak */ // Long URIs suck
const discordAuthURIBase = 'https://discordapp.com/api/oauth2/authorize'
	+ `?client_id=${config.discord.clientID}`
	+ '&response_type=code'
	+ `&redirect_uri=${encodeURIComponent(discordRedirectURI)}`
	+ '&scope=identify';
/* eslint-enable */

// Generates an auth URI to redirect the user to given a state
function authURI (state) {
	return `${discordAuthURIBase}&state=${encodeURIComponent(state)}`;
}

const discordAuth = polka();

discordAuth.get('/', (request, response) => {
	const state = `${Math.random()}`; // TODO: this should be secure
	request.session.state = state;
	response.redirect(authURI(state));
});

discordAuth.get('/callback', (request, response) => {
	const {error, state, code} = request.query;

	// Check for errors or state mismatches
	if (error) {
		log.error('Error in auth flow:', error);
		response.end('uh-oh');
		process.exit(1);
	}
	if (state !== request.session.state) {
		log.error('State mismatch in auth flow: session had', request.session.state, '; discord gave', state);
		response.end('uh-oh');
		process.exit(1);
	}

	// Get the access token from Discord
	// TODO
	log.info(code);
	response.end('dab');
});

module.exports = discordAuth;
