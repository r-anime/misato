// This file implements the OAuth 2 flow to authenticate users with Discord. See
// https://discordapp.com/developers/docs/topics/oauth2#authorization-code-grant
// for details of Discord's OAuth implementation, and
// https://tools.ietf.org/html/rfc6749 for information about OAuth in general.

const crypto = require('crypto');
const polka = require('polka');
const fetch = require('node-fetch');
const log = require('another-logger');

const config = require('../../config');

/** The redirect URI for Discord to send the user back to. */
const discordRedirectURI = `${config.web.host}/auth/discord/callback`;

/** The base of the URI that starts the OAuth flow. State is attached later. */
/* eslint-disable operator-linebreak */ // Long URIs suck
const discordAuthURIBase = 'https://discordapp.com/api/oauth2/authorize'
	+ `?client_id=${config.discord.clientID}`
	+ '&response_type=code'
	+ `&redirect_uri=${encodeURIComponent(discordRedirectURI)}`
	+ '&scope=identify'
	+ '&prompt=consent'; // Special Discord-only thing, always show prompt even if user previously authorized
/* eslint-enable */

/**
 * Generates an auth URI to redirect the user to given a state.
 * @param {string} state
 * @returns {String}
 */
function authURI (state) {
	return `${discordAuthURIBase}&state=${encodeURIComponent(state)}`;
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
 * Generates an avatar URL for the user. Discord avatars are weird so I split
 * this out.
 * @see https://discordapp.com/developers/docs/reference#image-formatting
 * @param {object} userInfo
 * @returns {string}
 */
function discordAvatarURL (userInfo) {
	if (userInfo.avatar) {
		return `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`;
	}
	return `https://cdn.discordapp.com/embed/avatars/${parseInt(userInfo.discriminator, 10) % 5}.png`;
}

/**
 * Exchanges a code for an access/refresh token pair.
 * @param {string} code
 * @returns {Promise<object>} Object has keys `accessToken`, `refreshToken`,
 * `tokenType`, `scope`, and `expiresAt`. See Discord documentation for more
 * detailed information.
 */
async function fetchDiscordTokens (code) {
	const response = await fetch('https://discordapp.com/api/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: formData({
			client_id: config.discord.clientID,
			client_secret: config.discord.clientSecret,
			grant_type: 'authorization_code',
			code,
			redirect_uri: config.discord.redirectURI,
			scope: 'identify', // Discord-specific: scope is required here too and must match
		}),
	});

	if (response.status !== 200) {
		throw new Error(`Discord gave non-200 response status when requesting tokens: ${response.status}`);
	}

	const data = await response.json();
	if (data.error) {
		throw new Error(`Discord gave an error when requesting tokens: ${data.error}`);
	}
	return {
		accessToken: data.access_token,
		refreshToken: data.refresh_token,
		tokenType: data.token_type,
		scope: data.scope,
		expiresAt: new Date(Date.now() + data.expires_in * 1000),
	};
}

/**
 * Fetches information about the user given their access token.
 * @param {string} accessToken
 * @returns {Promise<object>} Object has keys `name`, `avatarURL`, and
 * `created`.
 */
async function fetchDiscordUserInfo (accessToken) {
	const response = await fetch('https://discordapp.com/api/v6/users/@me', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (response.status !== 200) {
		throw new Error(`Discord gave non-200 status when fetching user info: ${response.status}`);
	}

	const data = await response.json();
	return {
		username: data.username,
		discriminator: data.discriminator,
		id: data.id,
		avatarURL: discordAvatarURL(data),
	};
}

// Define routes
module.exports = polka()

	// OAuth entry point, generate a state and redirect to Discord
	.get('/', (request, response) => {
		const state = JSON.stringify({
			next: request.query.next || '/',
			unique: crypto.randomBytes(256).toString('hex'),
		});
		request.session.discordState = state;
		response.redirect(authURI(state));
	})

	// OAuth flow has completed, time to authorize with Discord
	.get('/callback', async (request, response) => {
		const {error, state, code} = request.query;

		// Check for errors or state mismatches
		if (error) {
			log.error('Discord gave error after auth page:', error);
			response.end('uh-oh');
			return;
		}
		if (state !== request.session.discordState) {
			log.error('Discord gave incorrect state after auth page: ', state, ', expected', request.session.state);
			response.end('uh-oh');
			return;
		}

		// This should be safe, because the block above ensures we only ever try to parse things that we put in the
		// session ourselves, and we only put valid JSON there. We want to get the next URL so we can use it later.
		const {next} = JSON.parse(state);

		// Exchange the code for access/refresh tokens
		let tokens;
		try {
			tokens = await fetchDiscordTokens(code);
		} catch (tokenError) {
			log.error('Error requesting Discord access token:', tokenError);
			response.end('Error requesting Discord authorization. Please try again. Contact a developer if the error persists.');
			return;
		}

		// Store tokens and expiry in the user's session
		request.session.discordAccessToken = tokens.accessToken;
		request.session.discordRefreshToken = tokens.refreshToken;
		request.session.discordTokenExpiresAt = tokens.expiresAt;

		// Fetch Discord user info and store in the user's session
		try {
			request.session.discordUserInfo = await fetchDiscordUserInfo(tokens.accessToken);
		} catch (userInfoError) {
			log.error('Error fetching Discord user info:', userInfoError);
			response.end('Error fetching your account details. Please try again. Contact a developer if the error persists.');
			return;
		}

		response.redirect(next);
	})

	// Gets info about the user's Discord account
	.get('/about', (request, response) => {
		if (request.session.discordAccessToken) {
			response.end(JSON.stringify(request.session.discordUserInfo));
		} else {
			response.writeHead(404).end();
		}
	})

	// Logs out of Discord
	.get('/logout', (request, response) => {
		delete request.session.discordAccessToken;
		delete request.session.discordRefreshToken;
		delete request.session.discordTokenExpiresAt;
		delete request.session.discordUserInfo;

		response.redirect(request.query.next || '/');
	});
