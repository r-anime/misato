<template>
	<div class="container">
		<div class="section">
			<div class="columns">
				<div class="column is-one-quarter">
					<aside class="menu">
						<h2 class="menu-label">
							/r/anime Discord!
						</h2>
						<ul class="menu-list">
							<li>
								<router-link
									exact-active-class="is-active"
									:to="{name: 'guild-info', params: {guildID}}"
								>
									Information
								</router-link>
							</li>
							<li>
								<router-link
									exact-active-class="is-active"
									:to="{name: 'guild-members'}"
								>
									Moderation
								</router-link>
							</li>
						</ul>
					</aside>
				</div>
				<div class="column">
					<router-view />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {mapState} from 'vuex';
export default {
	computed: {
		...mapState(['discordInfo']),
		guildID () {
			return this.$route.params.guildID;
		},
	},
};
</script>

<style lang="scss" scoped>
.info-panel {

}
</style>
