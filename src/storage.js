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
	"resources",
	"options"
];

var storage_available = function(success, error) {
	// General browser check
	if (!window.indexedDB) {
		error(false);
		return;
	}
	// DB acces (private navigation mode)
	var request = window.indexedDB.open("pasteque-check", 1);
	request.onerror = error;
	request.onsuccess = function(event) {
		var db = event.target.result;
		db.close();
		var delRequest = window.indexedDB.deleteDatabase("pasteque-check");
		delRequest.onsuccess = success;
		delRequest.onerror = error;
	}
}

/** Success and error are callback function with only the event as parameter. */
var storage_open = function(success, error) {
	if (arguments.length < 2) {
		error = appData.generalDbError;
	}
	// Version is XYYZZ with X the major version, Y minor and Z local (debug)
	var request = window.indexedDB.open("pasteque", 80006);
	request.onerror = error;
	request.onsuccess = function(event) {
		appData.db = event.target.result;
		success(event);
	};
	request.onupgradeneeded = _storage_install;
}

var storage_close = function() {
	if (appData.db != null) {
		appData.db.close();
		appData.db = null;
	}
}

var storage_drop = function(success, error) {
	storage_close();
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
	// Options
	var optS = db.createObjectStore("options", { keyPath: "name" });
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

var _storage_dbCheck = function(func_name) {
	if (appData.db == null) {
		let error = new Error();
		let event = new EventTarget();
		if (error.stack) {
			event.stack += "\n" + error.stack;
		}
		console.error("storage_sync: appData.db is null. Is the database opened?");
		event.error = new DOMException("appData.db is null.", "NullAppDataError");
		return event;
	}
	return null;
}

var storage_sync = function(syncData, progress, error, complete) {
	let dbError = _storage_dbCheck();
	if (dbError != null) {
		error(dbError);
		return;
	}
	var transaction = appData.db.transaction(SYNC_MODELS, "readwrite");
	transaction.oncomplete = function(event) {
		localStorage.setItem("syncDate", Date.now());
		complete(event);
	}
	for (var i = 0; i < SYNC_MODELS.length; i++) {
		_storage_sync_part(transaction, syncData, SYNC_MODELS[i], progress, error);
	}
}

var _storage_sync_part = function(transaction, syncData, model, progress, error) {
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

var storage_readStore = function(storeName, callback, errorCallback) {
	if (arguments.length < 3) {
		errorCallback = appData.readDbError;
	}
	storage_readStores([storeName], function(data) {
		callback(data[storeName]);
	}, errorCallback);
}

var storage_readStores = function(storeNames, callback, errorCallback) {
	if (arguments.length < 3) {
		errorCallback = appData.readDbError;
	}
	let dbError = _storage_dbCheck();
	if (dbError != null) {
		errorCallback(dbError);
		return;
	}
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
		let cursor = store.openCursor();
		cursor.onsuccess = successClosure(storeName, i);
		cursor.onerror = errorCallback;
	}
}

var storage_write = function(storeName, record, successCallback, errorCallback) {
	let dbError = _storage_dbCheck();
	if (dbError != null) {
		errorCallback(dbError);
		return;
	}
	// Multi write
	if (Array.isArray(record)) {
		let size = record.length;
		let data = [];
		let callbackCalled = false;
		let store = appData.db.transaction(storeName, "readwrite").objectStore(storeName);
		let success = function(event) {
			data.push(event.target.result);
			if (data.length == size && callbackCalled == false) {
				callbackCalled = true;
				successCallback(data);
			}
		}
		for (let i = 0; i < size; i++) {
			let request = store.put(record[i]);
			request.onsuccess = success;
			request.onerror = errorCallback;
		}
	} else {
		// Single record write
		let store = appData.db.transaction([storeName], "readwrite").objectStore(storeName);
		let req = store.put(record);
		req.onsuccess = successCallback;
		req.onerror = errorCallback;
	}

}

var storage_delete = function(storeName, id, successCallback, errorCallback) {
	let dbError = _storage_dbCheck();
	if (dbError != null) {
		errorCallback(dbError);
		return;
	}
	// Multi delete
	if (Array.isArray(id)) {
		let size = record.length;
		let data = [];
		let callbackCalled = false;
		let store = appData.db.transaction(storeName, "readwrite").objectStore(storeName);
		let success = function(event) {
			data.push(event.target.result);
			if (data.length == size && callbackCalled == false) {
				callbackCalled = true;
				successCallback(data);
			}
		}
		for (let i = 0; i < size; i++) {
			let request = store.delete(id[i]);
			request.onsuccess = success;
			request.onerror = errorCallback;
		}
	} else {
		// Single record write
		let store = appData.db.transaction([storeName], "readwrite").objectStore(storeName);
		let req = store.delete(id);
		req.onsuccess = successCallback;
		req.onerror = errorCallback;
	}
}

var storage_get = function(storeName, id, callback, errorCallback) {
	if (arguments.length < 4) {
		errorCallback = appData.readDbError;
	}
	let dbError = _storage_dbCheck();
	if (dbError != null) {
		errorCallback(dbError);
		return;
	}
	if (Array.isArray(id)) {
		// Multi read
		let size = id.length;
		let data = {};
		let callbackCalled = false;
		let store = appData.db.transaction(storeName, "readonly").objectStore(storeName);
		let successFunc = function(reqId) {
			return function(event) {
				data[reqId] = event.target.result;
				if (Object.keys(data).length == size && callbackCalled == false) {
					callbackCalled = true;
					callback(data);
				}
			}
		}
		for (let i = 0; i < size; i++) {
			let request = store.get(id[i]);
			request.onsuccess = successFunc(id[i]);
			request.onerror = errorCallback;
		}
	} else {
		// Single record read
		let store = appData.db.transaction([storeName], "readonly").objectStore(storeName);
		let request = store.get(id);
		request.onsuccess = function(event) {
			callback(event.target.result);
		}
		request.onerror = errorCallback;
	}
}

var storage_getIndex = function(storeName, index, val, callback, errorCallback) {
	let dbError = _storage_dbCheck();
	if (dbError != null) {
		errorCallback(dbError);
		return;
	}
	// Multi read
	if (Array.isArray(val)) {
		let size = val.length;
		let data = [];
		let callbackCalled = false;
		let store = appData.db.transaction(storeName, "readonly").objectStore(storeName);
		let success = function(event) {
			let cursor = event.target.result;
			if (cursor) {
				data.push(cursor.value);
				if (data.length == size && callbackCalled == false) {
					callbackCalled = true;
					callback(data);
				}
			}
		}
		for (let i = 0; i < size; i++) {
			let request = store.index(index);
			request = request.openCursor(IDBKeyRange.only(val[i]));
			request.onsuccess = success;
			request.onerror = errorCallback;
		}
	} else {
		// Single record read
		let store = appData.db.transaction([storeName], "readonly").objectStore(storeName);
		let request = store.index(index).openCursor(IDBKeyRange.only(val));
		request.onsuccess = function(event) {
			let cursor = event.target.result;
			if (cursor) {
				callback(cursor.value);
			} else {
				callback(null);
			}
		}
		request.onerror = errorCallback;
	}
}

var storage_getProductsFromCategory = function(catId, callback, sortFields, errorCallback) {
	if (arguments.length < 4) {
		errorCallback = appData.readDbError;
	}
	let dbError = _storage_dbCheck();
	if (dbError != null) {
		errorCallback(dbError);
		return;
	}
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

var storage_getSessionOption = function(option) {
	return sessionStorage.getItem(option);
}

var storage_setSessionOption = function(name, value) {
	if (value == null) {
		sessionStorage.removeItem(name);
	} else {
		sessionStorage.setItem(name, value);
	}
}
