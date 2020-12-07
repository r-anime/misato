import Vue from 'vue';
import Buefy from 'buefy';

Vue.use(Buefy);

import router from './router';
import store from './store';

import App from './App';

// eslint-disable-next-line no-new
new Vue({
	el: '#app',
	router,
	store,
	render: h => h(App),
});
