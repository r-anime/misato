<template>
	<div class="app">
		<b-navbar class="is-primary">
			<template slot="brand">
				<b-navbar-item class="is-size-5">
					Hi there
				</b-navbar-item>
			</template>
		</b-navbar>
		<router-view />
	</div>
</template>

<style lang="scss" src="./customization.scss"></style>
