<template>
	<div>
		<div
			v-for="child in children"
			:key="child.id"
			class="node-wrapper"
		>
			<filter-editor-node
				v-model="child.data"
			/>
			<b-button
				type="is-danger"
				class="node-delete-button"
				@click="deleteChild(child.id)"
			>
				Remove
			</b-button>
		</div>

		<b-button
			type="is-primary"
			@click="addChild()"
		>
			Add condition
		</b-button>
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
			required: true,
		},
		op: {
			type: String,
			required: true,
		},
	},
	data () {
		console.log(this.value);
		const val = JSON.parse(this.value);
		return {
			children: val.children.map(childData => ({
				data: JSON.stringify(childData),
				id: nextID(),
			})),
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
			this.children.splice();
		},
	},
};
</script>

<style lang="scss">
.node-wrapper {
	position: relative;
}
.button.node-delete-button {
	position: absolute;
	right: 1.25rem;
	top: 1.25rem;
}
</style>
