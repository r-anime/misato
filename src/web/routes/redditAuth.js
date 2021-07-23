// This file implements the OAuth 2 flow to authenticate users with Reddit. See
// https://github.com/reddit-archive/reddit/wiki/oauth2 for details of Reddit's
// OAuth implementation, and https://tools.ietf.org/html/rfc6749 for information
// about OAuth more generally.

const crypto = require('crypto');
const polka = require('polka');
const fetch = require('node-fetch');
const log = require('another-logger');

const config = require('../../../config');

/** The redirect URI for Reddit to send the user back to. */
const redditRedirectURI = `${config.web.host}/auth/reddit/callback`;

/** The base of the URI that starts the OAuth flow. State is attached later. */
/* eslint-disable operator-linebreak */ // Long URIs suck
const redditAuthURIBase = 'https://old.reddit.com/api/v1/authorize'
	+ `?client_id=${config.reddit.clientID}`
	+ '&response_type=code'
	+ `&redirect_uri=${encodeURIComponent(redditRedirectURI)}`
	+ '&scope=identity'
	+ '&duration=permanent';
/* eslint-enable */

/**
 * Generates an auth URI to redirect the user to given a state.
 * @param {string} state
 * @returns {String}
 */
function authURI (state) {
	return `${redditAuthURIBase}&state=${encodeURIComponent(state)}`;
}

/**
 * Generates a formdata body from key-value pairs.
 * @param {object} content
 * @returns {Promise<string>}
 */
function formData (content) {
	return Object.entries(content)
		.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
		.join('&');
}

/**
 * Exchanges a code for an access/refresh token pair.
 * @param {string} code
 * @returns {Promise<object>} Object has keys `accessToken`, `refreshToken`,
 * `tokenType`, `scope`, and `expiresIn`. See Reddit documentation for more
 * detailed information.
 */
async function fetchRedditTokens (code) {
	const response = await fetch('https://www.reddit.com/api/v1/access_token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			// HTTP basic auth, username = reddit client ID, pass = client secret
			'Authorization': `Basic ${Buffer.from(`${config.reddit.clientID}:${config.reddit.clientSecret}`).toString('base64')}`,
		},
		body: formData({
			grant_type: 'authorization_code',
			redirect_uri: config.reddit.redirectURI,
			code,
		}),
	});

	if (response.status !== 200) {
		throw new Error(`Reddit gave non-200 response status when requesting tokens: ${response.status}`);
	}

	const data = await response.json();
	if (data.error) {
		throw new Error(`Reddit gave an error when requesting tokens: ${data.error}`);
	}

	return {
		accessToken: data.access_token,
		refreshToken: data.refresh_token,
		tokenType: data.token_type,
		scope: data.scope,
		// Make expires_in into an absolute date, converting seconds to milliseconds along the way
		expiresAt: new Date(Date.now() + data.expires_in * 1000),
	};
}

/**
 * Fetches information about the user given their access token.
 * @param {string} accessToken
 * @returns {Promise<object>} Object has keys `name`, `avatarURL`, and
 * `created`.
 */
async function fetchRedditUserInfo (accessToken) {
	const response = await fetch('https://oauth.reddit.com/api/v1/me', {
		headers: {
			Authorization: `bearer ${accessToken}`,
		},
	});

	if (response.status !== 200) {
		throw new Error(`Reddit gave non-200 status when fetching user info: ${response.status}`);
	}

	const data = await response.json();
	return {
		name: data.name,
		avatarURL: data.subreddit && data.subreddit.icon_img,
		created: new Date(data.created_utc * 1000),
	};
}

// Define routes
module.exports = polka()

	// OAuth entry point, generate a state and redirect to Reddit
	.get('/', (request, response) => {
		const state = JSON.stringify({
			// The page we came from (send here if user cancels verification)
			prev: request.query.prev || '/',
			// The page we want to go to (send here if verification succeeds)
			next: request.query.next || '/',
			// A random element to ensure others can't tamper with the state
			unique: crypto.randomBytes(16).toString('hex'),
		});
		request.session.redditState = state;
		response.redirect(authURI(state));
	})

	// OAuth flow has completed, time to authorize with Reddit
	.get('/callback', async (request, response) => {
		const {error, state, code} = request.query;

		// Check for missing state/state mismatch
		if (!state || !request.session.redditState || state !== request.session.redditState) {
			log.error('Reddit gave incorrect state after auth page: ', state, ', expected', request.session.state);
			response.end('uh-oh');
			return;
		}

		// Parse information from the state
		let parsedState;
		try {
			parsedState = JSON.parse(state);
		} catch (parsingError) {
			// This should never happen - we somehow created a state that isn't valid JSON
			log.error('When parsing state:', parsingError, 'State:', state);
			response.end('Please try again. If issues persist, report this error to the bot administrator.\n\nError parsing state');
			return;
		}
		const {prev, next} = parsedState;

		// We're done storing the state now
		delete request.session.redditState;

		// Check for access denied (cancellation condition) and other errors
		if (error === 'access_denied') {
			response.redirect(prev);
			return;
		} else if (error) {
			log.error('Reddit gave error after auth page:', error);
			// TODO: error page
			response.end(`Please try again. If issues persist, report this error to the bot adminstrator.\n\nError: ${error}`);
			return;
		}

		// Exchange the code for access/refresh tokens
		let tokens;
		try {
			tokens = await fetchRedditTokens(code);
		} catch (tokenError) {
			log.error('Error requesting Reddit access token:', tokenError);
			response.end('Error requesting Reddit authorization. Please try again. Contact a developer if the error persists.');
			return;
		}

		// Store tokens and expiry in the user's session
		request.session.redditAccessToken = tokens.accessToken;
		request.session.redditRefreshToken = tokens.refreshToken;
		request.session.redditTokenExpiresAt = tokens.expiresAt;

		// Fetch Reddit user info and store in the user's session
		try {
			request.session.redditUserInfo = await fetchRedditUserInfo(tokens.accessToken);
		} catch (userInfoError) {
			log.error('Error fetching Reddit user info:', userInfoError);
			response.end('Error fetching your account details. Please try again. Contact a developer if the error persists.');
			return;
		}

		// Redirect back to wherever we came from
		response.redirect(next);
	})

	// Returns information about the user's account
	.get('/about', (request, response) => {
		if (request.session.redditUserInfo) {
			response.end(JSON.stringify(request.session.redditUserInfo));
		} else {
			response.writeHead(404).end();
		}
	})

	// Logs out of Reddit
	.get('/logout', (request, response) => {
		delete request.session.redditAccessToken;
		delete request.session.redditRefreshToken;
		delete request.session.redditTokenExpiresAt;
		delete request.session.redditUserInfo;

		response.redirect(request.query.next || '/');
	});
