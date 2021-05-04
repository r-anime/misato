<template>
	<b-select
		:value="value"
		@input="$emit('input', $event)"
	>
		<slot name="options" />
		<option
			v-if="includeNoChannel"
			:value="null"
		>
			(no category)
		</option>
		<option
			v-for="channel in categoryChannels"
			:key="channel.id"
			:value="channel.id"
		>
			{{ channel.name }}
		</option>
	</b-select>
</template>

<script>
export default {
	props: {
		value: {
			type: String,
			default: null,
		},
		channels: {
			type: Array,
			default: () => [],
		},
		includeNoChannel: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		categoryChannels () {
			return (this.channels || [])
				// type 4: GUILD_CATEGORY
				// https://discord.com/developers/docs/resources/channel#channel-object-channel-types
				.filter(c => c.type === 4)
				// sort by position
				.sort((a, b) => a.position - b.position);
		},
	},
};
</script>
