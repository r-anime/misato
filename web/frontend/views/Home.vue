<template>
	<div class="container">
		<div class="section">
			<div class="content">
				<p>
					Hi there!
				</p>
				<p>
					<router-link
						:to="{name: 'verify', params: {guildID: '267799767843602452'}}"
						class="button is-primary"
					>
						Verify your account
					</router-link>
				</p>
			</div>
		</div>
	</div>
</template>
