Vue.component("vue-preferences", {
	props: ["data"],
	template: `<div class="preferences">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Préférences</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-preferences-form" class="form-large" onsubmit="javascript:preferences_save(); return false;">
			<fieldset>
				<legend>Police d'écriture</legend>
				<div class="form-group">
					<input id="font-system" type="radio" name="font" value="system" v-model="data.font" v-on:change="updateFont()" />
					<label for="font-system" class="no-font">Désactiver la police</label>
				</div>
				<div class="form-group">
					<input id="font-pt" type="radio" name="font" value="sans" v-model="data.font" v-on:change="updateFont()" />
					<label for="font-pt" class="default-font">Sans serif</label>
				</div>
				<div class="form-group">
					<input id="font-opendyslexic" type="radio" name="font" value="opendyslexic" v-model="data.font" v-on:change="updateFont()" />
					<label for="font-opendyslexic" class="dyslexic-friendly">Open Dyslexic</label>
				</div>
				<div class="form-group">
					<input id="font-atkinsonhyperlegible" type="radio" name="font" value="hyperlegible" v-model="data.font" v-on:change="updateFont()" />
					<label for="font-atkinsonhyperlegible" class="hyperlegible">Atkinson Hyperlegible</label>
				</div>
			</fieldset>

			<div class="form-group">
				<label for="tablePageSize">Nombre de lignes par page de tableau</label>
				<select v-model.number="data.tablePageSize" id="tablePageSize">
					<option value="50">50</option>
					<option value="100">100</option>
					<option value="250">250</option>
					<option value="500">500</option>
					<option value="-1">Tout</option>
				</select>
			</div>

			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</article>
</section>
</div>
`,
	methods: {
		updateFont: function() {
			gui_setFont(this.data.font);
		}
	}
});

