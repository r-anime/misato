// Allows executing arbitrary Javascript expressions in bot scope (owner-only).

import debug from 'yuuko/dist/commands/debug';
debug.help = {
	desc: 'Allows the bot owner to execute aribrary JavaScript expressions in the same scope as the bot',
};
export default debug;
