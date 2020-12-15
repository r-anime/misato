<template>
	<div class="filter-editor">
		<div class="level">
			<div class="level-left">
				<b-button type="is-danger">
					Reset
				</b-button>
			</div>
			<div class="level-right">
				<div class="field has-addons">
					<div class="control">
						<b-button>
							Import
						</b-button>
					</div>
					<div class="control">
						<b-button>
							Export
						</b-button>
					</div>
				</div>
			</div>
		</div>
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
			default: '{"type":"containsText","field":"content","text":""}',
		},
	},
};
</script>
