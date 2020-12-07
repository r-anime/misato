<template>
	<div>
		<h1 class="title">
			User Information: {{ userID }}
		</h1>
		<table
			v-if="things.length"
			class="table"
		>
			<thead>
				<tr>
					<th>Date</th>
					<th>Type</th>
					<th>Note</th>
					<th>Moderator</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="thing in things"
					:key="thing._id"
				>
					<td>{{ thing.date.toLocaleString() }}</td>
					<td>{{ thing.type }}</td>
					<td>{{ thing.note }}</td>
					<td>{{ thing.modID }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
export default {
	data () {
		return {
			notes: null,
			warnings: null,
			kicks: null,
			bans: null,
		};
	},
	computed: {
		guildID () {
			return this.$route.params.guildID;
		},
		userID () {
			return this.$route.params.userID;
		},
		things () {
			if (!this.notes || !this.warnings || !this.kicks || !this.bans) {
				return [];
			}
			return [
				...this.notes.map(note => ({...note, type: 'note'})),
				...this.warnings.map(warning => ({...warning, type: 'warning'})),
				...this.kicks.map(kick => ({...kick, type: 'kick'})),
				...this.bans.map(ban => ({...ban, type: 'ban'})),
			]
				.map(thing => ({...thing, date: new Date(thing.date)}))
				.sort((a, b) => a.date - b.date);
		},
	},
	created () {
		Promise.all([
			fetch(`/api/guilds/${this.guildID}/members/${this.userID}/notes`).then(response => response.json()),
			fetch(`/api/guilds/${this.guildID}/members/${this.userID}/warnings`).then(response => response.json()),
			fetch(`/api/guilds/${this.guildID}/members/${this.userID}/kicks`).then(response => response.json()),
			fetch(`/api/guilds/${this.guildID}/members/${this.userID}/bans`).then(response => response.json()),
		]).then(([notes, warnings, kicks, bans]) => {
			this.notes = notes;
			this.warnings = warnings;
			this.kicks = kicks;
			this.bans = bans;
		});
	},
};
</script>
