<template>
	<b-select
		:value="value"
		@input="$emit('input', $event)"
	>
		<option
			v-for="role in roles"
			:key="role.id"
			:value="role.id"
			:style="roleColorStyle(role.color)"
		>
			{{ role.name }}
		</option>
	</b-select>
</template>

<script>
export default {
	props: {
		value: {
			type: String,
			required: true,
		},
		roles: {
			type: Array,
			required: true,
		},
	},
	methods: {
		roleColorStyle (color) {
			return `color: #${color.toString(16).padStart(6, '0')};`;
		},
	},
};
</script>
