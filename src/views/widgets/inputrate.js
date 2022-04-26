Vue.component("vue-input-rate", {
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
			default: false
		},
	},
	template:`<div class="form-group">
	<label v-bind:for="id">{{label}}</label>
	<input v-bind:id="id" type="number" v-model.lazy="localValue" step="0.01" min="0" max="100" /> %
</div>
`,
	computed: {
		localValue: {
			get: function() { return Number((this.value * 100.0).toFixed(2)); },
			set: function(val) { this.$emit('input', Number(val / 100.0).toFixed(5)); }
		}
	}
});
