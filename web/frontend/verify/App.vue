<template>
	<div class="app">
		<b-navbar
			type="is-primary"
			wrapper-class="container"
		>
			<template slot="brand">
				<b-navbar-item tag="span">
					/r/anime Discord!
				</b-navbar-item>
			</template>
			<template slot="end">
				<b-navbar-dropdown
					v-if="discordInfo"
					right
					boxed
				>
					<template slot="label">
						<figure class="avatar image is-32x32">
							<img :src="discordInfo.avatarURL + '?size=64'">
						</figure>
					</template>
					<b-navbar-item tag="span">
						<span>Hi, <strong>{{ discordInfo.username }}#{{ discordInfo.discriminator }}</strong></span>
					</b-navbar-item>
					<b-navbar-item :href="'/auth/discord/logout?next=' + temp">
						Log out
					</b-navbar-item>
				</b-navbar-dropdown>
			</template>
		</b-navbar>
		<div class="container">
			<div class="section">
				<template v-if="!loaded">
					<b-loading :active="true" />
				</template>
				<template v-else>
					<div class="columns is-centered is-multiline">
						<div class="column is-narrow">
							<div
								v-if="discordInfo"
								class="box account-box has-text-centered"
							>
								<figure class="image avatar is-128x128">
									<img :src="discordInfo.avatarURL">
								</figure>
								<p>
									<strong>{{ discordInfo.username }}#{{ discordInfo.discriminator }}</strong>
								</p>
								<p><a :href="`/auth/discord/logout?next=${temp}`">Log out</a></p>
							</div>
							<p v-else>
								<a
									:href="`/auth/discord?next=${temp}`"
									class="button"
								>Log in with Discord</a>
							</p>
						</div>
						<div class="column is-narrow">
							<div
								v-if="redditInfo"
								class="box account-box"
							>
								<figure class="image avatar is-128x128">
									<img :src="redditInfo.avatarURL">
								</figure>
								<p><strong>/u/{{ redditInfo.name }}</strong></p>
								<p><a :href="`/auth/reddit/logout?next=${temp}`">Log out</a></p>
							</div>
							<p v-else>
								<a
									:href="`/auth/reddit?next=${temp}`"
									class="button"
								>Log in with Reddit</a>
							</p>
						</div>
					</div>
					<div class="level">
						<div class="level-item">
							<p v-if="discordInfo && redditInfo">
								<button
									class="button is-large is-success"
									@click="linkAccounts()"
								>
									Link these accounts
								</button>
							</p>
							<p v-else>
								Log in with both Reddit and Discord to link your accounts.
							</p>
						</div>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data () {
		return {
			redditInfo: undefined,
			discordInfo: undefined,
			guildID: window.location.href.match(/[?&]guildID=(\d+)/)[1],
			temp: encodeURIComponent(window.location.href),
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
			fetch(`/api/verification/${this.guildID}`, {method: 'POST'}).then(async response => {
				if (response.ok) {
					alert('Accounts linked! You should now have access to the server. You can close this window now.');
				} else {
					alert('Failed to link your accounts. Get in touch with a chat moderator and give them your Reddit username.');
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
<style lang="scss">
.avatar {
  img {
    border-radius: 50%;
    max-height: none;
  }
}

.account-box {
display: flex;
flex-direction: column;
align-items: center;

.image {
	margin-bottom: 1rem;
}
}
</style>
