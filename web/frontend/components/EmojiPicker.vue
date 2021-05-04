<template>
	<b-select
		:value="value"
		@input="$emit('input', $event)"
	>
		<slot name="options" />
		<option
			v-for="emoji in sortedEmojis"
			:key="emoji.id"
			:value="emoji.id"
			:style="`background: url(${emojiImageLocation(emoji)}) center left/contain`"
		>
			{{ emoji.name }}
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
		emojis: {
			type: Array,
			default: () => [],
		},
	},
	computed: {
		sortedEmojis () {
			return [...this.emojis].sort((a, b) => a.name.localeCompare(b.name));
		},
	},
	methods: {
		emojiImageLocation (emoji) {
			return `https://cdn.discordapp.com/emojis/${emoji.id}.png`;
		},
	},
};
</script>
