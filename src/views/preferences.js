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
			<div class="form-group">
				<input id="edit-dyslexia" type="checkbox" name="dyslexia" v-model="data.preferDyslexicMode" />
				<label for="edit-dyslexia">Préférer le mode dyslexique</label>
			</div>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</article>
</section>
</div>
`,
});

