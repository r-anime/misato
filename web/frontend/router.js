import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

import Home from './views/Home';
import Verify from './views/Verify';

export default new VueRouter({
	mode: 'history',
	routes: [
		{path: '/', component: Home},
		{path: '/verify', component: Verify},
	],
});
