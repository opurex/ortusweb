Vue.component("vue-floors-edit", {
	props: ["data"],
	data: function() {
		return {
			selectedFloorId: null,
			places: [],
		};
	},
	template: `<div class="floor-map">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Plan de tables</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><button class="btn btn-add" v-on:click="addFloor()">Ajouter une salle</button></li>
				<li><button class="btn btn-add" v-on:click="addPlace()">Ajouter une table</button></li>
				<li>
					<label for="select-floor">Salle</label>
					<select class="form-control" id="select-floor" v-model="selectedFloorId">
						<option disabled value="">Please select one</option>
						<option v-for="floor in data.floors" :key="floor.id" v-bind:value="floor.id">{{floor.label}}</option>
					</select>
				</li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-map" class="form-large form-mosaic" onsubmit="return false;">
			<fieldset class="form-tiny">
				<legend>Salle</legend>
				<div class="form-group">
					<label for="floor-label">Nom de la salle</label>
					<input id="floor-label" type="text" onchange="javascript:floors_floorEdit('label');" />
				</div>
				<div class="form-group">
					<label for="floor-dispOrder">Ordre d'affichage</label>
					<input id="floor-dispOrder" type="number" step="1" onchange="javascript:floors_floorEdit('dispOrder');" />
				</div>
			</fieldset>
			<fieldset class="form-tiny">
				<legend>Table courante</legend>
				<div class="form-group">
					<label for="place-label">Nom de la table sélectionnée</label>
					<input id="place-label" type="text" onchange="javascript:floors_placeEdit('label');" />
				</div>
				<div class="form-group">
					<label for="place-x">X</label>
					<input id="place-x" type="number" step="1" onchange="javascript:floors_placeEdit('x');" />
				</div>
				<div class="form-group">
					<label for="place-y">Y</label>
					<input id="place-y" type="number" step="1" onchange="javascript:floors_placeEdit('y');" />
				</div>
				<div class="form-control">
					<button id="place-delete" class="btn btn-remove" v-on:click="deletePlace()">Supprimer</button>
				</div>
			</fieldset>
			<fieldset>
				<legend>Plan de tables</legend>
				<p>Suggestion de présentation. Veillez à laisser 3 cases entre les tables pour éviter le chevauchement</p>
				<p>Attention : veillez à ce que les caisse soient fermées avant de modifier le plan de table, au risque de perdre les commandes en cours.</p>
				<div class="floor-display">
					<ul>
						<li class="place" style="position:absolute" v-for="place in places" :key="place.id" v-bind:style="{left: place.x, top: place.y}" v-on:click="selectPlace(place, $event)">{{place.label}}</li>
					</ul>
				</div>
				<div class="form-control">
					<button class="btn btn-primary btn-send" type="submit" v-on:click="save">Envoyer</button>
				</div>
			</fieldset>
		</form>
	</article>
</section>
</div>`,
	methods: {
		selectPlace: function(place, event) {
			floors_selectPlace(place);
		},
		addPlace: function() {
			floors_addPlace();
		},
		deletePlace: function() {
			floors_deletePlace();
		},
		addFloor: function() {
			floors_addFloor();
		},
		autoselectPlace() {
			if (this.data.selectedFloor.places.length > 0) {
				floors_selectPlace(this.data.selectedFloor.places[0]);
			} else {
				floors_selectPlace(null);
			}
		},
		autoselectFloor() {
			if (this.data.floors.length > 0) {
				this.selectedFloorId = this.data.floors[0].id;
				this.data.selectedFloor = this.data.floors[0];
				this.autoselectPlace();
			}
		},
		save() {
			floors_saveFloors();
		}
	},
	watch: {
		'selectedFloorId': function(floorId, oldVal) {
			let floor = null;
			for (let i = 0; i < this.data.floors.length; i++) {
				if (floorId == this.data.floors[i].id) {
					this.places = this.data.floors[i].places;
					floors_selectFloor(this.data.floors[i]);
					this.autoselectPlace();
				}
			}
		},
	},
	mounted: function() {
		this.autoselectFloor();
	}
});

