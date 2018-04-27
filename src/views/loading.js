/** The loading screen component. Use gui_showLoading/gui_showProgress to use it.
 * @props loading The loading data structure {loading: (boolean) shown or hidden,
 * progress: (null|number) the current step in progressive loading,
 * progressMax: (null|number) the total number of loading steps}. */
Vue.component("vue-loading", {
	props: ["loading"],
	template: `<div id="loading" v-if="loading.loading">
	<p>Chargement...</p>
	<p v-if="loading.progressMax" id="loading-progress">{{loading.progress}}/{{loading.progressMax}}</p>
</div>
`
});

