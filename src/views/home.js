Vue.component("vue-home", {
	props: ["data"],
	template: `<div class="home">
<section class="box box-medium">
	<article class="box-body">
		<p v-if="data.syncDate" style="text-align:center">Les données ont été chargées le {{data.syncDate.date}} à {{data.syncDate.time}}.<br>Cliquez sur le bouton ci-dessous pour actualiser vos données, en particulier si vous accédez à cette interface depuis plusieurs ordinateurs.</p>
		<p v-else style="text-align:center"><strong>Aucune donnée n'a été chargée</strong>. Cliquez sur le bouton ci-dessous pour charger vos données et accéder au menu.</p>
		<p style="text-align:center"><button class="btn btn-primary" onclick="javascript:home_sendSync();">Recharger les données</button></p>
		<h1>Interface d'administration</h1>
		<p>Bonjour {{data.user}}. Vous êtes connecté·e sur {{data.server}}.</p>
		<p>Vous êtes dans votre interface d'administration où vous pouvez créer vos produits, catégories, accéder à vos statistiques de ventes etc.</p>
		<h2>Documentation</h2>
		<p>Il y a plusieurs sources de documentation :</p>
		<ul>
			<li><a href="https://fr.wikibooks.org/wiki/Logiciel_Past%C3%A8que" target="_blank" >Manuel d’installation, de configuration et d’utilisation sur wikibooks</a></li>
			<li><a href="https://framateam.org/pasteque" target="_blank">Les salons de clavardage de l'association Pastèque</a></li>
		</ul>
		<p style="font-size:small;margin-bottom:0px;">Les fontes de caractères Open Dyslexic et Atkinson Hyperlegible sont distribuées sous licence SIL, voir les licences pour <a href="res/fonts/SIL Open Font License.txt" target="_blank">Open Dyslexic</a> et <a href="res/fonts/Atkinson Hyperlegible Font License.txt" target="_blank">Atkinson Hyberlegible</a></p>
		<p style="text-align:right;font-size:small;margin-bottom:0px">Pasteque-jsadmin v8.20</p>
	</article>
</section>
<aside class="box box-tiny">
	<article class="box-body twitter-feed">
		<a class="twitter-timeline" href="https://twitter.com/pastequepos" data-widget-id="584374065407885312">Tweets de @pastequepos</a>
	</article>
</aside>
</div>
`,
	mounted: function() {
		// The Twitter stuff
		!function (d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
			if (!d.getElementById(id)) {
				js = d.createElement(s);
				js.id = id;
				js.src = p + "://platform.twitter.com/widgets.js";
				fjs.parentNode.insertBefore(js, fjs);
			}
		}(document, "script", "twitter-wjs");
	}
});

