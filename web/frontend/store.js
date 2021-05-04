import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// Promises used to track whether or not something is already being fetched
let fetchDiscordInfoPromise = null;
let fetchGuildRolesPromise = null;
let fetchGuildChannelsPromise = null;
let fetchGuildEmojisPromise = null;

export default new Vuex.Store({
	state: {
		discordInfo: undefined,
		guildRoles: {},
		guildChannels: {},
		guildEmojis: {},
	},
	mutations: {
		SET_DISCORD_INFO (state, info) {
			state.discordInfo = info;
		},
		SET_GUILD_ROLES (state, {guildID, roles}) {
			Vue.set(state.guildRoles, guildID, roles);
		},
		SET_GUILD_CHANNELS (state, {guildID, channels}) {
			Vue.set(state.guildChannels, guildID, channels);
		},
		SET_GUILD_EMOJIS (state, {guildID, emojis}) {
			Vue.set(state.guildEmojis, guildID, emojis);
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
		fetchGuildChannels ({commit}, guildID) {
			if (!fetchGuildChannelsPromise) {
				fetchGuildChannelsPromise = fetch(`/api/guilds/${guildID}/channels`).then(async response => {
					commit('SET_GUILD_CHANNELS', {
						guildID,
						channels: response.ok ? await response.json().catch(() => null) : null,
					});
					fetchGuildChannelsPromise = null;
				});
			}
		},
		fetchGuildEmojis ({commit}, guildID) {
			if (!fetchGuildEmojisPromise) {
				fetchGuildEmojisPromise = fetch(`/api/guilds/${guildID}/emojis`).then(async response => {
					commit('SET_GUILD_EMOJIS', {
						guildID,
						emojis: response.ok ? await response.json().catch(() => null) : null,
					});
					fetchGuildEmojisPromise = null;
				});
			}
		},
	},
});
