// Temporary file since mounting multiple sub-apps to the same base doesn't seem to work with Polka

module.exports = db => require('polka')()
	.use('/verification', require('./verification')(db));
