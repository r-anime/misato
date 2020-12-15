<template>
	<div>
		<h1 class="title">
			Verification Settings
		</h1>
		<b-field label="Verification role">
			<b-select
				v-model="verificationRoleID"
				placeholder="Select a role"
				:loading="!loaded"
			>
				<template v-if="loaded">
					<option
						v-for="role in guildRoles"
						:key="role.id"
						:value="role.id"
						:style="roleColorStyle(role.color)"
					>
						{{ role.name }}
					</option>
				</template>
			</b-select>
		</b-field>

		<b-field grouped>
			<b-button
				type="is-success"
				:loading="submitting"
				@click="submit()"
			>
				Save
			</b-button>
		</b-field>
	</div>
</template>

<script>
export default {
	data () {
		return {
			guildRoles: null,
			verificationRoleID: null,
			loadedGuildSettings: false,
			submitting: false,
		};
	},
	computed: {
		loaded () {
			return this.guildRoles && this.loadedGuildSettings;
		},
		guildID () {
			return this.$route.params.guildID;
		},
	},
	async created () {
		// TODO: error handling
		this.guildRoles = (await fetch(`/api/guilds/${this.guildID}/roles`).then(response => response.json()))
			.sort((a, b) => b.position - a.position)
			.filter(role => role.id !== this.guildID);

		const guildSettings = await fetch(`/api/verification/${this.guildID}/configuration`).then(response => {
			if (response.status === 404) {
				return {};
			}
			return response.json();
		});
		this.verificationRoleID = guildSettings.roleID;
		this.loadedGuildSettings = true;
	},
	methods: {
		roleColorStyle (color) {
			return `color: #${color.toString(16).padStart(6, '0')};`;
		},
		async submit () {
			this.submitting = true;
			const response = await fetch(`/api/verification/${this.guildID}/configuration`, {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					roleID: this.verificationRoleID,
				}),
			});
			this.submitting = false;
			if (!response.ok) {
				// eslint-disable-next-line no-alert
				alert(`Couldn't save settings, server gave status code ${response.status}.`);
			}
		},
	},
};
</script>
