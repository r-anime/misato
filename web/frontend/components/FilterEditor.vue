<template>
	<div class="filter-editor">
		<filter-editor-node
			:value="value"
			@input="$emit('input', $event)"
		/>
	</div>
</template>

<script>
import FilterEditorNode from './FilterEditorNode';

export default {
	components: {
		FilterEditorNode,
	},
	props: {
		value: {
			type: String,
			required: true,
		},
	},
};
</script>
