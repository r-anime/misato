<template>
	<div class="container">
		<div class="section">
			<div class="columns">
				<div class="column is-one-quarter">
					<div class="panel is-primary info-panel">
						<p class="panel-heading">
							/r/anime Discord!
						</p>
						<router-link
							class="panel-block"
							exact-active-class="is-active"
							:to="{name: 'management-info', params: {guildID}}"
						>
							Information
						</router-link>
						<router-link
							class="panel-block"
							exact-active-class="is-active"
							:to="{name: 'home'}"
						>
							Back
						</router-link>
					</div>
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
