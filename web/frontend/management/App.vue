<template>
	<div>
		{{ dab }}
		<router-view />
	</div>
</template>

<script>
export default {
	data () {
		return {
			dab: 'dab',
		};
	},
};
</script>
