Vue.component("vue-floors-edit", {
	props: ["data"],
	data: function() {
		return {
			selectedFloor: null,
			selectedPlace: null,
			places: [],
			DRAG_THRESHOLD: 5, // Move before dragging in pixels
			dragging: false,
			clickedPlace: null,
			clickedPoint: null,
			maxX: null,
			maxY: null,
			deleted: {
				floors: [],
				places: [],
			},
		};
	},
	template: `<div class="floor-map">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Table Plan</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><button class="btn btn-add" v-on:click="addFloor()">Add Room</button></li>
				<li>
					<label for="select-floor">Room</label>
					<select class="form-control" id="select-floor" v-model="selectedFloor">
						<option disabled value="">Ordered Room List</option>
						<option v-for="floor in sortedFloors" :key="floor.id" v-bind:value="floor">{{floor.label}}</option>
					</select>
				</li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<p class="warning">Warning: Make sure cash registers are closed before modifying the table plan, otherwise ongoing orders may be lost upon reload.</p>
		<form id="edit-map" class="form-large form-mosaic" onsubmit="return false;">
			<fieldset class="form-tiny" v-if="selectedPlace">
				<legend>Selected Table</legend>
				<div class="form-group">
					<label for="place-label">Table Name</label>
					<input id="place-label" type="text" v-model="selectedPlace.label" />
				</div>
				<div class="form-group">
					<label for="place-x">X</label>
					<input id="place-x" type="number" step="1" v-model="selectedPlace.x" />
				</div>
				<div class="form-group">
					<label for="place-y">Y</label>
					<input id="place-y" type="number" step="1" v-model="selectedPlace.y" />
				</div>
				<div class="form-control">
					<button type="button" id="place-delete" class="btn btn-remove" v-on:click="deletePlace()">Delete Table</button>
				</div>
			</fieldset>
			<fieldset class="form-tiny" v-else>
				<legend>Selected Table</legend>
				<div class="form-group">
					<label>Table Name</label>
					<input type="text" disabled="true" placeholder="No table selected">
				</div>
				<div class="form-group">
					<label>X Position (horizontal)</label>
					<input type="text" disabled="true" placeholder="No table selected">
				</div>
				<div class="form-group">
					<label>Y Position (vertical)</label>
					<input type="text" disabled="true" placeholder="No table selected">
				</div>
				<div class="form-control">
					<button type="button" class="btn btn-remove" disabled="true">Delete Table</button>
				</div>
			</fieldset>
			<fieldset>
				<legend>Table Plan <span style="font-size: x-small; font-style: italic;">(layout suggestion)</span></legend>
				<div class="form-group" v-if="selectedFloor">
					<label for="floor-label">Room Name</label>
					<input id="floor-label" type="text" v-model="selectedFloor.label">
				</div>
				<div class="form-group" v-if="selectedFloor">
					<label for="floor-dispOrder">Display Order</label>
					<input id="floor-dispOrder" type="number" step="1" v-model="selectedFloor.dispOrder" />
				</div>
				<div class="form-control">
					<button type="button" class="btn btn-add" v-on:click="addPlace()">Add Table</button>
					<button type="button" id="floor-delete" class="btn btn-remove" v-bind:disabled="selectedFloor?.id" v-on:click="deleteFloor()" v-bind:title="deleteFloorTitle">Delete Room</button>
				</div>
				<div class="floor-display" id="floor-display" v-on:mousemove="mousemovePlace($event)" v-on:mouseup="mouseupPlace($event)">
					<ul>
						<li class="place" style="position:absolute" v-for="place in places" :key="place.id"
							v-bind:id="'place' + place.id" v-bind:style="{left: place.x, top: place.y}"
							v-bind:class="{ 'selected': selectedPlace == place }"
							v-on:click="selectPlace(place, $event)"
							v-on:mousedown="mousedownPlace(place, $event)">{{place.label}}</li>
					</ul>
				</div>
			</fieldset>
			<fieldset>
				<legend>Deleted Items</legend>
				<ul class="deleted-places">
					<li class="place-list" v-for="(place, index) in deleted.places">{{place.label}} <button class="btn btn-misc" type="button" v-on:click="restorePlace(place, index)"><img style="height: 2ex;" src="res/img/cancel.png" alt="Restore" title="Restore"></button></li>
				</ul>
				<ul class="deleted-floors">
					<li class="floor-list" v-for="(floor, index) in deleted.floors">{{floor.label}} ({{floor.places.length}} tables)<button class="btn btn-misc" type="button" v-on:click="restoreFloor(floor, index)"><img style="height: 2ex;" src="res/img/cancel.png" alt="Restore" title="Restore"></button></li>
				</ul>
			</fieldset>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="button" v-on:click="save">Save Changes</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
		selectPlace: function(place, event) {
			this.selectedPlace = place;
		},
		mousedownPlace: function(place, event) {
			this.clickedPlace = place;
			this.clickedPoint = {
				x: event.clientX,
				y: event.clientY,
			};
		},
		mousemovePlace: function(event) {
			if (!this.clickedPlace) {
				return;
			}
			if (!this.dragging) {
				if (Math.abs(event.clientX - this.clickedPoint.x) > this.DRAG_THRESHOLD || Math.abs(event.clientY - this.clickedPoint.y) > this.DRAG_THRESHOLD) {
					this.dragging = true;
					this.selectPlace(this.clickedPlace, event);
				}
			}
			if (this.dragging) {
				let deltaX = event.clientX - this.clickedPoint.x;
				let deltaY = event.clientY - this.clickedPoint.y;
				this.clickedPlace.x = Math.max(this.clickedPlace.x += deltaX, 0);
				this.clickedPlace.x = Math.min(this.clickedPlace.x, this.maxX);
				this.clickedPlace.y = Math.max(this.clickedPlace.y += deltaY, 0);
				this.clickedPlace.y = Math.min(this.clickedPlace.y, this.maxY);
				this.clickedPoint = {
					x: event.clientX,
					y: event.clientY,
				};
			}
		},
		mouseupPlace: function(event) {
			this.clickedPlace = null;
			this.clickedPoint = null;
			this.dragging = false;
		},
		addPlace: function(newPlace) {
			if (arguments.length == 0 || newPlace == null) {
				newPlace = Place_default();
			}
			this.selectedFloor.places.push(newPlace);
			this.selectPlace(newPlace);
		},
		deletePlace: function() {
			this.deleted.places.push(this.selectedPlace);
			let index = this.selectedFloor.places.findIndex((place) => (place == this.selectedPlace), this);
			if (index != -1) {
				this.selectedFloor.places.splice(index, 1);
			}
			this.autoselectPlace(this.selectedPlace.x, this.selectedPlace.y);
		},
		restorePlace: function(place, index) {
			this.addPlace(place);
			this.deleted.places.splice(index, 1);
			this.selectPlace(place);
		},
		addFloor: function(newFloor) {
			if (arguments.length == 0 || newFloor == null) {
				newFloor = Floor_default();
			}
			this.data.floors.push(newFloor);
			this.selectedFloor = newFloor;
		},
		deleteFloor: function() {
			this.deleted.floors.push(this.selectedFloor);
			let index = this.data.floors.findIndex((floor) => (floor == this.selectedFloor), this);
			if (index != -1) {
				this.data.floors.splice(index, 1);
			}
			this.autoselectFloor();
		},
		restoreFloor: function(floor, index) {
			this.addFloor(floor);
			this.deleted.floors.splice(index, 1);
			this.autoselectPlace();
		},
		autoselectPlace(fromX, fromY) {
			if (arguments.length < 2 || !fromX || !fromY) {
				fromX = 0;
				fromY = 0;
			}
			let minDist = Infinity;
			let minIndex = -1;
			if (!this.selectedFloor) {
				this.selectPlace(null);
				return;
			}
			this.selectedFloor.places.forEach((place, index) => {
				let dist = Math.abs(place.x - fromX) + Math.abs(place.y - fromY);
				if (dist < minDist) {
					minDist = dist;
					minIndex = index;
				}
			});
			if (minIndex != -1) {
				this.selectPlace(this.selectedFloor.places[minIndex]);
			} else {
				this.selectPlace(null);
			}
		},
		autoselectFloor() {
			if (this.data.floors.length > 0) {
				this.selectedFloor = this.data.floors[0];
				this.autoselectPlace();
			}
		},
		save() {
			floors_saveFloors();
		}
	},
	watch: {
		'selectedFloor': function(floor, oldVal) {
			if (floor != null) {
				this.places = floor.places;
				this.selectedFloor = floor;
				this.autoselectPlace();
			}
		},
		"data.floors": function(newFloors, oldFloors) {
			if (newFloors.length != oldFloors.length) {
				return; // add or remove floor, no reset
			}
			if (newFloors.length == 0 || newFloors[0] == oldFloors[0]) {
				return; // same reference
			}
			// On reset after save
			if (this.selectedFloor) {
				let selected = this.selectedFloor;
				let newRef = this.data.floors.find((floor) => (floor.label == selected.label && floor.dispOrder == selected.dispOrder));
				if (newRef) {
					this.selectedFloor = newRef;
				} else {
					this.autoselectFloor();
				}
			}
		}
	},
	computed: {
		"deleteFloorTitle": function() {
			if (this.selectedFloor?.id) {
				return "Deleting a room that has already been saved is not currently supported. Please contact your service provider to perform the deletion.";
			} else {
				return "";
			}
		},
		"sortedFloors": function() {
			return this.data.floors.sort((a, b) => { return a.dispOrder - b.dispOrder });
		},
	},
	mounted: function() {
		this.autoselectFloor();
		let floorEl = document.getElementById("floor-display");
		this.maxX = floorEl.getBoundingClientRect().width;
		this.maxY = floorEl.getBoundingClientRect().height;
	}
});

