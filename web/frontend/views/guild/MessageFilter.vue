<template>
	<div>
		<h1 class="title">
			Message Filter
		</h1>

		<filter-editor
			v-if="loaded"
			v-model="rule"
		/>
		<b-loading v-else />
	</div>
</template>

<script>
import FilterEditor from '../../components/FilterEditor';

export default {
	components: {FilterEditor},
	data () {
		return {
			rule: null,
		};
	},
	computed: {
		guildID () {
			return this.$route.params.guildID;
		},
		loaded () {
			return !!this.rule;
		},
	},
	async created () {
		const rule = await fetch(`/api/filters/${this.guildID}/configuration`).then(response => {
			if (response.ok) {
				return response.json();
			}
			return {};
		});
		this.rule = JSON.stringify(rule);
	},
};
</script>
