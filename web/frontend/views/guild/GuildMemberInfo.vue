<template>
	<div>
		<h1 class="title">
			User Information: {{ userID }}
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
		userID () {
			return this.$route.params.userID;
		},
	},
};
</script>
