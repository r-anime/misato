<template>
	<div>
		<h1 class="title">
			Users
		</h1>
		<p class="content">
			There's nothing here!
		</p>
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
