<template>
	<div class="field has-addons">
		<div class="control">
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
		</div>
		<div class="control">
			<span class="button is-static">
				contains
			</span>
		</div>
		<div class="control">
			<b-input
				v-model="text"
			/>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		value: {
			type: String,
			default: '{"type":"containsText","field":"content","text":""}',
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
