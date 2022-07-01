import {SlashCommand} from 'yuuko';
import {Constants} from 'eris';
import {promptModal} from '../util/discord';
import {blockquote, escape} from '../util/formatting';

export default new SlashCommand('modal-test', {
	description: 'Pulls up a modal',
}, async (interaction, {client}) => {
	const modalInteraction = await promptModal(client, interaction, {
		title: 'Hello there!',
		components: [
			{
				type: Constants.ComponentTypes.ACTION_ROW,
				components: [
					{
						custom_id: 'title',
						label: 'Title',
						type: Constants.ComponentTypes.TEXT_INPUT,
						style: Constants.TextInputStyles.SHORT,
						max_length: 200, // TODO: pick something better
						required: true,
					},
				],
			},
			{
				type: Constants.ComponentTypes.ACTION_ROW,
				components: [
					{
						custom_id: 'message',
						label: 'Message',
						type: Constants.ComponentTypes.TEXT_INPUT,
						style: Constants.TextInputStyles.PARAGRAPH,
						max_length: 4000, // TODO: pick something better
						required: true,
					},
				],
			},
		],
	}, {
		timeout: 10 * 30 * 1000,
	});
	modalInteraction.acknowledge();

	interaction.createFollowup({
		flags: Constants.MessageFlags.EPHEMERAL,
		content: `Thanks for submitting **"${escape(modalInteraction.data.components[0].components[0].value)}"**\n${blockquote(escape(modalInteraction.data.components[1].components[0].value))}`,
	});
});
