// Temporary file since mounting multiple sub-apps to the same base doesn't seem to work with Polka
// TODO: this probably isn't necessary with latest polka, investigate

const app = require('polka')();
const createVerificationApp = require('./verification');
const createFiltersApp = require('./filters');
const createGuildsApp = require('./guilds');
const createChannelAutomationApp = require('./channelAutomation');

module.exports = (db, client) => app
	.use('/guilds', createGuildsApp(db, client))
	.use('/filters', createFiltersApp(db, client))
	.use('/verification', createVerificationApp(db, client))
	.use('/channel-automation', createChannelAutomationApp(db, client));
