import Vue from 'vue';
import Thing from './thing.vue';

// eslint-disable-next-line no-new
new Vue({
	el: '#app',
	render: h => h(Thing),
});
