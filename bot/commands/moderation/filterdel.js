const {Command} = require('yuuko');
const log = require('another-logger');
const {escape} = require('../../util/formatting');

module.exports = new Command(['filterdel', 'filterdelete', 'filterremove'], async (msg, args, {db}) => {
	const guildID = msg.channel.guild.id;
	const ruleText = args.join(' ').toLowerCase();

	// Fetch the existing configuration
	const filterConfig = await db.collection('messageFilters').findOne({guildID});

	// Only search for the rule as a direct child of a top-level "or" rule - ignore if there is no config yet
	if (filterConfig && filterConfig.rule.type === 'multiple' && filterConfig.rule.op === 'or') {
		const rule = filterConfig.rule;

		// Find the rule as a direct child of the top-level rule
		const index = rule.children.findIndex(childRule => childRule.type === 'containsText' && childRule.field === 'content' && childRule.text.toLowerCase() === ruleText);
		if (index !== -1) {
			// Remove the child rule
			filterConfig.rule.children.splice(index, 1);

			// Write the rule to the database
			try {
				await db.collection('messageFilters').replaceOne({guildID}, {guildID, rule}, {
					upsert: true,
				});
			} catch (error) {
				log.error(`Database error while writing filter config for guild ${guildID}:`, error);
				msg.channel.createMessage('Failed to write the new filter. Try adding via the website instead.').catch(() => {});
				return;
			}

			msg.channel.createMessage(`Deleted the filter for \`${escape(ruleText)}\`.`).catch(() => {});
			return;
		}
	}

	msg.channel.createMessage(`No filter found for \`${escape(ruleText)}\`. (This command is naive; consider checking the website.)`).catch(() => {});
}, {
	guildOnly: true,
	permissions: [
		'manageMessages',
	],
});

module.exports.help = {
	args: '<filter text>',
	desc: 'Removes an existing filter rule which matches the given text.',
};
