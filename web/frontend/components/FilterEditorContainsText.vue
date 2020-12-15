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
				contains
			</span>
		</div>
		<b-input
			v-model="text"
		/>
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
			text: val.text,
		};
	},
	watch: {
		value () {
			const val = JSON.parse(this.value);
			this.field = val.field;
			this.text = val.text;
		},
		$data: {
			handler () {
				this.$emit('input', JSON.stringify({
					type: 'containsText',
					field: this.field,
					text: this.text,
				}));
			},
			deep: true,
		},
	},
};
</script>
