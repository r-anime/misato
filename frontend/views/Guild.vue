<template>
	<div
		v-if="discordInfo"
		class="container"
	>
		<div class="section">
			<template v-if="!loaded">
				<b-loading
					:active="true"
					:is-full-page="false"
				/>
			</template>
			<template v-else>
				<div class="columns">
					<div class="column is-one-quarter">
						<aside class="menu">
							<h2 class="menu-label">
								<div class="level">
									<div class="level-left">
										<figure class="image avatar is-32x32 mr-2">
											<img :src="iconURL(64)">
										</figure>
										<span>{{ name }}</span>
									</div>
								</div>
							</h2>
							<ul class="menu-list">
								<li>
									<router-link
										exact-active-class="is-active"
										:to="{name: 'guild-info'}"
									>
										Information
									</router-link>
								</li>
								<li>
									<router-link
										active-class="is-active"
										:to="{name: 'guild-members'}"
									>
										Members
									</router-link>
								</li>
								<li>
									<router-link
										active-class="is-active"
										:to="{name: 'guild-verification', params: {guildID}}"
									>
										Verification
									</router-link>
								</li>
								<li>
									<router-link
										active-class="is-active"
										:to="{name: 'guild-filter', params: {guildID}}"
									>
										Message Filter
									</router-link>
								</li>
								<li>
									<router-link
										active-class="is-active"
										:to="{name: 'guild-channel-automation', params: {guildID}}"
									>
										Channel Automation
									</router-link>
								</li>
							</ul>
						</aside>
					</div>
					<div class="column is-relative">
						<keep-alive>
							<router-view />
						</keep-alive>
					</div>
				</div>
			</template>
		</div>
	</div>
	<b-loading
		v-else
		:is-full-page="true"
		:active="true"
	/>
</template>

<script>
import {mapState} from 'vuex';
import {discordIconURL} from '../util';
export default {
	data () {
		return {
			name: null,
			icon: null,
		};
	},
	computed: {
		...mapState(['discordInfo']),
		guildID () {
			return this.$route.params.guildID;
		},
		loaded () {
			return !!this.name;
		},
	},
	async created () {
		const response = await fetch(`/api/guilds/${this.guildID}`);
		if (!response.ok) return;

		const data = await response.json();

		this.name = data.name;
		this.icon = data.icon;
	},
	methods: {
		iconURL (size) {
			return discordIconURL(this.guildID, this.icon, size);
		},
	},
};
</script>

<style lang="scss" scoped>
</style>
