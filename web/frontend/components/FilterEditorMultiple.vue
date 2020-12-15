<template>
	<div>
		<b-button
			type="is-primary"
			@click="addChild()"
		>
			Add another
		</b-button>

		<div class="filter-multiple-indent">
			<div class="filter-multiple-node-wrapper" v-for="child in children" :key="child.id">
				<filter-editor-node
					v-model="child.data"
				/>
				<b-button type="is-danger" class="delete-button" @click="deleteChild(child.id)">
					Delete
				</b-button>
			</div>
		</div>
	</div>
</template>

<script>
const nextID = (() => {
	let id = 0;
	return () => id++;
})();

export default {
	name: 'FilterEditorMultiple',
	components: {
		FilterEditorNode: () => import('./FilterEditorNode'),
	},
	props: {
		value: {
			type: String,
			default: '{"type":"multiple","op":"or","children":[]}',
		},
		op: {
			type: String,
			default: 'or',
		},
	},
	data () {
		console.log(this.value);
		const val = JSON.parse(this.value);
		return {
			children: val.children.map(childJSON => ({data: childJSON})),
		};
	},
	watch: {
		value () {
			const val = JSON.parse(this.value);
			this.field = val.field;
			this.text = val.text;
		},
		children: {
			handler () {
				this.$emit('input', JSON.stringify({
					type: 'multiple',
					op: this.op,
					children: this.children.map(child => JSON.parse(child.data)),
				}));
			},
			deep: true,
		},
		op () {
			this.$emit('input', JSON.stringify({
				type: 'multiple',
				op: this.op,
				children: this.children.map(child => JSON.parse(child.data)),
			}));
		},
	},
	methods: {
		addChild () {
			this.children.push({
				id: nextID(),
				data: '{"type":"containsText","field":"content","text":""}',
			});
		},
		deleteChild (id) {
			this.children.splice(this.children.findIndex(c => c.id === id), 1);
		}
	},
};
</script>
