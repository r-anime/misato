// Temporary file since mounting multiple sub-apps to the same base doesn't seem to work with Polka
// TODO: this probably isn't necessary with latest polka, investigate

const app = require('polka')();
const createVerificationApp = require('./verification');

module.exports = db => app
	.use('/verification', createVerificationApp(db));
