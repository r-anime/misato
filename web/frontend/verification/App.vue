<template>
	<div class="container app">
		<div class="section">
			<template v-if="!loaded">
				<p>Loading...</p>
			</template>
			<template v-else>
				<template v-if="discordInfo">
					<p>You're logged in as @{{ discordInfo.username }}#{{ discordInfo.discriminator }}. <a href="/auth/discord/logout?next=/verification">Log out</a></p>
				</template>
				<p v-else>
					<a
						href="/auth/discord?next=/verification"
						class="button"
					>Log in with Discord</a>
				</p>
				<template v-if="redditInfo">
					<p>You're logged in as /u/{{ redditInfo.name }}. <a href="/auth/reddit/logout?next=/verification">Log out</a></p>
				</template>
				<p v-else>
					<a
						href="/auth/reddit?next=/verification"
						class="button"
					>Log in with Reddit</a>
				</p>
			</template>
		</div>
		<div class="section">
			<p v-if="discordInfo && redditInfo">
				<button
					class="button"
					@click="linkAccounts()"
				>
					Link accounts
				</button>
			</p>
			<p v-else>
				Log in with both Reddit and Discord to link your accounts.
			</p>
		</div>
	</div>
</template>

<script>
export default {
	data () {
		return {
			redditInfo: undefined,
			discordInfo: undefined,
		};
	},
	computed: {
		loaded () {
			return this.redditInfo !== undefined && this.discordInfo !== undefined;
		},
	},
	mounted () {
		this.getDiscordInfo();
		this.getRedditInfo();
	},
	methods: {
		getDiscordInfo () {
			fetch('/auth/discord/about').then(async response => {
				this.discordInfo = response.ok ? await response.json() : null;
			});
		},
		getRedditInfo () {
			fetch('/auth/reddit/about').then(async response => {
				this.redditInfo = response.ok ? await response.json() : null;
			});
		},
		linkAccounts () {
			fetch('/api/verification/', {method: 'POST'}).then(async response => {
				if (response.ok) {
					alert('Linked!');
				} else {
					alert('Failed to link');
				}
			});
		},
		// TODO
		// unlinkAccounts () {
		// 	fetch('/api/verification', {method: 'DELETE'}).then(async response => {
		// 		if (response.ok) {
		// 			alert('Unlinked!');
		// 		} else {
		// 			alert('Failed to unlink');
		// 		}
		// 	});
		// },
	},
};
</script>

<style lang="scss" src="../common/customization.scss"></style>
