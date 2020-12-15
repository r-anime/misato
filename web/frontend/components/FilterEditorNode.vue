<template>
	<div class="box">
		<b-select v-model="selection">
			<option value="containsText">
				Text match
			</option>
			<option value="matchesRegexp">
				RegExp match
			</option>
			<option value="any">
				Any of the following
			</option>
			<option value="all">
				All of the following
			</option>
		</b-select>

		<filter-editor-contains-text
			v-if="selection === 'containsText'"
			v-model="data"
		/>
		<filter-editor-matches-regexp
			v-else-if="selection === 'matchesRegexp'"
			v-model="data"
		/>
		<filter-editor-multiple
			v-else-if="['any', 'all'].includes(selection)"
			v-model="data"
			:op="selection === 'any' ? 'or' : 'and'"
		/>
		<div v-else>
			something is wrong
		</div>
	</div>
</template>

<script>
import FilterEditorContainsText from './FilterEditorContainsText';
import FilterEditorMatchesRegexp from './FilterEditorMatchesRegexp';
import FilterEditorMultiple from './FilterEditorMultiple';

export default {
	name: 'FilterEditorNode',
	components: {
		FilterEditorContainsText,
		FilterEditorMatchesRegexp,
		FilterEditorMultiple,
	},
	props: {
		value: {
			type: String,
			required: true,
		},
	},
	data () {
		return {
			selection: this.selectionForValue(this.value),
			data: this.value,
		};
	},
	watch: {
		value (newValue) {
			this.selection = this.selectionForValue(newValue);
			this.data = newValue;
		},
		data () {
			console.log('data changed');
			this.$emit('input', this.data);
		},
		selection (newType) {
			if (newType === 'containsText') {
				this.data = '{"type":"containsText","field":"content","text":""}';
			} else if (newType === 'matchesRegexp') {
				this.data = '{"type":"matchesRegexp","field":"content","pattern":"","flags":""}';
			} else {
				this.data = `{"type":"multiple","op":"${newType}","children":[]}`;
			}
		},
	},
	methods: {
		selectionForValue (val) {
			val = JSON.parse(val);
			if (val.type === 'multiple') {
				return val.op === 'or' ? 'any' : 'all';
			}
			return val.type;
		},
	},
};
</script>
