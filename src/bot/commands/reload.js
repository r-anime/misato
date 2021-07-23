// Reloads bot components from disk for development (owner-only).

import reload from 'yuuko/dist/commands/reload';
reload.help = {
	desc: 'Allows the bot owner to reload the bot from disk for development purposes.',
};
export default reload;
