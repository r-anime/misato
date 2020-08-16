import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

export default new VueRouter({
	mode: 'history',
	routes: [
		{path: '/', component: () => import('./views/Home'), name: 'home'},
		{path: '/verify/:guildID', component: () => import('./views/Verify'), name: 'verify'},
		{
			path: '/management/:guildID',
			component: () => import('./views/Management'),
			name: 'management',
			children: [
				{path: '', component: () => import('./views/management/Info'), name: 'management-info'},
			],
		},
	],
});
