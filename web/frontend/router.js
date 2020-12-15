import Vue from 'vue';
import VueRouter from 'vue-router';

import store from './store';
import Home from './views/Home';
import Verify from './views/Verify';
import Guild from './views/Guild';

import GuildVerification from './views/guild/Verification';
import GuildMembers from './views/guild/Members';
import GuildMemberInfo from './views/guild/MemberInfo';

const router = new VueRouter({
	mode: 'history',
	routes: [
		{path: '/', component: Home, name: 'home'},
		{path: '/verify/:guildID', component: Verify, name: 'verify'},
		// TODO: auth guards for everything below
		{
			path: '/guilds/:guildID',
			component: Guild,
			children: [
				{path: 'members/:userID', component: GuildMemberInfo, name: 'guild-member-info'},
				{path: 'members', component: GuildMembers, name: 'guild-members'},
				{path: 'verification', component: GuildVerification, name: 'guild-verification'},
			],
		},
		{path: '/guilds', component: null, name: 'guilds'},
	],
});

router.beforeEach(async (to, from, next) => {
	if (store.state.discordInfo === undefined) {
		await store.dispatch('fetchDiscordInfo');
	}
	if (to.path.startsWith('/guilds') && to.params.guildID) {
		if (!store.state.discordInfo) {
			window.location = `${window.location.origin}/auth/discord?next=${encodeURIComponent(`${router.resolve(to).href}`)}`;
		}
	}
	next();
});

Vue.use(VueRouter);

export default router;
