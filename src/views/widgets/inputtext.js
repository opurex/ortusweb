Vue.component("vue-input-text", {
	props: {
		id: {
			type: String,
			required: true,
		},
		label: {
			type: String,
			required: true,
		},
		value: {
			type: String,
			default: "",
		},
		required: {
			type: Boolean,
			default: false
		},
	},
	template:`<div class="form-group">
	<label v-bind:for="id">{{label}}</label>
	<input v-bind:id="id" type="text" v-model="localValue" v-bind:required="required" />
</div>
`,
	computed: {
		localValue: {
			get: function() { return this.value; },
			set: function(val) { this.$emit('input', val); }
		}
	}
});
