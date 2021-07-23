<template>
	<div class="container">
		<div class="section">
			<template v-if="!loaded">
				<b-loading
					:active="true"
					:is-full-page="false"
				/>
			</template>
			<template v-else>
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
							<p><a :href="`/auth/discord/logout?next=${encodedCurrentURL}`">Log out</a></p>
						</div>
						<p
							v-else
							class="has-text-centered"
						>
							<a
								:href="`/auth/discord?next=${encodedCurrentURL}`"
								class="button is-discord"
							>Log in with Discord</a>
						</p>
					</div>
					<div class="column is-narrow">
						<div
							v-if="redditInfo"
							class="box account-box has-text-centered"
						>
							<figure class="image avatar is-128x128">
								<img :src="redditInfo.avatarURL">
							</figure>
							<p><strong>/u/{{ redditInfo.name }}</strong></p>
							<p><a :href="`/auth/reddit/logout?next=${encodedCurrentURL}`">Log out</a></p>
						</div>
						<p
							v-else
							class="has-text-centered"
						>
							<a
								:href="`/auth/reddit?next=${encodedCurrentURL}`"
								class="button is-reddit"
							>Log in with Reddit</a>
						</p>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
import {mapState} from 'vuex';
export default {
	data () {
		return {
			redditInfo: undefined,
			encodedCurrentURL: encodeURIComponent(window.location.href),
		};
	},
	computed: {
		...mapState(['discordInfo']),
		loaded () {
			return this.redditInfo !== undefined && this.discordInfo !== undefined;
		},
		guildID () {
			return this.$route.params.guildID;
		},
	},
	mounted () {
		this.fetchRedditInfo();
	},
	methods: {
		fetchRedditInfo () {
			fetch('/auth/reddit/about').then(async response => {
				this.redditInfo = response.ok ? await response.json().catch(() => null) : null;
			});
		},
		linkAccounts () {
			fetch(`/api/verification/${this.guildID}`, {method: 'POST'}).then(response => {
				if (response.ok) {
					// eslint-disable-next-line no-alert
					alert('Accounts linked! You should now have access to the server. You can close this window now.');
				} else {
					// eslint-disable-next-line no-alert
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

<style lang="scss" scoped>
.account-box {
	display: flex;
	flex-direction: column;
	align-items: center;

	.image {
		margin-bottom: 1rem;
	}
}
</style>
