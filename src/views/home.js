// Vue.component("vue-home", {
// 	props: ["data"],
// 	template: `<div class="home">
// <section class="box box-medium">
// 	<article class="box-body">
// 		<p v-if="data.syncDate" style="text-align:center">The data was loaded on {{data.syncDate.date}} at {{data.syncDate.time}}.<br>Click the button below to refresh your data, especially if you access this interface from multiple computers.</p>
// 		<p v-else style="text-align:center"><strong>No data has been loaded</strong>. Click the button below to load your data and access the menu.</p>
// 		<p style="text-align:center"><button class="btn btn-primary" onclick="javascript:home_sendSync();">Reload data</button></p>
// 		<h1>Administration Interface</h1>
// 		<p>Hello {{data.user}}. You are logged in on {{data.server}}.</p>
// 		<p>You are in your administration interface where you can create your products, categories, access your sales statistics, etc.</p>
// 		<h2>Documentation</h2>
// 		<p>There are several sources of documentation:</p>
// 		<ul>
// 			<li><a href="https://fr.wikibooks.org/wiki/Logiciel_Pasteque" target="_blank" >Installation, configuration, and usage manual on Wikibooks</a></li>
// 			<li><a href="https://opurex.com/pos" target="_blank">Contact information for the Opurex Pos</a></li>
// 		</ul>
// 		<p style="font-size:small;margin-bottom:0px;">The Open Dyslexic and Atkinson Hyperlegible fonts are distributed under the SIL license, see the licenses for <a href="res/fonts/SIL Open Font License.txt" target="_blank">Open Dyslexic</a> and <a href="res/fonts/Atkinson Hyperlegible Font License.txt" target="_blank">Atkinson Hyperlegible</a></p>
// 		<p style="text-align:right;font-size:small;margin-bottom:0px">OpurexPOS  v{{data.version}}</p>
// 	</article>
// </section>
// </div>
// `
// });


Vue.component("vue-home", {
	props: ["data"],
	template: `
  <div class="p-6 max-w-4xl mx-auto">
    <section class="bg-white dark:bg-gray-900 shadow rounded-2xl p-6">
      <article class="space-y-6 text-center">
        <div v-if="data.syncDate">
          <p>The data was loaded on <strong>{{data.syncDate.date}}</strong> at <strong>{{data.syncDate.time}}</strong>.</p>
          <p class="text-sm text-gray-500">Click the button below to refresh your data, especially if you access this interface from multiple computers.</p>
        </div>
        <div v-else>
          <p class="text-red-600 font-semibold text-lg">No data has been loaded</p>
          <p class="text-sm text-gray-500">Click the button below to load your data and access the menu.</p>
        </div>

        <button 
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          @click="home_sendSync">
          Reload Data
        </button>

        <h1 class="text-2xl font-bold mt-8">Administration Interface</h1>
        <p>Hello <strong>{{data.user}}</strong>. You are logged in on <strong>{{data.server}}</strong>.</p>
        <p class="text-sm text-gray-600">Manage your products, categories, and access sales statistics.</p>

<!--        <h2 class="text-xl font-semibold mt-6">Documentation</h2>-->
<!--        <ul class="list-disc list-inside text-left">-->
<!--          <li><a class="text-blue-500 underline" href="https://fr.wikibooks.org/wiki/Logiciel_Pasteque" target="_blank">Manual on Wikibooks</a></li>-->
<!--          <li><a class="text-blue-500 underline" href="https://opurex.com/pos" target="_blank">Contact Opurex POS</a></li>-->
<!--        </ul>-->

<!--        <p class="text-xs mt-6">-->
<!--          Fonts licensed under SIL: -->
<!--          <a class="underline" href="res/fonts/SIL Open Font License.txt" target="_blank">Open Dyslexic</a> and -->
<!--          <a class="underline" href="res/fonts/Atkinson Hyperlegible Font License.txt" target="_blank">Atkinson Hyperlegible</a>.-->
<!--        </p>-->
        <p class="text-xs text-right">OpurexPOS v{{data.version}}</p>
      </article>
    </section>
  </div>
  `,
	methods: {
		home_sendSync() {
			home_sendSync(); // call global function
		}
	}
});
