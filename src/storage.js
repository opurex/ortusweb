var SYNC_MODELS = [
	"cashRegisters",
	"paymentmodes",
	"currencies",
	"floors",
	"users",
	"roles",
	"taxes",
	"categories",
	"products",
	"tariffareas",
	"discounts",
	"customers",
	"discountprofiles",
	"resources"
];

var storage_available = function() {
	return window.indexedDB;
}

/** Success and error are callback function with only the event as parameter. */
var storage_open = function(success, error) {
	// Version is XYYZZ with X the major version, Y minor and Z local (debug)
	var request = window.indexedDB.open("pasteque", 80005);
	request.onerror = error;
	request.onsuccess = success;
	request.onupgradeneeded = _storage_install;
}

var storage_drop = function(db, success, error) {
	db.close();
	var request = window.indexedDB.deleteDatabase("pasteque");
	request.onerror = error;
	request.onsuccess = success;
}

/** The initializing function called on opening before onsuccess when
 * a new version is detected (or no version at all). */
var _storage_install = function(event) {
	var db = event.target.result;
	// Delete all previous data
	_storage_pulverize(db);
	localStorage.removeItem("syncDate");
	// Rebuild the latest structure
	// CashRegister
	var crS = db.createObjectStore("cashRegisters", { keyPath: "id" });
	crS.createIndex("reference", "reference", { unique: true });
	// PaymentMode
	var pmS = db.createObjectStore("paymentmodes", { keyPath: "id" });
	pmS.createIndex("reference", "reference", { unique: true });
	// Currencies
	var currS = db.createObjectStore("currencies", { keyPath: "id" });
	currS.createIndex("reference", "reference", { unique: true });
	// Places and Floors
	var placeS = db.createObjectStore("floors", { keyPath: "id" });
	// Users
	var userS = db.createObjectStore("users", { keyPath: "id" });
	// Roles
	var roleS = db.createObjectStore("roles", { keyPath: "id" });
	// Taxes
	var taxS = db.createObjectStore("taxes", { keyPath: "id" });
	// Categories
	var catS = db.createObjectStore("categories", { keyPath: "id" });
	catS.createIndex("parent", "parent", { unique: false });
	catS.createIndex("reference", "reference", { unique: true });
	// Products
	var prdS = db.createObjectStore("products", { keyPath: "id" });
	prdS.createIndex("category", "category", { unique: false });
	prdS.createIndex("reference", "reference", { unique: true });
	// Tariff areas
	var taS = db.createObjectStore("tariffareas", { keyPath: "id" });
	// Discounts
	var discS = db.createObjectStore("discounts", { keyPath: "id" });
	// Customers
	var custS = db.createObjectStore("customers", { keyPath: "id" });
	// Discount profiles
	var dpS = db.createObjectStore("discountprofiles", { keyPath: "id" });
	// Resources
	var resS = db.createObjectStore("resources", { keyPath: "label" });
}

/** Delete all objectStores from a db. */
var _storage_pulverize = function(db) {
	let names = [];
	// Copy names then delete
	for (let i = 0; i < db.objectStoreNames.length; i++) {
		names.push(db.objectStoreNames[i]);
	}
	for (let i = 0; i < names.length; i++) {
		db.deleteObjectStore(names[i]);
	}
}

var storage_sync = function(db, syncData, progress, error, complete) {
	var transaction = db.transaction(SYNC_MODELS, "readwrite");
	transaction.oncomplete = function(event) {
		localStorage.setItem("syncDate", Date.now());
		complete(event);
	}
	for (var i = 0; i < SYNC_MODELS.length; i++) {
		_storage_sync_part(db, transaction, syncData, SYNC_MODELS[i], progress, error);
	}
}

var _storage_sync_part = function(db, transaction, syncData, model, progress, error) {
	var store = transaction.objectStore(model);
	var delReq = store.clear();
	delReq.onsuccess = function(event) {
		progress(model, "delete", event);
		for (var i = 0; i < syncData[model].length; i++) {
			var record = syncData[model][i];
			var addReq = store.add(record);
			addReq.onsuccess = function(event) {
				progress(model, i, event);
			};
			addReq.onerror = function(event) {
				error(model, i, event);
			}
		}
	}
	delReq.onerror = function(event) {
		error(model, event);
	}
}

var storage_getSyncDate = function() {
	let date = localStorage.getItem("syncDate");
	if (date == null) { return null; }
	return new Date(parseInt(date));
}

var storage_hasData = function() {
	return (localStorage.getItem("syncDate") != null);
}

var storage_readStore = function(storeName, callback) {
	storage_readStores([storeName], function(data) {
		callback(data[storeName]);
	});
}

var storage_readStores = function(storeNames, callback) {
	let data = {};
	let finished = [];
	let callbackCalled = false;
	for (let i = 0; i < storeNames.length; i++) {
		data[storeNames[i]] = [];
		finished.push(false);
	}
	let stores = appData.db.transaction(storeNames, "readonly");
	let successClosure = function(name, index) {
		return function(event) {
			let cursor = event.target.result;
			if (cursor) {
				data[name].push(cursor.value);
				cursor.continue();
			} else {
				finished[index] = true;
				for (let k = 0; k < finished.length; k++) {
					if (finished[k] == false) {
						return;
					}
				}
				if (callbackCalled == false) {
					callbackCalled = true;
					callback(data);
				}
			}
		}
	}
	for (let i = 0; i < storeNames.length; i++) {
		let storeName = storeNames[i];
		let store = stores.objectStore(storeName);
		store.openCursor().onsuccess = successClosure(storeName, i);
	}
}

var storage_write = function(storeName, record, successCallback, errorCallback) {
	let store = appData.db.transaction([storeName], "readwrite").objectStore(storeName);
	let req = store.put(record);
	req.onsuccess = successCallback;
	req.onerror = errorCallback;
}

var storage_getProductsFromCategory = function(catId, callback, sortFields) {
	if (arguments.length < 3) {
		sortFields = ["dispOrder", "reference"];
	}
	let prdStore = appData.db.transaction(["products"], "readonly").objectStore("products");
	let products = [];
	prdStore.index("category").openCursor(IDBKeyRange.only(catId)).onsuccess = function(event) {
		let cursor = event.target.result;
		if (cursor) {
			products.push(cursor.value);
			cursor.continue();
		} else {
			let sortedPrds = products.sort(tools_sort(sortFields[0], sortFields[1]));
			callback(sortedPrds);
		}
	}
}
