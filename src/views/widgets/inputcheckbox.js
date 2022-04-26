Vue.component("vue-input-checkbox", {
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
			type: Boolean,
			default: false,
		},
	},
	template:`<div class="form-group">
	<input v-bind:id="id" type="checkbox" v-model="localValue" />
	<label v-bind:for="id">{{label}}</label>
</div>
`,
	computed: {
		localValue: {
			get: function() { return this.value; },
			set: function(val) { this.$emit('input', val); }
		}
	}
});
