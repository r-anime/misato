// Temporary file since mounting multiple sub-apps to the same base doesn't seem to work with Polka
import polka from 'polka';
import redditAuth from './redditAuth';
import discordAuth from './discordAuth';

export default polka()
	.use('/reddit', redditAuth)
	.use('/discord', discordAuth);
