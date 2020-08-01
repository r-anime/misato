import Vue from 'vue';
import Buefy from 'buefy';

import App from './App';

Vue.use(Buefy);

// eslint-disable-next-line no-new
new Vue({
	el: '#app',
	render: h => h(App),
});
