Vue.component("vue-home", {
	props: ["data"],
	template: `<div class="home">
<section class="box box-medium">
	<article class="box-body">
		<p v-if="data.syncDate" style="text-align:center">The data was loaded on {{data.syncDate.date}} at {{data.syncDate.time}}.<br>Click the button below to refresh your data, especially if you access this interface from multiple computers.</p>
		<p v-else style="text-align:center"><strong>No data has been loaded</strong>. Click the button below to load your data and access the menu.</p>
		<p style="text-align:center"><button class="btn btn-primary" onclick="javascript:home_sendSync();">Reload data</button></p>
		<h1>Administration Interface</h1>
		<p>Hello {{data.user}}. You are logged in on {{data.server}}.</p>
		<p>You are in your administration interface where you can create your products, categories, access your sales statistics, etc.</p>
		<h2>Documentation</h2>
		<p>There are several sources of documentation:</p>
		<ul>
			<li><a href="https://fr.wikibooks.org/wiki/Logiciel_Pasteque" target="_blank" >Installation, configuration, and usage manual on Wikibooks</a></li>
			<li><a href="https://opurex.com/pos" target="_blank">Contact information for the Opurex Pos</a></li>
		</ul>
		<p style="font-size:small;margin-bottom:0px;">The Open Dyslexic and Atkinson Hyperlegible fonts are distributed under the SIL license, see the licenses for <a href="res/fonts/SIL Open Font License.txt" target="_blank">Open Dyslexic</a> and <a href="res/fonts/Atkinson Hyperlegible Font License.txt" target="_blank">Atkinson Hyperlegible</a></p>
		<p style="text-align:right;font-size:small;margin-bottom:0px">OpurexPOS  v{{data.version}}</p>
	</article>
</section>
</div>
`
});
