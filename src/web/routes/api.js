// Temporary file since mounting multiple sub-apps to the same base doesn't seem to work with Polka
// TODO: this probably isn't necessary with latest polka, investigate

import polka from 'polka'
import createVerificationApp from './verification';
import createFiltersApp from './filters';
import createGuildsApp from './guilds';
import createChannelAutomationApp from './channelAutomation';

export default (db, client) => polka()
	.use('/guilds', createGuildsApp(db, client))
	.use('/filters', createFiltersApp(db, client))
	.use('/verification', createVerificationApp(db, client))
	.use('/channel-automation', createChannelAutomationApp(db, client));
