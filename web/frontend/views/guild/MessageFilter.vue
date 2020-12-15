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
							:loading="submitting"
							@click="submit()"
						>
							Save
						</b-button>
					</div>
					<div class="control">
						<b-button
							type="is-danger"
							:disabled="rule === lastRule"
							@click="revert()"
						>
							Revert
						</b-button>
					</div>
				</div>
			</div>
			<div class="level-right">
				<div class="field has-addons">
					<div class="control">
						<b-button disabled>
							Import
						</b-button>
					</div>
					<div class="control">
						<b-button disabled>
							Export
						</b-button>
					</div>
				</div>
			</div>
		</div>

		<div class="block">
			<div class="content">
				<p class="subtitle">
					Delete any message that...
				</p>
			</div>
		</div>

		<filter-editor
			v-if="loaded"
			v-model="rule"
		/>
		<b-loading
			v-else
			:active="true"
			:is-full-page="false"
		/>
	</div>
</template>

<script>
import FilterEditor from '../../components/FilterEditor';

export default {
	components: {
		FilterEditor,
	},
	data () {
		return {
			rule: null,
			lastRule: null,
			submitting: false,
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
			return {type: 'multiple', op: 'or', children: []};
		});
		this.rule = JSON.stringify(rule);
		this.lastRule = this.rule;
	},
	methods: {
		async submit () {
			this.submitting = true;
			const response = await fetch(`/api/filters/${this.guildID}/configuration`, {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: this.rule,
			});
			this.submitting = false;
			if (response.ok) {
				this.lastRule = this.rule;
			} else {
				// eslint-disable-next-line no-alert
				alert(`Failed to save, status code ${response.status} ${response.statusText}.`);
			}
		},
		revert () {
			this.rule = this.lastRule;
		},
	},
};
</script>
