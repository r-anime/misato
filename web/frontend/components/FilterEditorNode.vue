<template>
	<div class="box">
		<b-select v-model="selectedType">
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
			v-if="selectedType === 'containsText'"
			v-model="data"
		/>
		<filter-editor-matches-regexp
			v-if="selectedType === 'matchesRegexp'"
			v-model="data"
		/>
		<filter-editor-multiple
			v-if="['any', 'all'].includes(selectedType)"
			v-model="data"
			:op="selectedType === 'any' ? 'or' : 'and'"
		/>
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
			default: '{"type":"containsText","field":"content","text":""}',
		},
	},
	data () {
		return {
			selectedType: JSON.parse(this.value).type,
			data: this.value,
		};
	},
	watch: {
		data () {
			this.$emit('input', this.data);
		},
		selectedType (newType) {
			if (newType === 'containsText') {
				this.data = '{"type":"containsText","field":"content","text":""}';
			} else if (newType === 'matchesRegexp') {
				this.data = '{"type":"matchesRegexp","field":"content","pattern":"","flags":""}';
			} else {
				this.data = `{"type":"multiple","op":"${newType}","children":[]}`;
			}
		},
	},
};
</script>
