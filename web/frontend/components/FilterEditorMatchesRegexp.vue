<template>
	<div class="field has-addons">
		<div class="control">
			<b-select
				v-model="field"
				placeholder="Field"
			>
				<option value="content">
					content
				</option>
				<option value="filename">
					filename
				</option>
			</b-select>
		</div>
		<div class="control">
			<span class="button is-static">
				matches pattern
			</span>
		</div>
		<div class="control">
			<b-input v-model="pattern" />
		</div>
		<div class="control">
			<span class="button is-static">
				with flags
			</span>
		</div>
		<div class="control">
			<b-input v-model="flags" />
		</div>
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
