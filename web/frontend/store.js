import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// Promises used to track whether or not something is already being fetched
let fetchDiscordInfoPromise = null;
let fetchGuildRolesPromise = null;

export default new Vuex.Store({
	state: {
		discordInfo: undefined,
		guildRoles: new Map(),
	},
	mutations: {
		SET_DISCORD_INFO (state, info) {
			state.discordInfo = info;
		},
		SET_GUILD_ROLES (state, {guildID, roles}) {
			state.guildRoles.set(guildID, roles);
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
		fetchGuildRoles ({commit}, guildID) {
			if (!fetchGuildRolesPromise) {
				fetchGuildRolesPromise = fetch(`/api/guilds/${guildID}/roles`).then(async response => {
					commit('SET_GUILD_ROLES', {
						guildID,
						roles: response.ok ? await response.json().catch(() => null) : null,
					});
					fetchGuildRolesPromise = null;
				});
			}
			return fetchGuildRolesPromise;
		},
	},
});
