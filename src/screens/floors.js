function floors_show() {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStore("floors", function(floors) {
			_floors_showFloors(floors);
			storage_close();
		});
	});
}

function _floors_showFloors(floors) {
	var sortedFloors = floors.sort(tools_sort("dispOrder", "label"));
	vue.screen.data = {floors: floors, selectedFloor: null};
	if (sortedFloors.length > 0) {
		vue.screen.data.selectedFloor = floors[0];
	}
	vue.screen.component = "vue-floors-edit"
	gui_hideLoading();
}

function floors_selectPlace(place) {
	if (vue.screen.data.selectedPlace != null) {
		let el = document.getElementById("place" + vue.screen.data.selectedPlace.id);
		if (el != null) {
			el.classList.remove("selected");
		}
	}
	vue.screen.data.selectedPlace = place;
	// TODO: all of this should be magic with Vue, but I haven't found how to update the bind pointer.
	if (place != null) {
		let el = document.getElementById("place-label");
		el.value = vue.screen.data.selectedPlace.label;
		el.disabled = false;
		el = document.getElementById("place-x");
		el.value = vue.screen.data.selectedPlace.x;
		el.disabled = false;
		el = document.getElementById("place-y");
		el.value = vue.screen.data.selectedPlace.y;
		el.disabled = false;
		document.getElementById("place-delete").disabled = false;
		let elPlace = document.getElementById("place" + place.id);
		if (elPlace != null) {
			elPlace.classList.add("selected");
		}
	} else {
		let ids = ["place-label", "place-x", "place-y"]
		for (let i = 0; i < ids.length; i++) {
			let el = document.getElementById(ids[i]);
			el.value = "";
			el.disabled = true;
		}
		document.getElementById("place-delete").disabled = true;
	}
}

// Just some plain reactivity code that should be handled by Vue
function floors_placeEdit(propertyName) {
	var el = null
	var value = null;
	switch (propertyName) {
		case "label":
			el = document.getElementById("place-label");
			value = el.value;
			vue.screen.data.selectedPlace.label = value;
			break;
		case "x":
			el = document.getElementById("place-x");
			value = parseInt(el.value);
			vue.screen.data.selectedPlace.x = value;
			break;
		case "y":
			el = document.getElementById("place-y");
			value = parseInt(el.value);
			vue.screen.data.selectedPlace.y = value;
			break;
		default:
			console.warn("Invalid property for floor_placeEdit");
	}
}

function floors_addPlace() {
	let newPlace = Place_default();
	vue.screen.data.selectedFloor.places.push(newPlace);
	floors_selectPlace(newPlace);
}
function floors_deletePlace() {
	if (vue.screen.data.selectedPlace == null) {
		return;
	}
	for (let i = 0; i < vue.screen.data.selectedFloor.places.length; i++) {
		let place = vue.screen.data.selectedFloor.places[i];
		if (place.id == vue.screen.data.selectedPlace.id) {
			vue.screen.data.selectedFloor.places.splice(i, 1);
			floors_selectPlace(null);
			return;
		}
	}
}

function floors_selectFloor(floor) {
	vue.screen.data.selectedFloor = floor;
	// TODO: all of this should be magic with Vue, but I haven't found how to update the bind pointer.
	if (floor != null) {
		let el = document.getElementById("floor-label");
		el.value = vue.screen.data.selectedFloor.label;
		el.disabled = false;
		el = document.getElementById("floor-dispOrder");
		el.value = vue.screen.data.selectedFloor.dispOrder;
		el.disabled = false;
	} else {
		let el = document.getElementById("floor-label");
		el.value = "";
		el.disabled = true;
		el = document.getElementById("floor-dispOrder");
		el.value = "";
		el.disabled = true;
	}
}

// Just some plain reactivity code that should be handled by Vue
function floors_floorEdit(propertyName) {
	var el = null
	var value = null;
	switch (propertyName) {
		case "label":
			el = document.getElementById("floor-label");
			value = el.value;
			vue.screen.data.selectedFloor.label = value;
			break;
		case "dispOrder":
			el = document.getElementById("floor-dispOrder");
			value = parseInt(el.value);
			vue.screen.data.selectedFloor.dispOrder = value;
			break;
		default:
			console.warn("Invalid property for floor_placeEdit");
	}
}

function floors_addFloor() {
	let newFloor = Floor_default();
	vue.screen.data.floors.push(newFloor);
}

function floors_saveFloors() {
	gui_showLoading();
	srvcall_post("api/places", vue.screen.data.floors, floors_saveCallback);
}

function floors_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, floors_saveFloors)) {
		return;
	}
	// Refresh data from server for definitive ids
	let floors = JSON.parse(response);
	vue.screen.data.floors = floors;
	_floors_saveCommit(vue.screen.data.floors);
}

function _floors_saveCommit(floors) {
	// Update in local database
	storage_open(function(event) {
		storage_write("floors", floors, function(event) {
			appData.localWriteDbSuccess(event);
			floors_show();
			// TODO: the selected place is not refreshed, because autoselectfloor is on Vue mount
		}, function(event) {
			appData.localWriteDbError(event);
			floors_show();
			// TODO: the selected place is not refreshed, because autoselectfloor is on Vue mount
		});
	}, appData.localWriteDbOpenError);
}

