import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

import Home from './views/Home';
import Verify from './views/Verify';
import Management from './views/Management';

import ManagementInfo from './views/management/Info';

export default new VueRouter({
	mode: 'history',
	routes: [
		{path: '/', component: Home, name: 'home'},
		{path: '/verify/:guildID', component: Verify, name: 'verify'},
		{
			path: '/management/:guildID',
			component: Management,
			name: 'management',
			children: [
				{path: '', component: ManagementInfo, name: 'management-info'},
			],
		},
	],
});
