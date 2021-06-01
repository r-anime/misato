<template>
	<b-dropdown custom>
		<template #trigger>
			<button class="button">
				<template v-if="emoji">
					<img
						class="emoji-display"
						:src="emojiImageLocation(emoji)"
						:alt="emoji.name"
					>
					<span>
						{{ emoji.name }}
					</span>
				</template>
				<template v-else>
					Choose an emoji
				</template>
			</button>
		</template>

		<!-- TODO: add search bar -->
		<div class="emoji-grid">
			<button
				v-for="e in emojis"
				:key="e.name + ':' + e.id"
				@click="selectEmoji(e)"
			>
				<img
					class="emoji-display"
					:src="emojiImageLocation(e)"
					:alt="e.name"
				>
			</button>
		</div>
	</b-dropdown>
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
		emoji () {
			return this.emojis.find(e => e.id === this.value || e.name === this.value);
		},
	},
	methods: {
		emojiImageLocation (emoji) {
			return `https://cdn.discordapp.com/emojis/${emoji.id}.png`;
		},
		selectEmoji (emoji) {
			this.$emit('input', emoji.id);
		},
	},
};
</script>

<style lang="scss">
.emoji-display {
	height: 100%;
}

.emoji-grid {
	display: flex;
	flex-wrap: wrap;
	width: 12em + (0.5em * 2);
	padding: 0 0.5em;

	button {
		margin: 0;
		padding: 0.125em;
		border: 0;
		background: 0;
		font-size: inherit;
		height: 2em;
		border-radius: 0.125em;

		&:hover {
			background: rgba(0 0 0 / 0.2);
		}
	}
}
</style>
