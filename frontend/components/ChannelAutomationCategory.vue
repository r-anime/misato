<template>
	<div class="box mb-4">
		<b-field>
			<b-input
				v-model="name"
			/>
		</b-field>

		<table class="table">
			<thead>
				<tr>
					<th>Emoji</th>
					<th>Role</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				<channel-automation-category-trigger
					v-for="(trigger, index) in triggers"
					:key="index"
					v-model="triggers[index]"
					@delete="deleteTrigger(trigger)"
				/>
			</tbody>
		</table>

		<div class="level">
			<div class="level-left">
				<b-button
					type="is-primary"
					@click="addTrigger()"
				>
					Add reaction button
				</b-button>
			</div>
			<div class="level-right">
				<b-button
					type="is-danger"
					@click="$emit('delete')"
				>
					Delete Category
				</b-button>
			</div>
		</div>
	</div>
</template>

<script>
import ChannelAutomationCategoryTrigger from './ChannelAutomationCategoryTrigger.vue';
export default {
	components: {
		ChannelAutomationCategoryTrigger,
	},
	props: {
		value: {
			type: String,
			required: true,
		},
	},
	data () {
		return {
			name: this.nameForValue(this.value),
			triggers: this.triggersForValue(this.value),
			data: this.value,
		};
	},
	watch: {
		value (newValue) {
			this.name = this.nameForValue(newValue);
			this.triggers = this.triggersForValue(newValue);
			this.data = newValue;
		},
		data () {
			console.log('data changed');
			this.$emit('input', this.data);
		},
		name (newName) {
			const val = JSON.parse(this.value);
			val.name = newName;
			this.data = JSON.stringify(val);
		},
		triggers (newTriggers) {
			const val = JSON.parse(this.value);
			val.triggers = newTriggers.map(t => JSON.parse(t));
			this.data = JSON.stringify(val);
		},
	},
	methods: {
		nameForValue (val) {
			val = JSON.parse(val);
			return val.name;
		},
		triggersForValue (val) {
			val = JSON.parse(val);
			console.log(val);
			return val.triggers.map(t => JSON.stringify(t));
		},
		addTrigger ({emoji = '', roleID = ''} = {}) {
			this.triggers.push(JSON.stringify({emoji, roleID}));
		},
		deleteTrigger (trigger) {
			this.triggers.splice(this.triggers.indexOf(trigger), 1);
		},
	},
};
</script>
