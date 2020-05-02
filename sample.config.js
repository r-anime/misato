// Sample configuration file. Rename this to `config.js` and fill in your values.

module.exports = {
	// Mongo database information
	mongodb: {
		url: 'mongodb://localhost',
		databaseName: 'test',
	},

	// Discord bot options
	discord: {
		token: 'discord bot token goes here',
		prefix: '.',
		clientID: 'discord app client ID goes here',
		clientSecret: 'discord app client secret goes here',
		redirectURI: 'discord redirect URI goes here',
	},

	// Reddit API authorization info
	reddit: {
		clientID: 'reddit app client ID goes here',
		clientSecret: 'reddit app client secret goes here',
		userAgent: 'put in a user agent that includes your /u/',
		redirectURI: 'reddit redirect URI goes here',
	},

	// Web server config
	web: {
		host: 'http://localhost:4567',
		port: 4567,
		sessionSecret: 'lkasjdf;',
		// Options for hosting an HTTPS server (leave unset for HTTP only in development)
		// https: {
		// 	keyPath: '',
		// 	certPath: '',
		// },
	},
};
