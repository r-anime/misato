<template>
	<b-dropdown custom>
		<template #trigger>
			<button class="button">
				<template v-if="emoji && emoji.id">
					<img
						class="emoji-display"
						:src="emojiImageLocation(emoji)"
						:alt="emoji.name"
					>
					<span>
						{{ emoji.name }}
					</span>
				</template>
				<template v-else-if="emoji">
					<span class="emoji-display native-emoji">
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
				v-for="e in sortedEmojis"
				:key="e.name + ':' + e.id"
				@click="selectEmoji(e)"
			>
				<template v-if="e.id">
					<img
						class="emoji-display"
						:src="emojiImageLocation(e)"
						:alt="e.name"
					>
				</template>
				<template v-else>
					<span class="emoji-display native-emoji">
						{{ e.name }}
					</span>
				</template>
			</button>
		</div>
	</b-dropdown>
</template>

<script>
import {default as emojiList} from 'emojis-list';
import {default as twemoji} from 'twemoji';
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
	data () {
		return {
			nativeEmojis: emojiList.map(e => ({
				animated: false,
				guildID: null,
				id: null,
				name: e,
			})),
		};
	},
	computed: {
		sortedEmojis () {
			return [...this.emojis].sort((a, b) => a.name.localeCompare(b.name)).concat(...this.nativeEmojis);
		},
		emoji () {
			return this.sortedEmojis.find(e => e.id === this.value || e.name === this.value);
		},
	},
	watch: {
		emoji () {
			setTimeout(() => {
				this.runTwemoji();
			}, 50);
		},
	},
	created () {
		setTimeout(() => {
			this.runTwemoji();
		}, 5);
	},
	methods: {
		emojiImageLocation (emoji) {
			return `https://cdn.discordapp.com/emojis/${emoji.id}.png`;
		},
		selectEmoji (emoji) {
			this.$emit('input', emoji.id || emoji.name);
		},
		runTwemoji () {
			twemoji.parse(this.$el);
		},
	},
};
</script>

<style lang="scss">
.emoji-display {
	display: inline-block;
	width: 2rem;
	height: 2rem;
}

.emoji-grid {
	display: flex;
	flex-wrap: wrap;
	width: 6 * (2rem + 0.125rem + 0.125rem) + 1.5rem;
	max-height: 200px;
	box-sizing: content-box;
	padding: 0 0.5em;
	overflow: auto;

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
