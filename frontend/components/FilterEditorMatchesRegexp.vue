<template>
	<div class="field has-addons">
		<b-select
			v-model="field"
			placeholder="Field"
		>
			<option value="content">
				Content
			</option>
			<option value="filename">
				Filename
			</option>
		</b-select>
		<div class="control">
			<span class="button is-static">
				matches pattern
			</span>
		</div>
		<b-input v-model="pattern" />
		<div class="control">
			<span class="button is-static">
				with flags
			</span>
		</div>
		<b-input v-model="flags" />
	</div>
</template>

<script>
export default {
	props: {
		value: {
			type: String,
			required: true,
		},
	},
	data () {
		const val = JSON.parse(this.value);
		return {
			field: val.field,
			pattern: val.pattern,
			flags: val.flags,
		};
	},
	watch: {
		value () {
			const val = JSON.parse(this.value);
			this.field = val.field;
			this.pattern = val.pattern;
			this.flags = val.flags;
		},
		$data: {
			handler () {
				this.$emit('input', JSON.stringify({
					type: 'matchesRegexp',
					field: this.field,
					pattern: this.pattern,
					flags: this.flags,
				}));
			},
			deep: true,
		},
	},
};
</script>
