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
		<router-view />
	</div>
</template>

<script>
import {mapState, mapActions} from 'vuex';
export default {
	computed: {
		...mapState(['discordInfo']),
	},
	mounted () {
		this.fetchDiscordInfo();
	},
	methods: {
		...mapActions(['fetchDiscordInfo']),
	},
};
</script>

<style lang="scss" src="./customization.scss"></style>
<style lang="scss">
// .avatar class used in combination with the Bulma .image class (presents rounded avatar images)
.image.avatar {
	img {
		border-radius: 50%;
		// fix for avatar in navbar gettingf squished
		max-height: none;
	}
}
</style>
