<template>
	<tr v-if="!loaded">
		<td>loading...</td>
	</tr>
	<tr v-else>
		<td>
			<emoji-picker
				v-model="emoji"
				:emojis="emojis"
			/>
		</td>
		<td>
			<div class="field has-addons">
				<role-dropdown
					v-model="roleID"
					:loading="!roles"
					:roles="roles"
					placeholder="Choose a role"
				>
					<template v-slot:options>
						<optgroup label="New role">
							<option value="new-role">
								Create new role...
							</option>
							<option value="new-channel">
								Create new channel and role...
							</option>
						</optgroup>
					</template>
				</role-dropdown>

				<template v-if="roleID === 'new-role' || roleID === 'new-channel'">
					<div class="control">
						<input
							v-model="newRoleChannelName"
							placeholder="Name"
							class="input"
						>
					</div>
				</template>

				<template v-if="roleID === 'new-channel'">
					<div class="control">
						<category-channel-dropdown
							v-model="newChannelParentID"
							:loading="!channels"
							:channels="channels"
							:include-no-channel="true"
						/>
					</div>
				</template>
			</div>

			<template v-if="newRoleChannelName">
				<p class="help">
					Role will be called <strong>{{ toRoleName(newRoleChannelName) }}</strong>
					<span v-if="roleID === 'new-channel'">
						and channel will be called <strong>#{{ toChannelName(newRoleChannelName) }}</strong>
					</span>
				</p>
			</template>
		</td>
		<td>
			<button
				class="button is-danger"
				@click="$emit('delete')"
			>
				Delete
			</button>
		</td>
	</tr>
</template>

<script>
import {mapActions, mapState} from 'vuex';
import CategoryChannelDropdown from './CategoryChannelDropdown.vue';
import RoleDropdown from './RoleDropdown.vue';
import EmojiPicker from './EmojiPicker.vue';

export default {
	components: {
		RoleDropdown,
		CategoryChannelDropdown,
		EmojiPicker,
	},
	props: {
		value: {
			type: String,
			required: true,
		},
	},
	data () {
		return {
			emoji: this.emojiForValue(this.value),
			roleID: this.roleIDForValue(this.value),
			data: this.value,

			newRoleChannelName: null,
			newChannelParentID: null,
		};
	},
	computed: {
		...mapState([
			'guildRoles',
			'guildChannels',
			'emojis',
		]),
		guildID () {
			return this.$route.params.guildID;
		},
		roles () {
			return this.guildRoles[this.guildID];
		},
		channels () {
			return this.guildChannels[this.guildID];
		},
		loaded () {
			return this.roles && this.channels && this.emojis;
		},
	},
	watch: {
		value (newValue) {
			this.emoji = this.emojiForValue(newValue);
			this.roleID = this.roleIDForValue(newValue);
			this.data = newValue;
		},
		data () {
			console.log('data changed');
			this.$emit('input', this.data);
		},
		emoji (newEmoji) {
			const val = JSON.parse(this.value);
			val.emoji = newEmoji;
			this.data = JSON.stringify(val);
		},
		roleID (newRoleID) {
			const val = JSON.parse(this.value);
			val.roleID = newRoleID;
			val.createdRoleName = ['new-role', 'new-channel'].includes(newRoleID) ? this.toRoleName(this.newRoleChannelName) : undefined;
			val.createdChannelName = newRoleID === 'new-channel' ? this.toChannelName(this.newRoleChannelName) : undefined;
			val.createdChannelParentID = newRoleID === 'new-channel' ? this.newChannelParentID : undefined;
			this.data = JSON.stringify(val);
		},
		newRoleChannelName (newRoleChannelName) {
			const val = JSON.parse(this.value);
			val.roleID = this.roleID;
			val.createdRoleName = ['new-role', 'new-channel'].includes(this.roleID) ? this.toRoleName(newRoleChannelName) : undefined;
			val.createdChannelName = this.roleID === 'new-channel' ? this.toChannelName(newRoleChannelName) : undefined;
			val.createdChannelParentID = this.roleID === 'new-channel' ? this.newChannelParentID : undefined;
			this.data = JSON.stringify(val);
		},
		newChannelParentID (newval) {
			const val = JSON.parse(this.value);
			val.roleID = this.roleID;
			val.createdRoleName = ['new-role', 'new-channel'].includes(this.roleID) ? this.toRoleName(this.newRoleChannelName) : undefined;
			val.createdChannelName = this.roleID === 'new-channel' ? this.toChannelName(this.newRoleChannelName) : undefined;
			val.createdChannelParentID = this.roleID === 'new-channel' ? newval : undefined;
			this.data = JSON.stringify(val);
		},
	},
	created () {
		if (!this.roles) {
			this.fetchGuildRoles(this.guildID).then(() => {
				console.log('test', this.guildRoles[this.guildID]);
				this.$forceUpdate();
			});
		}
		if (!this.channels) {
			this.fetchGuildChannels(this.guildID).then(() => this.$forceUpdate());
		}
		if (!this.emojis) {
			this.fetchEmojis().then(() => this.$forceUpdate());
		}
	},
	methods: {
		...mapActions([
			'fetchGuildRoles',
			'fetchGuildChannels',
			'fetchEmojis',
		]),
		emojiForValue (val) {
			val = JSON.parse(val);
			return val.emoji;
		},
		roleIDForValue (val) {
			val = JSON.parse(val);
			return val.roleID;
		},

		toRoleName (val) {
			if (!val) return '';
			return val.trim().substr(0, 32);
		},
		toChannelName (val) {
			if (!val) return '';
			return val.toLowerCase().trim().replace(/[^a-z0-9-_]+/g, '-').substr(0, 32).replace(/-+$/, '');
		},
	},
};
</script>
