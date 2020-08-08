import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		redditInfo: null,
		discordInfo: null,
	},
	mutations: {
		setRedditInfo (state, info) {
			state.redditInfo = info;
		},
		setDiscordInfo (state, info) {
			state.discordInfo = info;
		},
	},
	actions: {
		fetchRedditInfo ({commit}) {
			fetch('/auth/reddit/about').then(async response => {
				commit('setRedditInfo', response.ok ? await response.json().catch(() => null) : null);
			});
		},
		fetchDiscordInfo ({commit}) {
			fetch('/auth/discord/about').then(async response => {
				commit('setDiscordInfo', response.ok ? await response.json().catch(() => null) : null);
			});
		},
	},
});
