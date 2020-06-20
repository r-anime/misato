import Vue from 'vue';
import VueRouter from 'vue-router';
import Buefy from 'buefy';

import router from './router';

import App from './App';

Vue.use(VueRouter);
Vue.use(Buefy);

// eslint-disable-next-line no-new
new Vue({
	el: '#app',
	router,
	render: h => h(App),
});
