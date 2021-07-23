<template>
	<div class="box mb-4">
		<b-select
			v-model="selection"
			class="mb-4"
		>
			<optgroup label="Text matches">
				<option value="containsText">
					Has text
				</option>
				<option value="matchesRegexp">
					Matches regular expression
				</option>
			</optgroup>
			<optgroup label="Multi-matches">
				<option value="any">
					Any of...
				</option>
				<option value="all">
					All of...
				</option>
			</optgroup>
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

const sharedKeysBySelection = {
	containsText: ['field'],
	matchesRegexp: ['field'],
	any: ['type', 'children'],
	all: ['type', 'children'],
};

const yeet = {
	containsText: {type: 'containsText', field: 'content', text: ''},
	matchesRegexp: {type: 'matchesRegexp', field: 'content', pattern: '', flags: ''},
	any: {type: 'multiple', op: 'or', children: []},
	all: {type: 'multiple', op: 'and', children: []},
};

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
		selection (newSelection) {
			console.log(newSelection);
			const currentVal = JSON.parse(this.value);
			const newVal = {};
			for (const key of sharedKeysBySelection[newSelection]) {
				if (Reflect.has(currentVal, key)) {
					newVal[key] = currentVal[key];
				}
			}
			Object.assign(newVal, yeet[newSelection], newVal);
			this.data = JSON.stringify(newVal);
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
