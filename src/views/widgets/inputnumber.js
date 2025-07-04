Vue.component("vue-input-number", {
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
			type: Number,
			default: 0,
		},
		required: {
			type: Boolean,
			default: false,
		},
		step: {
			type: Number,
			default: 1,
		},
		min: {
			type: Number,
			default: null,
		},
		max: {
			type: Number,
			default: null,
		}
	},
	template:`<div class="form-group">
	<label v-bind:for="id">{{label}}</label>
	<input v-bind:id="id" type="number" v-model.number="localValue" v-bind:required="required" v-bind:step="step" v-bind:min="min" v-bind:max="max" />
</div>
`,
	computed: {
		localValue: {
			get: function() { return this.value; },
			set: function(val) { this.$emit('input', val); }
		}
	}
});
