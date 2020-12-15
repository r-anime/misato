<template>
	<div>
		<h1 class="title">
			Message Filter
		</h1>

		<div class="level">
			<div class="level-left">
				<div class="field is-grouped">
					<div class="control">
						<b-button
							type="is-success"
							:disabled="rule === lastRule"
							@click="submit()"
						>
							Save
						</b-button>
					</div>
					<div class="control">
						<b-button
							type="is-danger"
							:disabled="rule === lastRule"
							@click="reset()"
						>
							Reset
						</b-button>
					</div>
				</div>
			</div>
			<div class="level-right">
				<div class="field has-addons">
					<div class="control">
						<b-button>
							Import
						</b-button>
					</div>
					<div class="control">
						<b-button>
							Export
						</b-button>
					</div>
				</div>
			</div>
		</div>

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
			lastRule: null,
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
		this.lastRule = this.rule;
	},
	methods: {
		async submit () {
			const response = await fetch(`/api/filters/${this.guildID}/configuration`, {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: this.rule,
			});
			if (response.ok) {
				this.lastRUle = this.rule;
			} else {
				// eslint-disable-next-line no-alert
				alert(`Failed to save, status code ${response.status} ${response.statusText}.`);
			}
		},
		reset () {
			this.rule = this.lastRule;
		},
	},
};
</script>
