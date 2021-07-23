// Temporary file since mounting multiple sub-apps to the same base doesn't seem to work with Polka

module.exports = require('polka')()
	.use('/reddit', require('./redditAuth'))
	.use('/discord', require('./discordAuth'));
