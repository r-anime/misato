import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

import Home from './views/Home';
import Verify from './views/Verify';
import Guild from './views/Guild';

import ManagementInfo from './views/guild/GuildInfo';
import GuildMembers from './views/guild/GuildMembers';
import GuildMemberInfo from './views/guild/GuildMemberInfo';

export default new VueRouter({
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
				{path: '', component: ManagementInfo, name: 'guild-info'},
			],
		},
		{path: '/guilds', component: null, name: 'guilds'},
	],
});
