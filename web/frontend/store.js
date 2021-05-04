import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// Promises used to track whether or not something is already being fetched
let fetchDiscordInfoPromise = null;

export default new Vuex.Store({
	state: {
		discordInfo: undefined,
	},
	mutations: {
		SET_DISCORD_INFO (state, info) {
			state.discordInfo = info;
		},
	},
	actions: {
		fetchDiscordInfo ({commit}) {
			if (!fetchDiscordInfoPromise) {
				fetchDiscordInfoPromise = fetch('/auth/discord/about').then(async response => {
				commit('SET_DISCORD_INFO', response.ok ? await response.json().catch(() => null) : null);
					fetchDiscordInfoPromise = null;
			});
			}
			return fetchDiscordInfoPromise;
		},
	},
});
