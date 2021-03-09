const {Command} = require('yuuko');
const log = require('another-logger');
const {isValidRule} = require('../../../common/filters');
const {escape} = require('../../util/formatting');

function makeRuleForText (text) {
	const rule = {
		type: 'containsText',
		field: 'content',
		text,
	};

	// Temporary runtime check to ensure the created rule is valid
	// TODO: remove this check once confident it won't blow up
	if (!isValidRule(rule)) {
		throw new TypeError('Computed rule was invalid');
	}

	return rule;
}

module.exports = new Command('filteradd', async (msg, args, {db}) => {
	const guildID = msg.channel.guild.id;
	const ruleText = args.join(' ');

	// Fetch the existing configuration
	const filterConfig = await db.collection('messageFilters').findOne({guildID});
	const existingRule = filterConfig ? filterConfig.rule : null;

	// Modify the existing rule to add the new phrase
	let rule = makeRuleForText(ruleText);
	if (existingRule.type === 'multiple' && existingRule.op === 'or') {
		// If we already have a top-level "or" rule, we add the new rule as a child of that one
		existingRule.children.push(rule);
		rule = existingRule;
	} else {
		// Otherwise, wrap the rule in a new "or" rule and use that
		rule = {
			type: 'multiple',
			op: 'or',
			children: [
				rule,
			],
		};
		// existingRule might be null if the guild didn't have any rule yet, in which case we don't care about it, but
		// if there *is* a rule already there, then it needs to be included in the children of the new top-level rule
		if (existingRule) {
			rule.children.unshift(existingRule);
		}
	}

	// Another temporary runtime check to ensure the created rule is valid
	// TODO: remove this check once confident it won't blow up
	if (!isValidRule(rule)) {
		throw new TypeError('Computed rule was invalid');
	}

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

	msg.channel.createMessage(`Created new filter for \`${escape(ruleText)}\`.`).catch(() => {});
}, {
	guildOnly: true,
	permissions: [
		'manageMessages',
	],
});

module.exports.help = {
	args: '<filter text>',
	desc: 'Adds a new filter rule which matches the given text.',
};
