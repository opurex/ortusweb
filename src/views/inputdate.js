Vue.component("vue-inputdate", {
	props: ["value"],
	template: `<input type="date" v-bind:value="dateAsString(value)" v-on:input="setValue">`,
	methods: {
		dateAsString: function(date) {
			return date && date.toISOString().split('T')[0];
		},
		setValue: function(event) {
			this.$emit('input', event.target.valueAsDate);
		}
	},
});
