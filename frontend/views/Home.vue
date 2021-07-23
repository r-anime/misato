<template>
	<div
		v-if="discordInfo"
		class="container"
	>
		<section class="section">
			<h1 class="title">
				Servers
			</h1>
			<div
				v-if="!guilds"
				style="position: relative; height: 5em;"
			>
				<b-loading
					:active="true"
					:is-full-page="false"
				/>
			</div>
			<div
				v-else-if="guilds.length"
				class="columns is-multiline"
			>
				<div
					v-for="guild in guilds"
					:key="guild.id"
					class="column is-one-quarter"
				>
					<router-link :to="{name: 'guild-info', params: {guildID: guild.id}}">
						<div class="box guild-box has-text-centered">
							<figure class="image avatar is-128x128">
								<img :src="guildIconURL(guild)">
							</figure>
							<p>
								<strong>{{ guild.name }}</strong>
							</p>
						</div>
					</router-link>
				</div>
			</div>
			<div v-else>
				<p class="content">
					You don't manage any servers! There's not much for you to do here.
				</p>
			</div>
		</section>
	</div>
	<section
		v-else
		class="hero is-primary is-fullheight-with-navbar"
	>
		<div class="hero-body">
			<div class="container">
				<h1 class="title">
					Misato Control Panel
				</h1>
				<p class="subtitle">
					Log in with your Discord account to manage a server.
				</p>
			</div>
		</div>
	</section>
</template>

<script>
import {mapState} from 'vuex';
import {discordIconURL} from '../util';
export default {
	data () {
		return {
			guilds: null,
		};
	},
	computed: {
		...mapState(['discordInfo']),
	},
	async created () {
		const response = await fetch('/api/guilds/managed');

		if (response.status === 200) {
			this.guilds = await response.json();
		} else {
			this.guilds = [];
		}
	},
	methods: {
		guildIconURL (guild) {
			return discordIconURL(guild.id, guild.icon, 256);
		},
	},
};
</script>

<style lang="scss" scoped>
.guild-box {
	display: flex;
	flex-direction: column;
	align-items: center;

	.image {
		margin-bottom: 1rem;
	}
}
</style>
