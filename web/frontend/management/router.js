import VueRouter from 'vue-router';

import Home from './views/Home';

export default new VueRouter({
	routes: [
		{path: '*', component: Home},
	],
});
