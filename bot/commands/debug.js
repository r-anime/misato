// Allows executing arbitrary Javascript expressions in bot scope (owner-only).

module.exports = require('yuuko/dist/commands/debug');

// command sets the owner requirement but that requirement doesn't currently respect team members, yuuko bug, monkeypatch for now
module.exports.requirements = {
	custom (message, args, {client}) {
		return client.app.owner.id === message.author.id || client.app.team.members.some(member => member.membership_state === 2 && member.user.id === message.author.id);
	},
};
