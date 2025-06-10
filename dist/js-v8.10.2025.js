
/** Get a sorting function to pass to Array.sort to sort by fields.
 * String fields are converted to lowercase for comparison.
 * @param field1 The name of the first field to compare.
 * @param field2 (optional) The name of the second field to compare
 * if the first values are equals. */
var tools_sort = function(field1, field2) {
	if (arguments.length < 2) {
		field2 = null;
	}
	return function(a, b) {
		let a1 = a[field1];
		let b1 = b[field1];
		if (typeof a1 == "string") {
			a1 = a1.toLowerCase();
			b1 = b1.toLowerCase();
		}
		if (a1 == b1) {
			if (field2 == null) {
				return 0;
			}
			let a2 = a[field2];
			let b2 = b[field2];
			if (typeof a2 == "string") {
				a2 = a2.toLowerCase();
				b2 = b2.toLowerCase();
			}
			if (a2 < b2) {
				return -1;
			} else if (a2 > b2) {
				return 1;
			} else {
				return 0;
			}
		} else {
			if (a1 < b1) {
				return -1;
			} else if (a1 > b1) {
				return 1;
			} else {
				return 0;
			}
		}
	}
}

/** Compare two dates disregarding time.
 * @param original The original date. This is the one that should be kept when the dates are considered equals.
 * @param updated The new date.
 * @return True when both date shares the same year, month and date. */
var tools_dateEquals = function(original, updated) {
	return new PTDate(original).equals(new PTDate(updated));
}

/** Convert a Date object to a DD/MM/YYYY string. */
var tools_dateToString = function(dateTime) {
	let ptDate = new PTDate(dateTime);
	return ptDate.toString();
}
var tools_dateToDataString = function(dateTime) {
	if (dateTime == null) {
		return null;
	}
	if (typeof dateTime == "number") {
		dateTime = new Date(dateTime * 1000);
	}
	return dateTime.toISOString().split('T')[0];
}
/** Convert a Date object to a HH:mm string. */
var tools_timeToString = function(dateTime) {
	let hours = dateTime.getHours();
	let minutes = dateTime.getMinutes();
	let seconds = dateTime.getSeconds();
	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	return hours + ":" + minutes + ":" + seconds;
}
/** Convert a Date object to a DD/MM/YYYY HH:mm string. */
var tools_dateTimeToString = function(dateTime) {
	return tools_dateToString(dateTime) + " " + tools_timeToString(dateTime);
}

/** Convert a D(D)[-/]M(M)[-/]YY(YY) string to a Date object.
 * Return false if the format is invalid. */
var tools_stringToDate = function(stringDate) {
	stringDate = stringDate.replace(/-/g, "/");
	let parts = stringDate.split("/");
	if (parts.length != 3) {
		return false;
	} else {
		if (parts[2].length == 2) {
			parts[2] = "20" + parts[2];
		} else if (parts[2].length != 4) {
			return false;
		}
		return new Date(parts[2], parts[1] - 1, parts[0]);
	}
}
var tools_stringToNumber = function(stringNumber) {
	// return parseFloat(stringNumber.replace(/\s/g, '').replace(',', '.'))
	return stringNumber.replace(/\s/g, '')
}

var tools_stringToBool = function(strValue) {
	let lower = strValue.toLowerCase();
	return strValue == "1" || lower == "oui" || lower == "o" || lower == "t" || lower == "true";
}

Date.prototype.getWeek = function () {
	var date = new Date(this.getTime());
	date.setHours(0, 0, 0, 0);
	// Thursday in current week decides the year.
	date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
	// January 4 is always in week 1.
	var week1 = new Date(date.getFullYear(), 0, 4);
	// Adjust to Thursday in week 1 and count number of weeks from date to week1.
	return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
		- 3 + (week1.getDay() + 6) % 7) / 7);
}
/**
 * Subset of date objects to ease the use in Pasteque regarding
 * the multiple formats available and the absence of timezone.
 * The API sends timestamp as if they were local values.
 *
 * This class should replace date-related functions in tools.js.
 */
class PTDate
{
	/**
	 * Create a PTDate from a YYYY-MM-DD string.
	 * @param str The date in YYYY-MM-DD format, empty string or null.
	 * @return A PTDate or false when the date couldn't be parsed.
	 */
	static fromISO(str) {
		if (str == "" || str == null) {
			return new PTDate(null);
		}
		if (str.length != 10) {
			return false;
		}
		let parts = str.split("-");
		if (parts.length != 3 || parts[0].length != 4 || parts[1].length != 2 || parts[2].length != 2) {
			return false;
		}
		let date = new PTDate();
		date.#isNull = false;
		date.#year = parseInt(parts[0]);
		date.#month = parseInt(parts[1]);
		date.#day = parseInt(parts[2]);
		return date;
	}

	/**
	 * Create a PTDate from a DD/MM/YYYY string.
	 * @param str The date in DD/MM/YYYY format, empty string or null.
	 * @return A PTDate or false when the date couldn't be parsed.
	 */
	static fromStr(str) {
		if (str == "" || str == null) {
			return new PTDate(null);
		}
		let parts = str.split("/");
		if (parts.length != 3
				|| (parts[0].length != 1 && parts[0].length != 2)
				|| (parts[1].length != 1 && parts[1].length != 2)
				|| (parts[2].length != 2 && parts[2].length != 4)) {
			return false;
		}
		let date = new PTDate();
		date.#isNull = false;
		date.#year = parseInt(parts[2]);
		date.#month = parseInt(parts[1]);
		date.#day = parseInt(parts[0]);
		return date;
	}

	/** True when the date is not set. */
	#isNull;
	/** Full year */
	#year;
	/** Month number, from 1 to 12 (not the same as in Date). */
	#month;
	/** Day number, from 1 to 31. */
	#day;

	/**
	 * Convert a date representation to a PTDate.
	 * @param date Either null,a timestamp in second, a YYYY[/-]MM[/-]DD string
	 * a Date or a PTDate.
	 */
	constructor(date) {
		if (date === null) {
			this.#isNull = true;
			return;
		}
		if (date instanceof PTDate) {
			this.#isNull = date.#isNull;
			this.#year = date.#year;
			this.#month = date.#month;
			this.#day = date.#day;
			return;
		}
		switch (typeof date) {
			case "number":
				date = new Date(date * 1000);
				break;
			case "string":
				let str = date;
				date = PTDate.fromISO(str);
				if (!date) {
					date = PTDate.fromStr(str);
				}
				if (!date) {
					this.#isNull = true;
					return;
				}
				this.#isNull = date.#isNull;
				this.#day = date.#day;
				this.#month = date.#month;
				this.#year = date.#year;
				return;
			case "undefined":
				this.#isNull = true;
				return;
		}
		// probably a Date
		this.#isNull = false;
		this.#day = parseInt(date.getDate());
		this.#month = parseInt(date.getMonth() + 1);
		this.#year = parseInt(date.getFullYear());
	}

	/** Check if this date can be used or should be null. */
	isNull() {
		return this.#isNull;
	}

	/** Convert to user-friendly string, empty string when null. */
	toString() {
		if (this.#isNull) {
			return "";
		}
		let str = "";
		if (this.#day < 10) {
			str += "0";
		}
		str += this.#day + "/";
		if (this.#month < 10) {
			str += "0";
		}
		str += this.#month + "/" + this.#year;
		return str;
	}

	/** Convert to iso-formatted string, null when not set. */
	toDataString() {
		if (this.#isNull) {
			return null;
		}
		let str = this.#year + "-";
		if (this.#month < 10) {
			str += "0";
		}
		str += this.#month + "-"
		if (this.#day < 10) {
			str += "0";
		}
		str += this.#day;
		return str;
	}

	/** Check if both PTDates are null or share the same date. */
	equals(otherPTDate) {
		return (this.#isNull && otherPTDate.#isNull)
				|| (this.#year == otherPTDate.#year
				&& this.#month == otherPTDate.#month
				&& this.#day == otherPTDate.#day);
	}

	/** Format to send PTDates as YYYY-MM-DD string to the API. */
	toJSON () {
		return this.toDataString();
	};
}
class RecordFactory {
	#modelDef;
	#errors;
	#changes;
	constructor(modelDef) {
		this.#modelDef = modelDef;
	}
	#reset() {
		this.#errors = [];
		this.#changes = [];
	}
	/**
	 * Create a record prefilled with the default values but without checking
	 * for constraints nor running ModelDef.postChange.
	 * @return The new record as an associative array, with default values set.
	 */
	createEmpty() {
		let record = {};
		for (let key in this.#modelDef.fields) {
			if ("default" in this.#modelDef.fields[key]) {
				record[key] = this.#modelDef.fields[key].default;
			}
		}
		return record;
	}
	/**
	 * Create a new record from its model definition a set of values.
	 * @param values The associative array of values to set.
	 * @param linkedRecords (optional) The dictionary of records to get
	 * actual value from. In the form of {"modelDef": def, "records": list of records}.
	 * It is passed to ModelDef.postChange if any is defined.
	 * @return The new record as an associative array, with default value
	 * when not specified. Null if the record is not complete or a constraint fails.
	 * See getErrors.
	 */
	create(values, linkedRecords) {
		this.#reset();
		let record = {};
		for (let key in this.#modelDef.fields) {
			if (values && (key in values)) {
				switch (this.#modelDef.fields[key].type) {
					case "date":
						record[key] = new PTDate(values[key]);
						break;
					default:
						record[key] = values[key];
						break;
				}
				if ("default" in this.#modelDef.fields[key] && values[key] != this.#modelDef.fields[key].default) {
					this.#changes.push(key);
				}
			} else if ("default" in this.#modelDef.fields[key]) {
				record[key] = this.#modelDef.fields[key].default;
			}
		}
		if ("postChange" in this.#modelDef) {
			try {
				this.#modelDef.postChange(null, record, linkedRecords);
			} catch (e) {
				this.#errors.push(e);
				return null;
			}
		}
		if (!this.#checkFieldErrors(record, linkedRecords)) {
			return null;
		}
		return record;
	}
	/**
	 * Merge values into an existing record.
	 * @param record The existing record.
	 * @param value The new values to merge into the record.
	 * @param linkedRecords (optional) The dictionary of records to get
	 * actual value from. In the form of {"modelDef": def, "records": list of records}.
	 * It is passed to ModelDef.postChange if any is defined.
	 * @return True when merge is a success. False if an error occured
	 * and the record was left untouched. See getErrors.
	 */
	merge(record, values, linkedRecords) {
		this.#reset();
		let oldValues = {};
		for (let key in this.#modelDef.fields) {
			oldValues[key] = record[key];
			if (key in values) {
				if (typeof values[key] == "undefined") {
					continue;
				}
				record[key] = values[key];
			}
		}
		if ("postChange" in this.#modelDef) {
			try {
				this.#modelDef.postChange(oldValues, record, linkedRecords);
			} catch (e) {
				this.#errors.push(e);
				for (let key in this.#modelDef.fields) {
					record[key] = oldValues[key];
				}
				return false;
			}
		}
		if (!this.#checkFieldErrors(record, linkedRecords)) {
			for (let key in this.#modelDef.fields) {
				record[key] = oldValues[key];
			}
			return false;
		}
		for (let key in this.#modelDef.fields) {
			let edited = false;
			switch (this.#modelDef.fields[key].type) {
				case "date":
					edited = !tools_dateEquals(oldValues[key], record[key]);
					break;
				default:
					edited = oldValues[key] != record[key];
					break;
			}
			if (edited) {
				this.#changes.push(key);
			}
		}
		return true;
	}
	#checkFieldErrors(values, linkedRecords) {
		let noError = true;
		let id = null;
		if ("id" in values) {
			id = values["id"];
		}
		for (let key in this.#modelDef.fields) {
			if (!(key in values)) {
				this.#errors.push(new InvalidFieldException(InvalidFieldConstraints.CSTR_NOT_NULL,
						this.#modelDef.modelName, key, id, null));
				noError = false;
				continue;
			}
			if (this.#modelDef.fields[key].type == "record" && values[key] != null) {
				let modelName = this.#modelDef.fields[key].modelName;
				let modelRecords = linkedRecords.find(e => e.modelDef.modelName == modelName);
				if (typeof modelRecords == "undefined") {
					// Cannot check for linked record
					console.warn("Could not check linked record for " + this.#modelDef.modelName + "." + modelName);
				} else {
					let record = modelRecords.records.find(r => r.id == values[key]);
					if (typeof record == "undefined") {
						this.#errors.push(new InvalidFieldException(InvalidFieldConstraints.CSTR_ASSOCIATION_NOT_FOUND,
								this.#modelDef.modelName, key, id, values[key]));
						noError = false;
					}
				}
			}
		}
		return noError;
	}
	hasErrors() {
		return this.#errors.length > 0;
	}
	/**
	 * Get the list or errors that happened during the latest create or merge.
	 * @return The list of exceptions thrown during the latest create or merge.
	 */
	getErrors() {
		return this.#errors;
	}
	hasChanges() {
		return this.#changes.length > 0;
	}
	getChanges() {
		return this.#changes;
	}
}

/**
 * Enumeration of constraints for InvalidFieldExceptino
 */
const InvalidFieldConstraints = {
	/** The field is a reference to an other record but this record
	 * was not found. */
	CSTR_ASSOCIATION_NOT_FOUND: 'AssociationNotFound',
	/** The field is null but it cannot be. */
	CSTR_NOT_NULL: 'NotNull',
	/** The field is an enum and the value is not within it. */
	CSTR_ENUM: 'Enum',
	/** The value cannot be converted to float. */
	CSTR_FLOAT: 'Float',
	/** The value cannot be converted to boolean. */
	CSTR_BOOL: 'Boolean',
	/** The value cannot be converted to integer. */
	CSTR_INT: 'Integer',
	CSTR_INVALID_DATE: 'InvalidDate',
	CSTR_INVALID_DATERANGE: 'InvalidDateRange',
}

/**
 * Writing a record failed because one of it's fields has an invalid value.
 * Partial reimplementation of API exception.
 */
class InvalidFieldException extends Error
{
	constraint;
	modelName;
	field;
	id;
	value;
	constructor(constraint, modelName, field, id, value) {
		super("Invalid field exception: " + constraint + " on " + field);
		this.constraint = constraint;
		this.modelName = modelName;
		this.field = field;
		this.id = id;
		this.value = value;
	}
}
let CategoryDef = {
	modelName: "category",
	modelId: function(cat) {
		if (cat && cat.id) {
			return cat.id.toString();
		}
		return null;
	},
	fields: {
		"reference": { type: "string", label: "Reference" },
		"label": { type: "string", label: "Description" },
		"dispOrder": { type: "number", default: 0, label: "Order" },
		"parent": { type: "record", modelName: "category", default: null, label: "Parent" },
		"hasImage": { type: "boolean", default: false },
	},

	refField: "reference",
	lookupFields: ["reference", "label"],
}
let ProductDef = {
	modelName: "product",
	modelId: function(prd) {
		if (prd && prd.id) {
			return prd.id.toString();
		}
		return null;
	},
	fields: {
		"reference": { type: "string", label: "Reference" },
		"label": { type: "string", label: "Description" },
		"category": { type: "record", modelName: "category", label: "Category" },
		"dispOrder": { type: "number", default: 0, label: "Display Order" },
		"visible": { type: "boolean", default: true, label: "Available for Sale" },
		"prepay": { type: "boolean", default: false, label: "Prepaid Recharge" },
		"priceSell": { type: "number", label: "Selling Price (excl. tax)" },
		"scaled": { type: "boolean", default: false, label: "Sold by Weight" },
		"scaleType": { type: "scaleType", default: 0, label: "Weight/Volume Type" },
		"scaleValue": { type: "number", default: 1.0, label: "Capacity" },
		"tax": { type: "record", modelName: "tax", label: "VAT" },
		"priceBuy": { type: "number", default: null, label: "Purchase Price (excl. tax)" },
		"barcode": { type: "string", default: "", label: "Barcode" },
		"discountEnabled": { type: "boolean", default: false, label: "Auto Discount Enabled" },
		"discountRate": { type: "rate", default: 0.0, label: "Discount Rate" },
		"taxedPrice": { type: "number", label: "Selling Price (incl. tax)" },
		"hasImage": { type: "boolean", default: false },
	},

	postChange: function(oldPrd, prd, linkedRecords) {
		if (typeof prd.priceSell != "number" && typeof prd.taxedPrice != "number") {
			throw new InvalidFieldException(InvalidFieldConstraints.CSTR_FLOAT,
					this.modelName, "taxedPrice", this.modelId(prd), prd.taxedPrice);
		}
		let linkRecs = linkedRecords.find(l => l.modelDef.modelName == this.fields["tax"].modelName);
		if (prd.tax == null) {
			throw new InvalidFieldException(InvalidFieldConstraints.CSTR_NOT_NULL,
					this.modelName, "tax", this.modelId(prd), prd.tax);
		}
		let tax = linkRecs.records.find(t => t.id == prd.tax);
		if (tax == null) {
			throw new InvalidFieldException(InvalidFieldConstraints.CSTR_ASSOCIATION_NOT_FOUND,
					this.modelName, "tax", this.modelId(prd), prd.tax);
		}
		if (oldPrd == null) {
			// New record, check that priceSell or taxedPrice is set and compute the other
			if (typeof prd.priceSell == "number") {
				// Compute taxedPrice from priceSell, even if taxed price is defined
				prd.taxedPrice = Number.parseFloat(Number(prd.priceSell * (1.0 + tax.rate)).toFixed(2));
			} else if (typeof prd.taxedPrice == "number") {
				// Otherwise compute priceSell from taxedPrice
				prd.priceSell = Number.parseFloat(Number(prd.taxedPrice / (1.0 + tax.rate)).toFixed(5));
			}
		} else {
			// Edited record
			let taxChanged = oldPrd.tax != prd.tax;
			if (oldPrd.priceSell != prd.priceSell) {
				// Recompute taxedPrice from the explicitely modified price
				prd.taxedPrice = Number.parseFloat(Number(prd.priceSell * (1.0 + tax.rate)).toFixed(2));
			} else if (oldPrd.taxedPrice != prd.taxedPrice || taxChanged) {
				// Recompute priceSell from the explicitely modified taxed price
				// or unchanged prices but changed tax rate
				prd.priceSell = Number((prd.taxedPrice / (1.0 + tax.rate)).toFixed(5));
			}
		}
	},
	refField: "reference",
	lookupFields: ["reference", "label"],
}

function Product_default(categoryId, taxId) {
	return {
		"label": "",
		"hasImage": false,
		"category": categoryId,
		"dispOrder": 0,
		"visible": true,
		"prepay": false,
		"priceSell": 0.0,
		"tax": taxId,
		"priceBuy": "",
		"scaled": false,
		"reference": "",
		"barcode": "",
		"scaleType": 0,
		"scaleValue": 1.0,
		"discountEnabled": false,
		"discountRate": 0.0,
		"composition": false,
		"taxedPrice": 0.0
	};
}

function Composition_default(categoryId, taxId) {
	let prd = Product_default(categoryId, taxId);
	prd.composition = true;
	prd.compositionGroups = [];
	return prd;
}

function CompositionGroup_default() {
	return {
		"label": "",
		"dispOrder": 0,
		"compositionProducts": [],
	}
}

function CompositionProduct_default(product) {
	return {
		"dispOrder": product.dispOrder,
		"product": product.id,
	}
}
function TariffArea_default() {
	return {
		"reference": "",
		"label": "",
		"dispOrder": 0,
		"prices": [],
	};
}

function TariffArea_price(product) {
	return {
		"product": product.id,
		"price": null,
		"tax": null,
	}
}

let TariffAreaDef = {
	modelName: "tariffArea",
	modelId: function(ta) {
		if (ta && ta.id) {
			return ta.id.toString();
		}
		return null;
	},
	fields: {
		"reference": { type: "string", default: "" },
		"label": { type: "string", default: "" },
		"dispOrder": { type: "number", default: 0 },
	},
	refField: "reference",
	lookupFields: ["reference", "label"],
}
let CustomerDef = {
	modelName: "customer",
	modelId: function(cust) {
		if (cust && cust.id) {
			return cust.id.toString();
		}
		return null;
	},
	fields: {
		"dispName": { type: "string", default: "", label: "Display Name" },
		"card": { type: "string", default: "", label: "Card" },
		"firstName": { type: "string", default: "", label: "First Name" },
		"lastName": { type: "string", default: "", label: "Last Name" },
		"email": { type: "string", default: "", label: "Email" },
		"phone1": { type: "string", default: "", label: "Phone" },
		"phone2": { type: "string", default: "", label: "Alternate Phone" },
		"fax": { type: "string", default: "", label: "Fax" },
		"addr1": { type: "string", default: "", label: "Address" },
		"addr2": { type: "string", default: "", label: "Address 2" },
		"zipCode": { type: "string", default: "", label: "Postal Code" },
		"city": { type: "string", default: "", label: "City" },
		"region": { type: "string", default: "", label: "Region" },
		"country": { type: "string", default: "", label: "Country" },
		"tax": { type: "record", modelName: "tax", default: null, label: "VAT" },
		"discountProfile": { type: "record", modelName: "discountProfile", default: null, label: "Discount Profile" },
		"tariffArea": { type: "record", modelName: "tariffArea", default: null, label: "Pricing Zone" },
		"balance": { type: "number", default: 0.0 },
		"maxDebt": { type: "number", default: 0.0, label: "Max Credit" },
		"note": { type: "text", default: "", label: "Notes" },
		"visible": { type: "boolean", default: true, label: "Active" },
		"expireDate": { type: "date", default: null, label: "Expiration Date" },
		"hasImage": { type: "boolean", default: false },
	},

	refField: "dispName",
	lookupFields: ["dispName", "email", "phone1", "phone2"],

	// Custom contact field name functions
	contactFieldList: ["firstName", "lastName", "email", "phone1", "phone2", "fax", "addr1", "addr2", "zipCode", "city", "region", "country"],
	contactFields: function() {
		return {
			firstName: { label: "Label.Customer.FirstName", value: "", default: "First Name" },
			lastName: { label: "Label.Customer.LastName", value: "", default: "Last Name" },
			email: { label: "Label.Customer.Email", value: "", default: "Email" },
			phone1: { label: "Label.Customer.Phone", value: "", default: "Phone" },
			phone2: { label: "Label.Customer.Phone2", value: "", default: "Alternate Phone" },
			fax: { label: "Label.Customer.Fax", value: "", default: "Fax" },
			addr1: { label: "Label.Customer.Addr", value: "", default: "Address" },
			addr2: { label: "Label.Customer.Addr2", value: "", default: "Address 2" },
			zipCode: { label: "Label.Customer.ZipCode", value: "", default: "Postal Code" },
			city: { label: "Label.Customer.City", value: "", default: "City" },
			region: { label: "Label.Customer.Region", value: "", default: "Region" },
			country: { label: "Label.Customer.Country", value: "", default: "Country" },
		};

	},
	loadCustomizedContactFields: function(callback) {
		storage_open(function(event) {
			storage_get("options", OPTION_CUSTOMER_FIELDS, function(opt) {
				let fieldMapping = {};
				if (typeof(opt) != "undefined") {
					try {
						fieldMapping = JSON.parse(opt.content);
						if (fieldMapping == null || (typeof fieldMapping != "object")) {
							fieldMapping = {};
						}
					} catch (e) {
						console.warn("Could not parse customer's contact fields customisation", e);
					}
				}
				let contactFields = CustomerDef.contactFields();
				CustomerDef.contactFieldList.forEach(f => {
					let labelCode = contactFields[f].label;
					if (labelCode in fieldMapping && fieldMapping[labelCode] != null && fieldMapping[labelCode] != "") {
						contactFields[f].value = fieldMapping[labelCode];
					}
				});
				callback(contactFields);
			});
		});
	}
}
function Floor_default() {
	return {
		"label": "New Room",
		"dispOrder": 0,
		"places": [],
	};
}

function Place_default() {
	return {
		"label": "Nvlle",
		"x": 30,
		"y": 30,
	};
}
function PaymentMode_default() {
	return {
		"reference": "",
		"label": "",
		"backLabel": "",
		"type": 0,
		"visible": true,
		"dispOrder": 0,
		"values": [],
		"returns": [],
	};
}

function PaymentModeValue_default(paymentMode) {
	let val = {
		"value": 1,
		"hasImage": false,
	};
	if (paymentMode && paymentMode.id) {
		val.paymentMode = paymentMode.id;
	}
	return val;
}

function PaymentModeReturn_default(paymentMode) {
	let ret = {
		"minAmount": 0,
		"returnMode": null,
	};
	if (paymentMode && paymentMode.id) {
		ret.paymentMode = paymentMode.id;
	}
	return ret;
}
function User_default() {
	return {
		"name": "",
		"password": null,
		"active": true,
		"hasImage": false,
		"card": null,
		"role": null,
	};
}
function Role_default() {
	return {
		"name": "",
		"permissions": [],
	};
}
function CashRegister_default() {
	return {
		"reference": null,
		"label": null,
		"nextTicketId": 1,
		"nextSessionId": 1,
	};
}
const Resource_TYPE_TEXT = 0;
const Resource_TYPE_IMAGE = 1;
const Resource_TYPE_BIN = 2;

function Resource_default() {
	return {
		"label": "",
		"type": Resource_TYPE_TEXT,
		"content": null,
	};
}
function DiscountProfile_default() {
	return {
		"label": "",
		"rate": 0.0,
	};
}

let DiscountProfileDef = {
	modelName: "discountProfile",
	modelId: function(dp) {
		if (dp && dp.id) {
			return dp.id.toString();
		}
		return null;
	},
	fields: {
		"label": { type: "string", default: "", label: "Description" },
		"rate": { type: "rate", default: 0.0, label: "Discount" },
	},

	refField: "label",
	lookupFields: ["label"],
}
function Currency_default() {
	return {
		"reference": "",
		"label": "",
		"symbol": "",
		"decimalSeparator": "",
		"thousandsSeparator": "",
		"format": "#,##0.00$",
		"rate": 1.0,
		"main": false,
		"visible": true
	};
}
// List of tag/label sheet formats. Units are in mm for position and margins.
const MM_TO_PT = 2.8346456693
var productTagFormats = [
	{
		"dispName": "A4 50x20 x56",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 5, "h": 5},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 20, "colSize": 50, "rowNum": 14, "colNum": 4 },
		"label": { "x": 0, "y": 0, "width": 48, "dots": 7, "frame": 0},
		"barcode": { "x": 0, "y": 7, "width": 24, "height": 9, "angle": 0,
			"text": { "x": 0, "y": 16, "height": 4, "dots": 6, "frame": 0}
		},
		"price": { "x": 24, "y": 7, "width": 24, "height": 6, "dots": 14, "frame": "LTR"},
		"unit": { "x": 24, "y": 13, "width": 24, "height": 3, "dots": 6, "frame": "LBR"},
		"reference": { "x": 24, "y": 16, "width": 24, "dots": 6, "frame": 0}
	},
	{
		"dispName": "A5 20x8 51",
		"paper": { "size": "A5", "orientation": "portrait"},
		"margin": { "v": 7.1, "h": 2.4},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 8, "colSize": 20, "rowNum": 17, "colNum": 7 },
		"label": { "x": -0.1, "y": 0, "width": 20, "dots": 4, "frame": 0},
		"barcode": { "x": -0.1, "y": 3, "width": 19, "height": 3, "angle": 0,
			"text": { "x": 0, "y": 6, "height": 2, "dots": 4, "frame": 0}
		},
		"price": { "x": 0.5, "y": 0.5, "width": 19, "height": 4, "dots": 10, "frame": "LTR"},
		"unit": { "x": 0.5, "y": 4, "width": 19, "height": 2, "dots": 4, "frame": "LBR"},
		"reference": { "x": -0.1, "y": 6, "width": 10, "dots": 3, "frame": 0}
	},
	{
		"dispName": "Print 100631 51x33.8 32",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 13.5, "h": 4},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 33.8, "colSize": 51, "rowNum": 8, "colNum": 4 },
		"label": { "x": 2, "y": 0, "width": 47, "dots": 9, "frame": 0},
		"barcode": { "x": 2, "y": 13, "width": 23, "height": 14, "angle": 0,
			"text": { "x": 2, "y": 27, "height": 6, "dots": 8, "frame": 0}
		},
		"price": { "x": 25, "y": 13, "width": 24, "height": 10, "dots": 14, "frame": "LTR"},
		"unit": { "x": 25, "y": 23, "width": 24, "height": 4, "dots": 8, "frame": "LBR"},
		"reference": { "x": 25, "y": 27, "width": 24, "dots": 8, "frame": 0}
	},
	{
		"dispName": "Print 100974 20x8 51",
		"paper": { "size": "A5", "orientation": "portrait"},
		"margin": { "v": 7.1, "h": 2.4},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 8, "colSize": 20, "rowNum": 7, "colNum": 17 },
		"label": { "x": -0.1, "y": 0, "width": 20, "dots": 4, "frame": 0},
		"barcode": { "x": -0.1, "y": 2, "width": 20, "height": 4, "angle": 0,
			"text": { "x": 0, "y": 6, "height": 4, "dots": 4, "frame": 0}
		},
		"price": { "x": 0.5, "y": 0.5, "width": 19, "height": 5, "dots": 11, "frame": "LTR"},
		"unit": { "x": 0.5, "y": 4, "width": 19, "height": 2, "dots": 3, "frame": "LBR"},
		"reference": { "x": -0.1, "y": 6, "width": 10, "dots": 3, "frame": 0}
	},
	{
		"dispName": "Print 118990 38x21.2 65",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 10.5, "h": 10.5},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 21.2, "colSize": 38, "rowNum": 13, "colNum": 5 },
		"label": { "x": 1, "y": 1, "width": 36, "dots": 9, "frame": 0},
		"barcode": { "x": 1, "y": 8, "width": 17, "height": 10, "angle": 0,
			"text": { "x": 1, "y": 17.5, "height": 4, "dots": 6, "frame": 0}
		},
		"price": { "x": 19, "y": 8, "width": 17, "height": 6, "dots": 10, "frame": "LTR"},
		"unit": { "x": 19, "y": 14, "width": 17, "height": 4, "dots": 7, "frame": "LBR"},
		"reference": { "x": 19, "y": 17.5, "width": 17, "dots": 6, "frame": 0}
	},
	{
		"dispName": "Print 118991 48.5x25.4 40",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 21.5, "h": 8},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 25.4, "colSize": 48.5, "rowNum": 10, "colNum": 4 },
		"label": { "x": 2, "y": 0, "width": 44.5, "dots": 10, "frame": 0},
		"barcode": { "x": 2, "y": 10, "width": 22, "height": 10.4, "angle": 0,
			"text": { "x": 2, "y": 20.4, "height": 5, "dots": 7, "frame": 0}
		},
		"price": { "x": 24, "y": 10, "width": 22.5, "height": 7.4, "dots": 13, "frame": "LTR"},
		"unit": { "x": 24, "y": 17.4, "width": 22.5, "height": 3, "dots": 7, "frame": "LBR"},
		"reference": { "x": 24, "y": 20.4, "width": 22.5, "dots": 7, "frame": 0}
	},
	{
		"dispName": "Print 118992 52.5x21.2 56",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 0, "h": 0},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 21.2, "colSize": 52.5, "rowNum": 14, "colNum": 4 },
		"label": { "x": 2, "y": 1, "width": 48.5, "dots": 8, "frame": 0},
		"barcode": { "x": 2, "y": 7.5, "width": 24, "height": 10, "angle": 0,
			"text": { "x": 2, "y": 17.5, "height": 4, "dots": 6, "frame": 0}
		},
		"price": { "x": 26, "y": 7.5, "width": 24, "height": 7, "dots": 13, "frame": "LTR"},
		"unit": { "x": 26, "y": 14.5, "width": 24, "height": 3, "dots": 7, "frame": "LBR"},
		"reference": { "x": 26, "y": 17.5, "width": 24, "dots": 6, "frame": 0}
	},
	{
		"dispName": "Print 118995 70x33.8 24",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 13.3, "h": 0},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 33.8, "colSize": 70, "rowNum": 8, "colNum": 3 },
		"label": { "x": 2, "y": 0, "width": 66, "dots": 10, "frame": 0},
		"barcode": { "x": 2, "y": 12, "width": 33, "height": 15, "angle": 0,
			"text": { "x": 2, "y": 27, "height": 5, "dots": 7, "frame": 0}
		},
		"price": { "x": 35, "y": 12, "width": 33, "height": 10, "dots": 20, "frame": "LTR"},
		"unit": { "x": 35, "y": 22, "width": 33, "height": 5, "dots": 7, "frame": "LBR"},
		"reference": { "x": 35, "y": 27, "width": 33, "dots": 7, "frame": 0}
	},
	{
		"dispName": "Print 119007 70x25 33",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 10.5, "h": 0},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 25, "colSize": 70, "rowNum": 11, "colNum": 3 },
		"label": { "x": 2, "y": 0, "width": 66, "dots": 10, "frame": 0},
		"barcode": { "x": 2, "y": 10, "width": 32, "height": 11, "angle": 0,
			"text": { "x": 2, "y": 21, "height": 4, "dots": 7, "frame": 0}
		},
		"price": { "x": 34, "y": 10, "width": 34, "height": 7.5, "dots": 18, "frame": "LTR"},
		"unit": { "x": 34, "y": 17.5, "width": 34, "height": 3.5, "dots": 7, "frame": "LBR"},
		"reference": { "x": 34, "y": 21, "width": 34, "dots": 7, "frame": 0}
	},
	{
		"dispName": "Print 119601 22x16 153",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 13, "h": 0},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 16, "colSize": 22, "rowNum": 17, "colNum": 9 },
		"label": { "x": -0.1, "y": 0, "width": 21, "dots": 4, "frame": 0},
		"barcode": { "x": 1, "y": 10.4, "width": 20, "height": 3.3, "angle": 0,
			"text": { "x": 1, "y": 13.3, "height": 3, "dots": 6, "frame": 0}
		},
		"price": { "x": 1, "y": 1, "width": 20, "height": 7, "dots": 12, "frame": "LTR"},
		"unit": { "x": 1, "y": 7.4, "width": 20, "height": 3, "dots": 7, "frame": "LBR"},
		"reference": { "x": -0.1, "y": 14, "width": 10, "dots": 7, "frame": 0}
	},
	{
		"dispName": "Print 119602 50x20 56",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 13, "h": 5},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 20, "colSize": 50, "rowNum": 14, "colNum": 4 },
		"label": { "x": 2, "y": 0, "width": 46, "dots": 8, "frame": 0},
		"barcode": { "x": 2, "y": 8, "width": 23, "height": 8, "angle": 0,
			"text": { "x": 2, "y": 16, "height": 4, "dots": 7, "frame": 0}
		},
		"price": { "x": 25, "y": 8, "width": 23, "height": 6, "dots": 13, "frame": "LTR"},
		"unit": { "x": 25, "y": 13, "width": 23, "height": 3, "dots": 6, "frame": "LBR"},
		"reference": { "x": 25, "y": 16, "width": 23, "dots": 7, "frame": 0}
	},
	{
		"dispName": "Print 119603 50x25 44",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 13, "h": 5},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 25, "colSize": 50, "rowNum": 11, "colNum": 4 },
		"label": { "x": 2, "y": 0, "width": 46, "dots": 10, "frame": 0},
		"barcode": { "x": 2, "y": 21, "width": 23, "height": 11, "angle": 0,
			"text": { "x": 2, "y": 21, "height": 7, "dots": 13, "frame": 0}
		},
		"price": { "x": 25, "y": 10, "width": 23, "height": 7, "dots": 13, "frame": "LTR"},
		"unit": { "x": 25, "y": 17, "width": 23, "height": 4, "dots": 7, "frame": "LBR"},
		"reference": { "x": 25, "y": 17, "width": 23, "dots": 7, "frame": 0}
	},
	{
		"dispName": "Print 130142 48.5x25.4 44",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 9, "h": 8},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 25.4, "colSize": 48.5, "rowNum": 11, "colNum": 4 },
		"label": { "x": 2, "y": 0, "width": 44, "dots": 10, "frame": 0},
		"barcode": { "x": 2, "y": 10, "width": 22, "height": 11.4, "angle": 0,
			"text": { "x": 2, "y": 21.4, "height": 4, "dots": 7, "frame": 0}
		},
		"price": { "x": 24, "y": 10, "width": 23, "height": 7.4, "dots": 13, "frame": "LTR"},
		"unit": { "x": 24, "y": 17.4, "width": 23, "height": 4, "dots": 7, "frame": "LBR"},
		"reference": { "x": 24, "y": 21.4, "width": 23, "dots": 7, "frame": 0}
	},
	{
		"dispName": "Apli 10387 67x25.4 30",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 22.3, "h": 4.5},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 25.4, "colSize": 67, "rowNum": 10, "colNum": 3 },
		"label": { "x": 2, "y": 0, "width": 63, "dots": 10, "frame": 0},
		"barcode": { "x": 2, "y": 10, "width": 31, "height": 10.5, "angle": 0,
			"text": { "x": 2, "y": 20.5, "height": 5, "dots": 7, "frame": 0}
		},
		"price": { "x": 33, "y": 10, "width": 32, "height": 7.4, "dots": 18, "frame": "LTR"},
		"unit": { "x": 33, "y": 17.4, "width": 32, "height": 3, "dots": 7, "frame": "LBR"},
		"reference": { "x": 33, "y": 20.4, "width": 32, "dots": 7, "frame": 0}
	},
	{
		"dispName": "Alpi 13050 105x40 14",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 9, "h": 0},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 40, "colSize": 105, "rowNum": 7, "colNum": 2 },
		"label": { "x": 2, "y": 0, "width": 101, "dots": 14, "frame": 0},
		"barcode": { "x": 2, "y": 15, "width": 50, "height": 20, "angle": 0,
			"text": { "x": 2, "y": 35, "height": 5, "dots": 10, "frame": 0}
		},
		"price": { "x": 52, "y": 15, "width": 51, "height": 15, "dots": 30, "frame": "LTR"},
		"unit": { "x": 52, "y": 30, "width": 51, "height": 5, "dots": 11, "frame": "LBR"},
		"reference": { "x": 52, "y": 35, "width": 51, "dots": 10, "frame": 0}
	},
	{
		"dispName": "Alpi 13051 65x33 27",
		"paper": { "size": "A4", "orientation": "portrait"},
		"margin": { "v": 0, "h": 8},
		"padding": { "v": 0, "h": 0},
		"table": { "rowSize": 33, "colSize": 65, "rowNum": 9, "colNum": 3 },
		"label": { "x": 2, "y": 0, "width": 61, "dots": 10, "frame": 0},
		"barcode": { "x": 2, "y": 15, "width": 30, "height": 13, "angle": 0,
			"text": { "x": 2, "y": 28, "height": 5, "dots": 7, "frame": 0}
		},
		"price": { "x": 32, "y": 15, "width": 31, "height": 10, "dots": 18, "frame": "LTR"},
		"unit": { "x": 32, "y": 25, "width": 31, "height": 3, "dots": 7, "frame": "LBR"},
		"reference": { "x": 32, "y": 28, "width": 31, "dots": 7, "frame": 0}
	},
];
function Tax_default() {
	return {
		"label": "",
		"rate": 0,
	};
}

let TaxDef = {
	modelName: "tax",
	modelId: function(tax) {
		if (tax && tax.id) {
			return tax.id.toString();
		}
		return null;
	},
	fields: {
		"label": { type: "string", default: "" },
		"rate": { type: "number", default: 0.0 },
	},
	refField: "label",
	lookupFields: ["label"],
}
/** @deprecated */
const OPTION_DYSLEXICMODE = Option_prefName("preferDyslexicMode");
const OPTION_PREFERENCES = Option_prefName("preferences");
const OPTION_ACCOUNTING_CONFIG = Option_prefName("accountingConfig");
const OPTION_CUSTOMER_FIELDS = "customer.customFields"; // No jsadmin prefix

function Option(name, value) {
	return {
		"name": name,
		"content": String(value),
		"system": false
	};
}

function Option_prefName(name) {
	let prefix = "jsadmin.";
	if (location.protocol == "file:") {
		prefix += "local.";
	} else {
		prefix += location.host + "/" + location.pathname + ".";
	}
	return prefix + name;
}
function _srvcall_send(target, method, data, callback) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState === XMLHttpRequest.DONE) {
			// Update the token.
			var token = request.getResponseHeader('Token');
			if (token != null && token != "") {
				login_updateToken(token);
			} else {
				login_revokeToken();
			}
			callback(request, request.status, request.responseText);
		}
	};
	let dataSend = null;
	let dataType = null;
	if (data instanceof File) {
		dataType = "application/octet-stream";
	} else if (data != null) {
		dataType = "application/json";
		dataSend = JSON.stringify(data);
	}
	switch (method) {
	case "PUT":
	case "POST":
	case "PATCH":
	case "DELETE":
		request.open(method.toUpperCase(), login_getHostUrl() + target);
		break;
	case "GET":
	default:
		request.open("GET", login_getHostUrl() + target);
		break;
	}
	if (dataType != null) {
		request.setRequestHeader("Content-type", dataType);
	}
	var token = login_getToken();
	if (token != null) {
		request.setRequestHeader("Token", token);
	}
	try {
		if (data instanceof File) {
			let reader = new FileReader();
			reader.onload = function() {
				request.send(reader.result);
			}
			reader.readAsArrayBuffer(data)
		} else {
			request.send(dataSend);
		}
	} catch (error) {
		callback(request, request.status, error);
	}
}

function srvcall_get(target, callback) {
	_srvcall_send(target, "GET", null, callback);
}
function srvcall_post(target, data, callback) {
	_srvcall_send(target, "POST", data, callback);
}
function srvcall_put(target, data, callback) {
	_srvcall_send(target, "PUT", data, callback);
}
function srvcall_patch(target, data, callback) {
	_srvcall_send(target, "PATCH", data, callback);
}
function srvcall_delete(target, callback) {
	_srvcall_send(target, "DELETE", null, callback);
}

function srvcall_multicall(calls, callback, progressCallback) {
	if (arguments.length < 3) {
		progressCallback = null;
	}
	let results = {};
	let finished = [];
	let callbackCalled = false;
	for (let i = 0; i < calls.length; i++) {
		results[calls[i].id] = {request: null, status: null, response: null};
		finished.push(false);
	}
	let callCallback = function(id, index) {
		return function(request, status, response) {
				if (progressCallback != null) {
					progressCallback();
				}
				let result = results[id];
				result.request = request;
				result.status = status;
				result.response = response;
				finished[index] = true;
				for (let k = 0; k < finished.length; k++) {
					if (finished[k] == false) {
						return;
					}
				}
				if (callbackCalled == false) {
					callbackCalled = true;
					callback(results);
				}
		};
	}
	for (let i = 0; i < calls.length; i++) {
		let singleCall = calls[i];
		switch (singleCall.method.toUpperCase()) {
			case "GET":
				srvcall_get(singleCall.target, callCallback(singleCall.id, i));
				break;
			case "POST":
				srvcall_post(singleCall.target, singleCall.data, callCallback(singleCall.id, i));
				break;
			case "PUT":
				srvcall_put(singleCall.target, singleCall.data, callCallback(singleCall.id, i));
				break;
			case "PATCH":
				srvcall_patch(singleCall.target, singleCall.data, callCallback(singleCall.id, i));
				break;
			case "DELETE":
				srvcall_delete(singleCall.target, callCallback(singleCall.id, i));
				break;
			default:
				console.error("Unkown method call " + singleCall.method);
		}
	}
}

function srvcall_imageUrl(modelClass, model) {
	if (arguments.length == 2 && model.hasImage) {
		return login_getHostUrl() + "/api/image/" + modelClass + "/" + model.id + "?Token=" + login_getToken();
	} else {
		return login_getHostUrl() + "/api/image/" + modelClass + "/default?Token=" + login_getToken();
	}
}

/** Send a request to write/update/delete an image from a vue-input-image component.
 * @param modelName The model name that is put in the url, for example "category".
 * @param record The record to update it's image. It must have hasImage set to it's previous state.
 * I.e. false if a new image is set, true if the image is updated or deleted.
 * @param modelId The id that is put in the url. Generaly record.id but subrecords have a different modelId.
 * @param newImage An object retreived from a vue-input-image component.
 * @param callback The function called after the api call, with the untouched record as parameter.
 */
function srvcall_imageSave(modelName, record, modelId, newImage, callback) {
	let hadImage = record.hasImage;
	if (hadImage && newImage && newImage.delete) {
		srvcall_delete("api/image/" + modelName + "/" + encodeURIComponent(modelId), function(request, status, response) {
			callback(record);
		});
	} else if (newImage && newImage.file) {
		if (hadImage) {
			srvcall_patch("api/image/" + modelName + "/" + encodeURIComponent(modelId), newImage.file, function(request, status, response) {
				callback(record);
			});
		} else {
			srvcall_put("api/image/" + modelName + "/" + encodeURIComponent(modelId), newImage.file, function(request, status, response) {
				callback(record);
			});
		}
	} else {
		callback(record);
	}
}

/** Helper class to get the default behaviour for faulty responses.
 * @return False if the response is ok to be used (it has not been catched).
 * True if the response has been catched and has already been proceeded. */
function srvcall_callbackCatch(request, status, response, pendingOperation) {
	switch (status) {
	case 200:
	case 400:
		return false;
		break;
	case 403:
		login_setPendingOperation(pendingOperation);
		login_show();
		gui_showMessage("The session has expired. Please resend your credentials to confirm the current operation.");
		return true;
	default:
		login_show();
		gui_showError("Server error: " + status + " " + response);
		return true;
	}
}

var login_set = function(https, server, user) {
	localStorage.setItem("user", user);
	localStorage.setItem("server", server);
	if (https) { localStorage.setItem("https", "1"); }
	else { localStorage.setItem("https", "0"); }
}

var _login_remoteLogout = function() {
	sessionStorage.removeItem("token");
	// Close the local database and restart
	appData.db.close();
	appData.db = null;
	start();
}

var login_logout = function() {
	sessionStorage.removeItem("token");
	localStorage.setItem("logout", "1");
	localStorage.removeItem("logout");
	localStorage.removeItem("font");
	gui_setFont("sans");
	storage_setSessionOption("font", null);
	// Drop local database and restart
	storage_drop(function() {
		appData.db = null;
		start();
	}, function() {
		console.error("Could not drop local database");
	});
}

var login_getUser = function() {
	return localStorage.getItem("user");
}

var login_getHttps = function() {
	if (!login_getServer()) {
		return true; // Default
	}
	return localStorage.getItem("https") == "1";
}

var login_getServer = function() {
	return localStorage.getItem("server");
}

var login_getHostUrl = function() {
	var server = login_getServer();
	var https = login_getHttps();
	if (!server.startsWith("http")) {
		if (https) { server = "https://" + server; }
		else { server = "http://" + server; }
	}
	if (!server.endsWith("/")) {
		server += "/";
	}
	return server;
}

var login_getToken = function() {
	return sessionStorage.getItem("token");
}

var login_updateToken = function(token) {
	if (token != null) {
		sessionStorage.setItem("token", token);
		localStorage.setItem("shareToken", "1" + token); // Share with other tabs
	} else {
		vue.login.loggedIn = false;
		sessionStorage.removeItem("token");
		localStorage.setItem("shareToken", "0");
	}
	localStorage.removeItem("shareToken");
}

var login_revokeToken = function() {
	login_updateToken(null);
}

var login_sendLogin = function() {
	// Register login data
	var server = vue.login.server;
	var https = vue.login.https;
	if (!server.startsWith("http")) {
		if (https) { server = "https://" + server; }
		else { server = "http://" + server; }
	}
	var user = vue.login.user;
	var password = vue.login.password;
	login_set(https, server, user);
	// Check connection and version
	srvcall_post("api/login", {"user": user, "password": password}, login_loginCallback);
	gui_showLoading();
}

function login_loginCallback(request, status, response) {
	gui_hideLoading();
	gui_closeMessageBox();
	switch (status) {
	case 200:
		if (response != "null") {
			// Register data
			var server = vue.login.server;
			var https = vue.login.https;
			var user = vue.login.user;
			login_set(https, server, user);
			// Hide login screen and let content be shown
			vue.login.loggedIn = true;
			// Next operation
			if (_login_pendingOperation == null) {
				start();
			} else {
				let nextOperation = _login_pendingOperation;
				_login_pendingOperation = null;
				nextOperation();
			}
			break;
		}
		// else nobreak
	case 403:
		gui_showMessage("Invalid username or password.");
		break;
	case 0:
		if (response == "") {
			gui_showError("Connection refused. Is the server " + login_getHostUrl() + " correct?");
			break;
		}
		// else nobreak
	default:
		gui_showError("The server is unavailable (" + status + " : " + response + ").");
		break;
	}
}

/** Set the vue app data to show the loading screen. */
var login_show = function() {
	vue.login.loggedIn = false;
	vue.login.server = login_getServer();
	vue.login.user = login_getUser();
	vue.login.https = login_getHttps();
	vue.login.password = "";
	gui_hideLoading();
}

var _login_pendingOperation = null;
var login_setPendingOperation = function(functionVar) {
	_login_pendingOperation = functionVar;
}

/* Share the sessionStorage (token) operations between tabs */
window.addEventListener("storage", function(event) {
	let origin = event.url.split("?")[0];
	let here = window.location.href.split("?")[0];
	if (origin != here) {
		return;
	}
	switch (event.key) {
		case "requestSessionStorage":
			if (event.newValue == "hey!") {
				let token = sessionStorage.getItem("token");
				if (token != null) {
					localStorage.setItem("shareSession", token);
					localStorage.removeItem("shareSession");
				}
			}
			break;
		case "shareSession":
			if (event.newValue != null && sessionStorage.length == 0) {
				let token = event.newValue;
				sessionStorage.setItem("token", token);
			}
			break;
		case "shareToken":
			if (event.newValue != null) {
				let code = event.newValue.charAt(0);
				if (code == "1") {
					sessionStorage.setItem("token", event.newValue.substring(1));
				} else {
					vue.login.loggedIn = false;
					sessionStorage.removeItem("token");
				}
			}
			break;
		case "logout":
			if (event.newValue != null) {
				vue.login.loggedIn = false;
				sessionStorage.removeItem("token");
			}
			break;
	}
});
// Request session from other tabs
if (sessionStorage.length == 0) {
	localStorage.setItem("requestSessionStorage", "hey!");
	localStorage.removeItem("requestSessionStorage");
}
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
class CsvParser {
	#recordDef;
	#columnMappingDef;
	#existingRecords;
	#linkedRecords;
	#columnMapping;
	#columnName;
	#unknownColumns;
	#errors;
	#warnings;
	/**
	 * Create a parser.
	 * @param recordDef A record definition object.
	 * @param existingRecords The list of existing records to check for editions.
	 * @param linkedRecords A list of {"modelDef": def, "records": list of records} to check
	 * for fields that references an other record.
	 */
	constructor(recordDef, existingRecords, linkedRecords) {
		this.#recordDef = recordDef;
		this.#existingRecords = existingRecords;
		this.#linkedRecords = linkedRecords;
	}
	/**
	 * Parse the content of a csv file and return a CsvImportResult.
	 * @param content The raw text content, with headers, passed to CSV.
	 * @return A fully set CsvImportResult.
	 */
	parseContent(content) {
		// Get csv content, CSV will return an object for each line with header as key.
		let csv = new CSV(content, {header: true, cast: false});
		let rawData = csv.parse();
		if (rawData.length == 0) {
			return {new: [], edited: [], unchanged: [], unknownColumns: [], errors: []};
		}
		this.#buildMapping(rawData[0]);
		let newRecords = [];
		let editedRecords = [];
		let editedValues = [];
		let unchangedRecords = [];
		this.#errors = [];
		this.#warnings = [];
		// Check for the reference field in content
		if (!((this.#recordDef.refField) in this.#columnName)) {
			let refFieldName = this.#recordDef.refField;
			if ((refFieldName in this.#recordDef.fields) && ("label" in this.#recordDef.fields[refFieldName])) {
				refFieldName = this.#recordDef.fields[refFieldName].label;
			}
			this.#errors.push({line: 1, column: refFieldName, exception: new MissingReferenceColumnException(this.#recordDef.modelName, this.#recordDef.refField)});
			return new CsvImportResult(newRecords, editedRecords, editedValues, unchangedRecords,
				this.#unknownColumns, this.#errors, this.#warnings);
		}
		// Read lines
		let recFacto = new RecordFactory(this.#recordDef);
		for (let i = 0; i < rawData.length; i++) {
			let lineVals = this.#readLine(i, rawData[i]);
			if (lineVals == null) {
				continue;
			}
			let refField = this.#recordDef.refField;
			let existingRec = this.#existingRecords.find(r => r[refField] == lineVals[refField]);
			let rec = null;
			if (typeof existingRec == "undefined") {
				rec = recFacto.create(lineVals, this.#linkedRecords);
				if (!recFacto.hasErrors()) {
					newRecords.push(rec);
				} else {
					recFacto.getErrors().forEach(exception => {
						this.#errors.push({line: i + 2, column: this.#columnName[exception.field], exception: exception});
					}, this);
				}
			} else {
				if (!recFacto.merge(existingRec, lineVals, this.#linkedRecords)) {
					recFacto.getErrors().forEach(exception => {
						this.#errors.push({line: i + 2, column: this.#columnName[exception.field], exception: exception});
					}, this);
					continue;
				}
				rec = existingRec;
				if (recFacto.hasChanges()) {
					editedRecords.push(rec);
					let editVals = {};
					recFacto.getChanges().forEach(key => editVals[key] = true)
					editedValues.push(editVals);
				} else {
					unchangedRecords.push(rec);
				}
			}
		}
		return new CsvImportResult(newRecords, editedRecords, editedValues, unchangedRecords,
				this.#unknownColumns, this.#errors, this.#warnings);
	}
	/** Read the first line to map column headers to fields. */
	#buildMapping(line) {
		this.#columnMapping = {};
		this.#columnName = {};
		this.#unknownColumns = [];
		for (let key in line) {
			let columnKey = key.toLowerCase();
			let found = false;
			for (let fieldKey in this.#recordDef.fields) {
				let field = this.#recordDef.fields[fieldKey];
				if (columnKey == fieldKey.toLowerCase() || ("label" in field && columnKey == field.label.toLowerCase())) {
					this.#columnMapping[key] = fieldKey;
					this.#columnName[fieldKey] = key;
					found = true;
					break;
				}
			}
			if (!found) {
				this.#unknownColumns.push(key);
			}
		}
	}
	/**
	 * Read the line and return an dictionary with the parsed values.
	 * Warnings and errors are added during the process.
	 * @param index Index of the line, to list errors and warnings.
	 * @param lineData The dictionary of header => value of a line.
	 * @return A dictionary of fieldName => parsed value of the record.
	 */
	#readLine(index, lineData) {
		let ret = {};
		let noError = true;
		for (let key in this.#columnMapping) {
			let fieldName = this.#columnMapping[key];
			try {
				let val = this.#parseValue(fieldName, key, lineData[key], index);
				if (typeof val !== "undefined") {
					ret[fieldName] = val;
				}
			} catch (e) {
				this.#errors.push({line: index + 2, column: key, exception: e});
				noError = false;
			}
		}
		if (noError) {
			return ret;
		} else {
			return null;
		}
	}
	/**
	 * Convert a single cell to a record value.
	 * @param fieldName The name of the field from a ModelDef.
	 * @param key The header of the column to push errors and warnings.
	 * @param value The raw csv value to parse.
	 * @param lineNum The number of the line to push errors and warnings.
	 * @return The parsed value for the record.
	 */
	#parseValue(fieldName, key, value, lineNum) {
		let field = this.#recordDef.fields[fieldName];
		switch (field.type) {
			case "record":
				if (value == "") {
					return null;
				}
				let modelName = field.modelName;
				let linkRec = this.#linkedRecords.find(l => l.modelDef.modelName == modelName);
				if (typeof linkRec == "undefined") {
					console.error("Model name " + modelName + " is not referenced in linkedRecords");
					return null;
				}
				let lookupFields = linkRec.modelDef.lookupFields;
				let linkedRecord; // undefined, not null
				lookupFields.every(field => {
					let convertedVal = this.#convertStrVal(value, linkRec.modelDef.fields[field].type);
					linkedRecord = linkRec.records.find(r => this.#equalsIgnoreCase(r[field], convertedVal, linkRec.modelDef.fields[field].type));
					if (typeof linkedRecord != "undefined") {
						// Add warning for case insensitive match
						if (convertedVal != linkedRecord[field]) {
							let linkedRecordLabel = linkedRecord[field];
							if ("label" in linkedRecord) {
								linkedRecordLabel = linkedRecord.label;
							}
							let message = (linkedRecordLabel != linkedRecord[field]) ?
									value + " a été associé à " + linkedRecordLabel + " (" + linkedRecord[field] + ")" :
									value + " a été associé à " + linkedRecordLabel;
							this.#warnings.push({line: lineNum + 2, field: field, warning: "InsensitiveMatch", message: message});
						}
						return false; // lookupFields.every break
					}
					return true;
				});
				if (typeof linkedRecord == "undefined") {
					throw new InvalidFieldException(InvalidFieldConstraints.CSTR_ASSOCIATION_NOT_FOUND,
						this.#recordDef.modelName, fieldName, null, value);
				}
				return linkedRecord.id;
			case "string":
			case "text":
			case "boolean":
			case "number":
			case "date":
			case "rate":
			case "scaleType":
				return this.#convertStrVal(value, field.type);
			default:
				console.error("Unknown column type \"" + field.type + "\" for " + key);
				return value;
		}
	}
	#convertStrVal(stringVal, type) {
		switch (type) {
			case "string":
			case "text":
				return stringVal;
			case "boolean":
				return this.#convertBoolean(stringVal);
			case "number":
				return this.#convertNumber(stringVal);
			case "date":
				return this.#convertDate(stringVal);
			case "rate":
				return this.#convertRate(stringVal);
			case "scaleType":
				return this.#convertScaleType(stringVal);
			default:
				console.error("Unknown column type \"" + type + "\"");
				return value;
		}
	}
	#convertBoolean(stringVal) {
		let v = stringVal.trim().toLowerCase();
		if (v.length == 0) {
			return false;
		}
		let first = v.charAt(0);
		return v == "o" || v == "y" || v == "1";
	}
	#convertNumber(stringVal) {
		let num = parseFloat(stringVal.trim().replace(",", "."));
		if (isNaN(num)) {
			return undefined;
		}
		return num;
	}
	#convertDate(stringVal) {
		return new PTDate(stringVal);
	}
	#convertRate(stringVal) {
		let value = stringVal;
		// Convert value to number
		if (typeof value == "string") {
			let percentIndex = value.indexOf("%");
			if (percentIndex != -1) {
				// Explicitely %, return rate
				return this.#convertNumber(value.substring(0, percentIndex)) / 100.0;
			}
			// Convert string to number and continue
			value = this.#convertNumber(value);
		}
		if (value > 1.0) {
			return value / 100.0;
		}
		return value;
	}
	#convertScaleType(stringVal) {
		let intVal = parseInt(stringVal, 10);
		if (! isNaN(intVal) && intVal >= 0 && intVal <= 3) {
			return intVal;
		}
		switch (stringVal.trim().toLowerCase()) {
			case 'kilogramme': case 'kg': case 'poid': case 'poids': case '1':
				return 1;
			case 'litre': case 'l': case '2':
				return 2;
			case 'heure': case 'h': case 'horaire': case '3':
				return 3;
			case 'piece': case 'p': case 'u': case 'unité': case '0': case '-':
			default:
				return 0
		}
	}
	#equalsIgnoreCase(val1, val2, type) {
		switch (type) {
			case "string": return val1.toLowerCase() == val2.toLowerCase();
			case "date": (val1 === null && val2 === null) || (val1.equals(val2));
			case "boolean":
			case "number":
			default:
				return val1 == val2;
		}
	}
}

/** Structure to hold parsing results. */
class CsvImportResult {
	newRecords;
	editedRecords;
	editedValues;
	unchangedRecords;
	unknownColumns;
	errors;
	warnings;
	constructor(newRecs, editedRecs, editedVals, unchangedRecs, unknownCols, errs, warns) {
		this.newRecords = newRecs;
		this.editedRecords = editedRecs;
		this.editedValues = editedVals;
		this.unchangedRecords = unchangedRecs;
		this.unknownColumns = unknownCols;
		this.errors = errs;
		this.warnings = warns;
	}
}

class MissingReferenceColumnException extends Error
{
	modelName;
	field;
	constructor(modelName, field) {
		super("Missing column for lookup: " + field);
		this.modelName = modelName;
		this.field = field;
	}
}
/** Set the vue app data to display the loading component. */
function gui_showLoading() {
	vue.loading.loading = true;
	vue.loading.progress = null;
	vue.loading.progressMax = null;
}
/** Set the vue app data to hide the loading component. */
function gui_hideLoading() {
	vue.loading.loading = false;
}
/** Set the vue app data to display or update the loading component with a
 * progressive loading. */
function gui_showProgress(current, total) {
	vue.loading.loading = true;
	vue.loading.progress = current;
	vue.loading.progressMax = total;
}

/** Private method to set the vue app data to display a message. */
function _gui_showMessage(messageClass, message, stack) {
	let msg = message
	if ((typeof message) != "object") {
		msg = [message];
	}
	vue.message.type = messageClass;
	vue.message.message = msg;
	if (arguments.length >= 3) {
		vue.message.stack = stack;
	}
}
/** Set the vue app data to hide the message box. */
function gui_closeMessageBox() {
	vue.message.type = null;
	vue.message.message = '';
}
/** Set the vue app data to show an info message. */
function gui_showMessage(message) {
	_gui_showMessage("message-info", message);
}
function gui_showWarning(message) {
	_gui_showMessage("message-warning", message);
}
/** Set the vue app data to show an error message. */
function gui_showError(message, stack) {
	_gui_showMessage("message-error", message, stack);
}

function gui_setFont(font) {
	let body = document.querySelector("body");
	for (let c of ["default-font", "dyslexic-friendly", "hyperlegible", "no-font"]) {
		body.classList.remove(c);
	}
	switch (font) {
		case "opendyslexic":
			body.classList.add("dyslexic-friendly");
			break;
		case "hyperlegible":
			body.classList.add("hyperlegible");
			break;
		case "system":
			body.classList.add("no-font");
			break;
		default:
			body.classList.add("default-font");
			break;
	}
}


Vue.component("vue-blank", {});
 const JSADMIN_VERSION = "8.25";

/** The vue.js app. */
var vue = null;
 var appData = {
	 db: null,
	 generalDbError: function(event) {
		 gui_showError([
			 "Unable to access local data storage (also called site data). This issue usually arises from using private browsing mode. The \"logout\" button, once logged in, allows you to clear the management interface data.",
			 "If you are using private browsing mode, try switching to normal browsing mode.",
			 "If you are not using it, check your browser's history retention settings. For Firefox, in the \"Privacy & Security\" tab, under the \"History\" section, select \"Remember history\" or \"Use custom settings for history\" and make sure \"Remember browsing and download history\" is checked."
		 ]);
		 return;
	 },
	 readDbError: function(event) {
		 console.info(event.stack);
		 gui_showError([
			 "Unable to read local data. To help resolve this issue, you can send the following information to your PastÃ¨que provider if the problem persists.",
			 "Name: " + event.error.name,
			 "Message: " + event.error.message
		 ], event.stack);
		 gui_hideLoading();
		 storage_close();
	 },
	 localWriteDbSuccess: function(event) {
		 gui_hideLoading();
		 gui_showMessage("Changes have been saved");
		 storage_close();
	 },
	 localWriteDbError: function(event) {
		 gui_hideLoading();
		 gui_showError([
			 "Changes have been saved but an error occurred. Please reload the data from the home screen to apply the changes.",
			 "If the problem persists, you can send the following information to your PastÃ¨que provider to help resolve it.",
			 "Name: " + event.error.name,
			 "Message: " + event.error.message
		 ]);
		 storage_close();
	 },
	 localWriteOpenDbError: function(event) {
		 gui_hideLoading();
		 gui_showError([
			 "Changes have been saved but an error occurred. Please reload the data from the home screen to apply the changes.",
			 "If the problem persists, you can send the following information to your PastÃ¨que provider to help resolve it.",
			 "Name: " + event.error.name,
			 "Message: " + event.error.message
		 ]);
	 }
 };

function route(screen) {
	if (arguments.length == 0) {
		screen = "default";
	}
	if (login_getToken() == null) {
		login_show();
		return;
	}
	switch (screen) {
	case "categories":
		categories_show();
		break;
	case "category":
		categories_showCategory(_get("id"));
		break;
	case "categoryImport":
		categories_showImport();
		break;
	case "products":
		products_show(_get("category"));
		break;
	case "producttags":
		producttags_show();
		break;
	case "tariffareas":
		tariffareas_show();
		break;
	case "customers":
		customers_show();
		break;
	case "customerImport":
		customers_showImport();
		break;
	case "paymentmodes":
		paymentmodes_show();
		break;
	case "sales_tickets":
		tickets_show();
		break;
	case "sales_z":
		ztickets_show();
		break;
	case "salesbyproduct":
		salesbyproduct_show();
		break;
	case "salesbycategory":
		salesbycategory_show();
		break;
	case "salesdetails":
		salesdetails_show();
		break;
	case "product":
		products_showProduct(_get("id"), _get("category"));
		break;
	case "productDuplicate":
		products_showDuplicateProduct(_get("id"));
		break;
	case "productCompo":
		products_showProduct(_get("id"), _get("category"), true);
		break;
	case "productCompoDuplicate":
		products_showDuplicateProduct(_get("id"), true);
		break;
	case "productImport":
		products_showImport();
		break;
	case "tariffarea":
		tariffareas_showArea(_get("id"));
		break;
	case "customer":
		customers_showCustomer(_get("id"));
		break;
	case "paymentmode":
		paymentmodes_showPaymentMode(_get("id"));
		break;
	case "floors":
		floors_show();
		break;
	case "users":
		users_show();
		break;
	case "user":
		users_showUser(_get("id"));
		break;
	case "roles":
		roles_show();
		break;
	case "role":
		roles_showRole(_get("id"));
		break;
	case "discountprofiles":
		discountprofiles_show();
		break;
	case "discountprofile":
		discountprofiles_showProfile(_get("id"));
		break;
	case "discountprofileImport":
		discountprofiles_showImport();
		break;
	case "cashregisters":
		cashregisters_show();
		break;
	case "cashregister":
		cashregisters_showCashRegister(_get("id"));
		break;
	case "resources":
		resources_show();
		break;
	case "resource":
		resources_showResource(_get("label"));
		break;
	case "currencies":
		currencies_show();
		break;
	case "currency":
		currencies_showCurrency(_get("id"));
		break;
	case "taxes":
		taxes_show();
		break;
	case "tax":
		taxes_showTax(_get("id"));
		break;
	case "preferences":
		preferences_show();
		break;
	case "accounting_z":
		accounting_showZ();
		break;
	case "accounting_config":
		accounting_showConfig();
		break;
	case "home":
	default:
		home_show();
		break;
	}
}


function boot() {
	vue = new Vue({
		el: "#vue-app",
		data: {
			ready: false,
			loading: {
				loading: false,
				progress: null,
				progressMax: null
			},
			message: {
				type: null,
				message: null
			},
			login: {
				loggedIn: false,
				server: null,
				user: null,
				https: true,
				password: ''
			},
			menu: menu_init(),
			screen: {
				component: undefined,
				data: null
			}
		}
	});
	storage_available(function(event) {
		start();
	}, function(event) {
		if (event === false) {
			gui_showError("Data storage not available. Your browser may be outdated.");
		} else {
			appData.generalDbError(event);
		}
	});
}

function start() {
	// Initialize default dynamic values
	vue.login = {
		loggedIn: (login_getToken() != null),
		server: login_getServer(),
		user: login_getUser(),
		https: login_getHttps(),
		password: ''
	}
	vue.menu.visible = true;
	// Initialize the database if required and read global options
	if (appData.db == null) {
		storage_open(function(event) {
			storage_get("options", OPTION_PREFERENCES, function(option) {
				if (option != null) {
					let content = JSON.parse(option.content);
					gui_setFont(content.font);
				}
				storage_close();
				let fontParam = storage_getSessionOption("font");
				if (fontParam != null) {
					gui_setFont(fontParam);
				}
				_start_done();
			}, function(error) { storage_close(); _start_done(); });
		});
	} else {
		_start_done();
	}
}
function _start_done() {
	vue.ready = true;
	// Show home/config screen
	route(_get("p"));
	gui_hideLoading();
}

function _get( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return null;
  else
    return results[1];
}
function table_saveDefaultColumns(option) {
	gui_showLoading();
	appData._tableTmpData = {
		option: option
	}
	_table_saveDefaultColumnsAction();
}

function _table_saveDefaultColumnsAction() {
	let option = appData._tableTmpData.option;
	srvcall_post("api/option", option, _table_saveDefaultColumnsCallback)
}

function _table_saveDefaultColumnsCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, _table_saveDefaultColumnsAction)) {
		return;
	}
	// Store in local cache
	let thiss = this;
	storage_open(function(event) {
		storage_write("options", appData._tableTmpData.option, function(event) {
			delete(appData._tableTmpData);
			appData.localWriteDbSuccess(event);
		}, function(event) {
			delete(appData._tableTmpData);
			appData.localWriteDbError(event);
		});
	});
}
function home_show() {
	vue.screen.data = {
		user: vue.login.user,
		server: vue.login.server,
		version: JSADMIN_VERSION,
	}
	if (storage_hasData()) {
		let syncDate = storage_getSyncDate();
		vue.screen.data.syncDate = {
			date: tools_dateToString(syncDate),
			time: tools_timeToString(syncDate)
		}
		vue.menu.visible = true;
	} else {
		vue.menu.visible = false;
	}
	vue.screen.component = "vue-home";
}

function home_sendSync() {
	gui_showLoading();
	srvcall_get("api/sync", home_syncCallback);
}

function home_syncCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, home_sendSync)) {
		return;
	}
	var data = JSON.parse(response);
	home_resetProgress(data);
	storage_open(function(event) {
		storage_sync(data, home_syncProgress, home_syncError, home_syncComplete);
	});
}

/** Contains for each SYNC_MODELS: {"count": number of models, "done": index loaded}.
 * "done" contains a dictionary with true/false when an index was loaded.
 * This is for preventing concurrential access on a single integer. */
var _home_progress = {};

/** Initialize home_progress. */
function home_resetProgress(data) {
	for (let i = 0; i < SYNC_MODELS.length; i++) {
		let model = SYNC_MODELS[i];
		_home_progress[model] = {"count": data[model].length + 1, "done": []};
	}
}

function home_syncProgress(model, i, event) {
	_home_progress[model]["done"][i] = true;
	home_checkProgress();
}

function home_syncError(model, i, event) {
	_home_progress[model]["done"][i] = false;
	console.error(model, i, event);
}

function home_syncComplete() {
	function syncDone() {
		vue.menu.visible = true;
		gui_hideLoading();
		storage_close();
		home_show();
		gui_hideLoading();
	}
	storage_open(function(event) {
		storage_get("options", OPTION_PREFERENCES, function(option) {
			if (option != null) {
				let content = JSON.parse(option.content);
				gui_setFont(content.font)
			}
			syncDone()
		}, function(error) { syncDone() });
	});
}

function home_checkProgress() {
	for (let i = 0; i < SYNC_MODELS.length; i++) {
		let model = SYNC_MODELS[i];
		if (_home_progress[model]["count"] + 1 != _home_progress[model]["done"].length) {
			return false;
		}
	}
}

function categories_show() {
	gui_showLoading();
	vue.screen.data = {categories: [], sort: "dispOrder"};
	storage_open(function(event) {
		storage_readStore("categories", function(categories) {
			vue.screen.data.categories = categories;
			vue.screen.data.tree = true;
			vue.screen.component = "vue-category-list"
			storage_close();
			gui_hideLoading();
		});
	});
}

function categories_showCategory(id) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStore("categories", function(categories) {
			if (id != null) {
				storage_get("categories", parseInt(id), function(category) {
					_categories_showCategory(category, categories);
					storage_close();
				});
			} else {
				storage_close();
				_categories_showCategory(new RecordFactory(CategoryDef).createEmpty(), categories);
			}
		});
	});
}
function _categories_showCategory(category, categories) {
	vue.screen.data = {
		modelDef: CategoryDef,
		category: category,
		categories: categories,
		image: null,
	}
	vue.screen.component = "vue-category-form";
	gui_hideLoading();
}

function category_saveCategory() {
	let cat = vue.screen.data.category;
	if (cat.parent == "") {
		cat.parent = null;
	}
	gui_showLoading();
	if ("id" in cat) {
		srvcall_post("api/category", cat, category_saveCallback);
	} else {
		srvcall_put("api/category/" + encodeURIComponent(cat["reference"]), cat, category_saveCallback);
	}
}

function category_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, category_saveCategory)) {
		return;
	}
	if (status == 400) {
		if (request.statusText == "Reference is already taken") {
			gui_showError("The reference already exists. Please choose another one.");
			document.getElementById("edit-reference").focus(); // TODO: make this Vue-friendly.
		} else {
			gui_showError("Something's wrong with the form data. " + request.statusText);
		}

		gui_hideLoading();
		return;
	}
	let cat = vue.screen.data.category;
	if (cat.parent == "") {
		cat.parent = null;
	}
	if (!("id" in cat)) {
		let respCat = JSON.parse(response);
		cat.id = respCat["id"];
	}
	srvcall_imageSave("category", cat, cat.id, vue.screen.data.image, _category_saveCommit);
}

function _category_saveCommit(cat) {
	if (vue.screen.data.image) {
		cat.hasImage = !vue.screen.data.image.delete;
		vue.screen.data.image = null; // Refresh form
	}
	// Update in local database
	storage_open(function(event) {
		storage_write("categories", cat,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteOpenDbError);
}

function categories_showImport() {
	storage_open(function(event) {
		storage_readStores(["categories"], function(data) {
			vue.screen.data = {
				"modelDef": CategoryDef,
				"categories": data.categories,
			}
			vue.screen.component = "vue-category-import";
			storage_close();
		});
	});
}

function _categories_parseCsv(fileContent, callback) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStore("categories", function(categories) {
			let parser = new CsvParser(CategoryDef, categories,
					[{modelDef: CategoryDef, "records": categories}]);
			let imported = parser.parseContent(fileContent);
			gui_hideLoading();
			storage_close();
			vue.screen.data.newCategories = imported.newRecords;
			vue.screen.data.editedCategories = imported.editedRecords;
			callback(imported);
		});
	});
}

function categories_saveCategories() {
	let calls = [];
	for (let i = 0; i < vue.screen.data.newCategories.length; i++) {
		let cat = vue.screen.data.newCategories[i];
		calls.push({id: "new-" + i, method: "PUT", target: "api/category/" + encodeURIComponent(cat.reference), data: cat});
	}
	for (let i = 0; i < vue.screen.data.editedCategories.length; i++) {
		let cat = vue.screen.data.editedCategories[i];
		let copy = {};
		for (key in cat) {
			if (key != "id")
				copy[key] = cat[key];
		}
		calls.push({id: "edit-" + i, method: "PATCH", target: "api/category/" + encodeURIComponent(cat.reference), data: copy});
	}
	vue.screen.data.progress = 0;
	vue.screen.data.progressTotal = calls.length;
	gui_showProgress(vue.screen.data.progress, vue.screen.data.progressTotal);
	srvcall_multicall(calls, categories_saveMultipleCallback, _categories_progress);
}

function _categories_progress() {
	vue.screen.data.progress++;
	gui_showProgress(vue.screen.data.progress, vue.screen.data.progressTotal);
}

function categories_saveMultipleCallback(results) {
	if (Object.keys(results).length > 0) {
		let res = results[Object.keys(results)[0]];
		let showMsg = function() {
			gui_hideLoading();
			gui_showWarning("Data was not submitted. Please repeat the operation.");
		}
		if (srvcall_callbackCatch(res.request, res.status, res.response, showMsg)) {
			return;
		}
	}
	errors = [];
	saves = [];
	for (let reqId in results) {
		let request = results[reqId].request;
		let status = results[reqId].status;
		let response = results[reqId].response;
		if (status == 400) {
			let err = JSON.parse(response);
			if (err.error == "InvalidField") {
				errors.push("The reference " + err.value + " is not unique. The category was not saved.");
			} else {
				errors.push("Something's wrong with the form data. " + request.statusText);
			}

			continue;
		}
		if (reqId.substr(0, 4) == "new-") {
			let num = parseInt(reqId.substr(4));
			let cat = vue.screen.data.newCategories[num];
			let respCat = JSON.parse(response);
			cat.id = respCat.id;
			saves.push(cat);
		} else {
			let num = parseInt(reqId.substr(5));
			let cat = vue.screen.data.editedCategories[num];
			saves.push(cat);
		}
	}
	// Commit changes locally
	let commitSuccess = function(data) {
		gui_hideLoading();
		if (errors.length > 0) {
			if (saves.length > 0) {
				errors.push("The other records were saved. You can reload the file to review the errors.");
			}
			gui_showError(errors);
		} else {
			gui_showMessage("The data has been saved.");
		}

		vue.screen.data = {};
		vue.$refs.screenComponent.reset();
		categories_showImport();
	}
	if (saves.length == 0) {
		gui_hideLoading();
		if (errors.length == 0) {
			gui_showErrors("No operation performed.");
		} else {
			gui_showErrors(errors);
		}
	} else {
		storage_open(function(event) {
			storage_write("categories", saves,
				commitSuccess, appData.localWriteDbError);
		}, appData.localWriteDbOpenError);
	}
}
function products_show(catId) {
	if (arguments.length < 1) {
		catId = null;
	} else {
		if (typeof catId == "string") {
			catId = Number.parseInt(catId);
			if (catId == Number.NaN) {
				catId = null;
			}
		}
	}
	gui_showLoading();
	storage_open(function(event) {
		storage_readStores(["categories", "taxes"], function(data) {
			let selectedCatId = catId;
			if (data.categories.length > 0 && selectedCatId == null) {
				selectedCatId = data.categories[0].id;
			}
			vue.screen.data = {
				"categories": data.categories,
				"taxes": data.taxes,
				"filterVisible": "visible",
				"sort": "dispOrder",
				"selectedCatId": selectedCatId,
			}
			vue.screen.component = "vue-product-list";
			gui_hideLoading();
			storage_close();
		});
	});
}

function products_showProduct(prdId, catId, isCompo) {
	if (arguments.length < 3) {
		isCompo = false;
	}
	gui_showLoading();
	if (typeof(catId) == "string") {
		catId = parseInt(catId);
	}
	let categoryFound = false;
	storage_open(function(event) {
		storage_readStores(["categories", "taxes"], function(data) {
			let categories = data["categories"];
			let taxes = data["taxes"];
			for (let i = 0; i < categories.length; i++) {
				if (catId != null && categories[i].id == catId) {
					categoryFound = true;
				}
			}
			if (prdId != null) {
				storage_get("products", parseInt(prdId), function(product) {
					_products_showProduct(product, categories, taxes);
					storage_close();
				});
			} else {
				let prdCatId = categories[0].id;
				if (catId != null && categoryFound == true) {
					prdCatId = catId;
				}
				if (!isCompo) {
					let prd = Product_default(prdCatId, null);
					_products_showProduct(prd, categories, taxes);
				} else {
					let prd = Composition_default(prdCatId, null);
					_products_showProduct(prd, categories, taxes);
				}
				storage_close();
			}
		});
	});
}

function products_showDuplicateProduct(prdId, isCompo) {
	if (arguments.length < 3) {
		isCompo = false;
	}
	gui_showLoading();
	storage_open(function(event) {
		storage_readStores(["categories", "taxes"], function(data) {
			let categories = data["categories"];
			let taxes = data["taxes"];
			storage_get("products", parseInt(prdId), function(product) {
				delete product.id;
				_products_showProduct(product, categories, taxes);
				storage_close();
			});
		});
	});
}

function _products_showProduct(product, categories, taxes) {
	gui_hideLoading();
	vue.screen.data = {
		product: product,
		categories: categories,
		taxes: taxes,
		deleteImage: false,
		deleteImageButton: "Supprimer",
		hadImage: product.hasImage // Save for later check
	}
	if (product.tax == null) {
		product.tax = "";
	}
	if (!product.composition) {
		vue.screen.component = "vue-product-form";
	} else {
		if (product.compositionGroups.length == 0) {
			vue.screen.data.product.compositionGroups.push(CompositionGroup_default());
		}
		vue.screen.data.index = 0;
		vue.screen.data.precache = [];
		let prds = [];
		let prdIds = []
		for (let i = 0; i < product.compositionGroups.length; i++) {
			let grp = product.compositionGroups[i];
			for (let j = 0; j < grp.compositionProducts.length; j++) {
				let prdId = grp.compositionProducts[j].product;
				if (!(prdId in prds)) {
					prds[prdId] = true; // Avoid duplicated ids.
					prdIds.push(prdId);
				}
			}
		}
		storage_open(function(event) {
			if (prdIds.length == 0) {
				vue.screen.component = "vue-product-composition-form";
			} else {
				storage_get("products", prdIds, function(prdData) {
					let products = Object.values(prdData);
					for (let j = 0; j < products.length; j++) {
						let cachePrd = products[j];
						vue.screen.data.precache[cachePrd.id] = cachePrd;
					}
					vue.screen.component = "vue-product-composition-form";
					storage_close();
				});
			}
		});
	}
	product_updatePrice();
}

function product_updatePrice() {
	let sellVat = vue.screen.data.product.taxedPrice;
	let taxId = vue.screen.data.product.tax;
	let tax = null;
	for (let i = 0; i < vue.screen.data.taxes.length; i++) {
		if (vue.screen.data.taxes[i].id == taxId) {
			tax = vue.screen.data.taxes[i];
			break;
		}
	}
	if (tax == null) {
		return;
	}
	let taxRate = tax.rate;
	let priceSell = Number(sellVat / (1.0 + taxRate)).toFixed(5);
	vue.screen.data.product.priceSell = priceSell;
	let priceBuy = vue.screen.data.product.priceBuy;
	if (isNaN(priceBuy) || priceBuy == 0.0) {
		vue.screen.data.product.margin = "";
	} else {
		let margin = Number(priceSell / priceBuy).toFixed(2);
		let ratio = Number((priceSell / priceBuy - 1) * 100).toFixed(2);
		vue.screen.data.product.margin = ratio + "%\t\t" + margin;
	}
}

function product_toggleImage() {
	if (vue.screen.data.product.hasImage) {
		vue.screen.data.product.hasImage = false;
		vue.screen.data.deleteImage = true;
		document.getElementById("edit-image").value = "";
		vue.screen.data.deleteImageButton = "Restaurer";
	} else {
		vue.screen.data.product.hasImage = true;
		vue.screen.data.deleteImage = false;
		vue.screen.data.deleteImageButton = "Supprimer";
	}
}

function product_composition_addGroup(label) {
	let grp = CompositionGroup_default();
	grp.label = label;
	vue.screen.data.product.compositionGroups.push(grp);
}

function product_composition_switchGroup(index) {
	vue.screen.data.index = index; // ugly way to access selectedGroupIndex from the vue.
}

function product_composition_addProduct(product) {
	let group = vue.screen.data.product.compositionGroups[vue.screen.data.index];
	for (let i = 0; i < group.compositionProducts.length; i++) {
		let cmpPrdId = group.compositionProducts[i].product;
		if (cmpPrdId == product.id) {
			return;
		}
	}
	vue.screen.data.product.compositionGroups[vue.screen.data.index].compositionProducts.push(CompositionProduct_default(product));
}

function product_composition_deleteGroup(index) {
	vue.screen.data.product.compositionGroups.splice(index, 1);
}

function product_composition_delProduct(prdId) {
	let group = vue.screen.data.product.compositionGroups[vue.screen.data.index];
	for (let i = 0; i < group.compositionProducts.length; i++) {
		let cmpPrdId = group.compositionProducts[i].product;
		if (cmpPrdId == prdId) {
			group.compositionProducts.splice(i, 1);
			return;
		}
	}
}

function products_saveProduct() {
	let prd = vue.screen.data.product;
	gui_showLoading();
	if ("id" in prd) {
		// This is an update
		srvcall_post("api/product", prd, products_saveCallback);
	} else {
		// This is a create
		srvcall_put("api/product/" + encodeURIComponent(prd.reference), prd, products_saveCallback);
	}
}

function _products_progress() {
	vue.screen.data.progress++;
	gui_showProgress(vue.screen.data.progress, vue.screen.data.progressTotal);
}

function products_saveProducts() {
	let calls = [];
	for (let i = 0; i < vue.screen.data.newProducts.length; i++) {
		let prd = vue.screen.data.newProducts[i];
		calls.push({id: "new-" + i, method: "PUT", target: "api/product/" + encodeURIComponent(prd.reference), data: prd});
	}
	for (let i = 0; i < vue.screen.data.editedProducts.length; i++) {
		let prd = vue.screen.data.editedProducts[i];
		let copy = {};
		for (key in prd) {
			if (key != "id")
				copy[key] = prd[key];
		}
		calls.push({id: "edit-" + i, method: "PATCH", target: "api/product/" + encodeURIComponent(prd.reference), data: copy});
	}
	vue.screen.data.progress = 0;
	vue.screen.data.progressTotal = calls.length;
	gui_showProgress(vue.screen.data.progress, vue.screen.data.progressTotal);
	srvcall_multicall(calls, products_saveMultipleCallback, _products_progress);
}

function products_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, products_saveProduct)) {
		return;
	}
	if (status == 400) {
		if (request.statusText == "Reference is already taken") {
			gui_showError("La référence existe déjà, veuillez en choisir une autre.");
			document.getElementById("edit-reference").focus(); // TODO: make this Vuejsy.
		} else {
			gui_showError("Quelque chose cloche dans les données du formulaire. " + request.statusText);
		}
		gui_hideLoading();
		return;
	}
	let prd = vue.screen.data.product;
	if (!("id" in prd)) {
		let respPrd = JSON.parse(response);
		prd.id = respPrd["id"];
	}
	let imgTag = document.getElementById("edit-image");
	if (vue.screen.data.deleteImage) {
		prd.hasImage = false;
		srvcall_delete("api/image/product/" + encodeURIComponent(prd.id), function(request, status, response) {
			_products_saveCommit(prd);
		});
	} else if (imgTag.files.length != 0) {
		prd.hasImage = true;
		if (vue.screen.data.hadImage) {
			srvcall_patch("api/image/product/" + encodeURIComponent(prd.id), imgTag.files[0], function(request, status, response) {
				_products_saveCommit(prd);
			});
		} else {
			srvcall_put("api/image/product/" + encodeURIComponent(prd.id), imgTag.files[0], function(request, status, response) {
				_products_saveCommit(prd);
			});
		}
	} else {
		_products_saveCommit(prd);
	}
}

function products_saveMultipleCallback(results) {
	if (Object.keys(results).length > 0) {
		let res = results[Object.keys(results)[0]];
		let showMsg = function() {
			gui_hideLoading();
			gui_showWarning("Les données n'ont pas été envoyées, veuillez réitérer l'opération.");
		}
		if (srvcall_callbackCatch(res.request, res.status, res.response, showMsg)) {
			return;
		}
	}
	errors = [];
	saves = [];
	for (let reqId in results) {
		let request = results[reqId].request;
		let status = results[reqId].status;
		let response = results[reqId].response;
		if (status == 400) {
			let err = JSON.parse(response);
			if (err.error == "InvalidField") {
				errors.push("La référence " + err.value + " n'est pas unique. Le produit n'a pas été enregistré.");
			} else {
				errors.push("Quelque chose cloche dans les données du formulaire. " + request.statusText);
			}
			continue;
		}
		if (reqId.substr(0, 4) == "new-") {
			let num = parseInt(reqId.substr(4));
			let prd = vue.screen.data.newProducts[num];
			let respPrd = JSON.parse(response);
			prd.id = respPrd.id;
			saves.push(prd);
		} else {
			let num = parseInt(reqId.substr(5));
			let prd = vue.screen.data.editedProducts[num];
			saves.push(prd);
		}
	}
	// Commit changes locally
	let commitSuccess = function(data) {
		gui_hideLoading();
		if (errors.length > 0) {
			if (saves.length > 0) {
				errors.push("Les autres enregistrements ont été pris en compte. Vous pouvez recharger le fichier pour retrouver les erreurs.");
			}
			gui_showError(errors);
		} else {
			gui_showMessage("Les données ont été enregistrées.");
		}
		vue.screen.data = {};
		vue.screen.data = {
				"categories": vue.screen.data.categories,
				"taxes": vue.screen.data.taxes,
		};
		vue.$refs.screenComponent.reset();
	}
	if (saves.length == 0) {
		gui_hideLoading();
		if (errors.length == 0) {
			gui_showErrors("Aucune opération.");
		} else {
			gui_showErrors(errors);
		}
	} else {
		storage_open(function(event) {
			storage_write("products", saves,
				commitSuccess, appData.localWriteDbError);
		}, appData.localWriteDbOpenError);
	}
}

function _products_saveCommit(prd) {
	if (prd.hasImage) {
		// Force image refresh
		prd.hasImage = false;
		prd.hasImage = true;
	}
	// Update in local database
	storage_open(function(event) {
		storage_write("products", prd,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}


function products_showImport() {
	storage_open(function(event) {
		storage_readStores(["categories", "taxes"], function(data) {
			vue.screen.data = {
				"modelDef": ProductDef,
				"categories": data.categories,
				"taxes": data.taxes,
			}
			vue.screen.component = "vue-product-import";
			storage_close();
		});
	});
}

function _products_parseCsv(fileContent, callback) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStores(["products", "categories", "taxes"], function(data) {
			let parser = new CsvParser(ProductDef, data.products,
					[
						{modelDef: CategoryDef, "records": data.categories},
						{modelDef: TaxDef, "records": data.taxes}
					]);
			let imported = parser.parseContent(fileContent);
			gui_hideLoading();
			storage_close();
			vue.screen.data.newProducts = imported.newRecords;
			vue.screen.data.editedProducts = imported.editedRecords;
			callback(imported);
		});
	});
}
function tariffareas_show() {
	gui_showLoading();
	let areas = [];
	vue.screen.data = {tariffareas: [], sort: "dispOrder"};
	storage_open(function(event) {
		storage_readStore("tariffareas", function(areas) {
			vue.screen.data.tariffareas = areas;
			vue.screen.component = "vue-tariffarea-list";
			gui_hideLoading();
			storage_close();
		});
	});
}

function tariffareas_showArea(id) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStores(["categories", "taxes"], function(data) {
			if (id != null) {
				storage_get("tariffareas", parseInt(id), function(tariffarea) {
					_tariffareas_showArea(tariffarea, data["categories"], data["taxes"]);
					storage_close();
				});
			} else {
				_tariffareas_showArea(TariffArea_default(), data["categories"], data["taxes"]);
				storage_close();
			}
		});
	});
}

function _tariffareas_showArea(area, categories, taxes) {
	vue.screen.data = {
		tariffarea: area,
		categories: categories,
		taxes: taxes,
		productCache: [],
		selectedCatId: categories[0].id,
	};
	let prdStore = appData.db.transaction(["products"], "readonly").objectStore("products");
	let loaded = 0;
	if (area.prices.length == 0) {
		vue.screen.component = "vue-tariffarea-form";
		gui_hideLoading();
		return;
	}
	for (let i = 0; i < area.prices.length; i++) {
		let price = area.prices[i];
		prdStore.get(price.product).onsuccess = function(event) {
			let product = event.target.result;
			vue.screen.data.productCache[product.id] = product;
			let taxId = price.tax;
			let tax = null;
			if (taxId == null) {
				taxId = product.tax;
			}
			for (let j = 0; j < vue.screen.data.taxes.length; j++) {
				if (vue.screen.data.taxes[j].id == taxId) {
					tax = vue.screen.data.taxes[j];
					break;
				}
			}
			price.priceSellVat = Number(price.price * (1.0 + tax.rate)).toFixed(2)
			loaded++;
			if (loaded == area.prices.length) {
				vue.screen.component = "vue-tariffarea-form";
				gui_hideLoading();
			}
		};
	}
	
}

function tariffareas_addProduct(product) {
	let area = vue.screen.data.tariffarea;
	for (let i = 0; i < area.prices.length; i++) {
		let price = area.prices[i];
		if (price.product.id == product.id) {
			return;
		}
	}
	vue.screen.data.productCache[product.id] = product;
	area.prices.push(TariffArea_price(product));
}

function tariffareas_delProduct(productId) {
	let area = vue.screen.data.tariffarea;
	for (let i = 0; i < area.prices.length; i++) {
		let price = area.prices[i];
		if (price.product == productId) {
			area.prices.splice(i, 1);
			return;
		}
	}
}

function tariffareas_updatePrice(price) {
	let sellVat = price.priceSellVat;
	let prd = vue.screen.data.productCache[price.product];
	let newTaxId = price.tax;
	let tax = null;
	if (newTaxId != null) {
		for (let j = 0; j < vue.screen.data.taxes.length; j++) {
			let jTax = vue.screen.data.taxes[j];
			if (jTax.id == newTaxId) {
				tax = jTax;
				break;
			}
		}
	} else {
		for (let j = 0; j < vue.screen.data.taxes.length; j++) {
			let jTax = vue.screen.data.taxes[j];
			if (jTax.id == prd.tax) {
				tax = jTax;
				break;
			}
		}
	}
	let taxRate = tax.rate;
	price.price = Number(sellVat / (1.0 + taxRate)).toFixed(5);
}

function tariffareas_saveArea() {
	let area = vue.screen.data.tariffarea;
	gui_showLoading();
	if ("id" in area) {
		srvcall_post("api/tariffarea", area, tariffareas_saveCallback);
	} else {
		srvcall_put("api/tariffarea/" + encodeURIComponent(area["reference"]), area, tariffareas_saveCallback);
	}
}

function tariffareas_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, tariffareas_saveArea)) {
		return;
	}
	if (status == 400) {
		// if (request.statusText == "Reference is already taken") {
		// 	gui_showError("La référence existe déjà, veuillez en choisir une autre.");
		// 	document.getElementById("edit-reference").focus(); // TODO: make this Vuejsy.
		// } else {
		// 	gui_showError("Quelque chose cloche dans les données du formulaire. " + request.statusText);
		// }
		// gui_hideLoading();
		// return;

		if (request.statusText == "Reference is already taken") {
			gui_showError("The reference already exists, please choose another one.");
			document.getElementById("edit-reference").focus(); // TODO: make this Vue.js style.
		} else {
			gui_showError("Something's wrong with the form data. " + request.statusText);
		}
		gui_hideLoading();
		return;


	}
	let area = vue.screen.data.tariffarea;
	if (!("id" in area)) {
		let respArea = JSON.parse(response);
		area.id = respArea["id"];
	}
	// Update in local database
	storage_open(function(event) {
		storage_write("tariffareas", area,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}

function _tariffareas_parseCsv(fileContent) {
	let csv = new CSV(fileContent, {header: true, cast: false});
	let rawPrices = csv.parse();
	if (rawPrices.length == 0) {
		Vue.set(vue.screen.data.tariffarea, "prices", []);
	}
	gui_showLoading();
	// let columnMappingDef = {
	// 	reference: "reference",
	// 	"référence": "reference",
	// 	priceSellVat: "priceSellVat",
	// 	"prix de vente ttc": "priceSellVat",
	// 	tax: "tax",
	// 	"tva": "tax"
	//
	// };
	let columnMappingDef = {
		reference: "reference",
		"reference": "reference",             // "rÃ©fÃ©rence" â "reference"
		priceSellVat: "priceSellVat",
		"selling price incl. tax": "priceSellVat",  // "prix de vente ttc" â "selling price incl. tax"
		tax: "tax",
		"vat": "tax"                          // "tva" â "vat"
	};

	columnMapping = {};
	unknownColumns = [];
	for (let key in rawPrices[0]) {
		if (key.toLowerCase() in columnMappingDef) {
			columnMapping[key] = columnMappingDef[key.toLowerCase()];
		} else {
			unknownColumns.push(key);
		}
	}
	let taxByRef = [];
	let taxByLabel = [];
	let prdRefs = [];
	let readPrices = [];
	for (let i = 0; i < vue.screen.data.taxes.length; i++) {
		let tax = vue.screen.data.taxes[i];
		taxByRef[tax.reference] = tax;
		taxByLabel[tax.label] = tax;
	}
	for (let i = 0; i < rawPrices.length; i++) {
		// Convert the incoming csv lines to prices data
		// Except product ID which is looked for after
		function mapValues(line, mapping) {
			let ret = {};
			for (key in line) {
				if (key in mapping) {
					ret[mapping[key]] = line[key];
				}
			}
			return ret;
		}
		function convertNum(value) {
			let v = value.replace(",", ".");
			v = v.replace(" ", "");
			return parseFloat(v);
		}
		function convertTax(value) {
			if (value == "") {
				return null;
			} else {
				if (value in taxByRef) {
					return taxByRef[value].id;
				}
				if (value in taxByLabel) {
					return taxByLabel[value].id;
				}
				return null;
			}
		}
		function convertValues(value) {
			if ("priceSellVat" in value) {
				value.priceSellVat = convertNum(value.priceSellVat);
			} else {
				value.priceSellVat = null;
			}
			if ("tax" in value) {
				value.tax = convertTax(value.tax);
			} else {
				value.tax = null;
			}
			return value;
		}
		let value = mapValues(rawPrices[i], columnMapping);
		value = convertValues(value);
		rawPrices[i] = value;
		prdRefs.push(value.reference);
	}
	let prices = [];
	let errors = [];
	storage_open(function() {
		let prds = storage_getIndex("products", "reference", prdRefs, function(data) {
			for (let i = 0; i < data.length; i++) {
				let product = data[i];
				let rawPrice = rawPrices[i];
				if (product != null) {
					let price = TariffArea_price(product);
					price.priceSellVat = rawPrice.priceSellVat;
					price.tax = rawPrice.tax;
					let taxId = price.tax;
					let tax = null;
					if (taxId == null) {
						taxId = product.tax;
					}
					for (let j = 0; j < vue.screen.data.taxes.length; j++) {
						if (vue.screen.data.taxes[j].id == taxId) {
							tax = vue.screen.data.taxes[j];
							break;
						}
					}
					price.price = Number(price.priceSellVat / (1.0 + tax.rate)).toFixed(2)
					prices.push(price);
					vue.screen.data.productCache[product.id] = product;
				} else {
					errors.push("- " + prdRefs[i]);
				}
			}
			Vue.set(vue.screen.data.tariffarea, "prices", prices);
			gui_hideLoading();
			if (errors.length > 0) {
				let message = ["The price list has been updated, but the following references were not found:"];
				for (let i = 0; i < errors.length; i++) {
					message.push(errors[i]);
				}
				gui_showWarning(message);
			} else {
				gui_showMessage("The price list has been replaced. Don't forget to save.");
			}

		});
	});
}
function customers_show() {
	storage_open(function(event) {
		storage_readStores(["taxes", "tariffareas", "discountprofiles"], function(data) {
			_customers_showCustomers(data["taxes"], data["tariffareas"], data["discountprofiles"]);
			storage_close();
		});
	});
}

function _customers_showCustomers(taxes, tariffAreas, discountProfiles) {
	CustomerDef.loadCustomizedContactFields(function(contactFields) {
		vue.screen.data = {
			"filterVisible": "visible",
			"taxes": taxes,
			"tariffAreas": tariffAreas,
			"discountProfiles": discountProfiles,
			"contactFields": contactFields
		}
		vue.screen.component = "vue-customer-list";
	});
}

function customers_showCustomer(custId) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStores(["taxes", "tariffareas", "discountprofiles", "cashRegisters", "paymentmodes", "users"], function(data) {
			if (custId != null) {
				storage_get("customers", parseInt(custId), function(customer) {
					_customers_showCustomer(customer, data["taxes"], data["tariffareas"], data["discountprofiles"], data["cashRegisters"], data["paymentmodes"], data["users"]);
					storage_close();
				});
			} else {
				_customers_showCustomer(new RecordFactory(CustomerDef).createEmpty(), data["taxes"], data["tariffareas"], data["discountprofiles"], data["users"]);
				storage_close();
			}
		});
	});
}

function _customers_showCustomer(customer, taxes, tariffAreas, discountProfiles, cashRegisters, paymentModes, users) {
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	vue.screen.data = {
		"modelDef": CustomerDef,
		"customer": customer,
		"taxes": taxes,
		"tariffAreas": tariffAreas,
		"discountProfiles": discountProfiles,
		"cashRegisters": cashRegisters,
		"paymentModes": paymentModes,
		"users": users,
		"image": null,
		"start": start,
		"stop": stop,
		"tickets": [],
		"customerHistory": new Table().reference("customer-history-list")
			.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).exportable(false).visible(true).help("The product image. This field cannot be exported."))
			.column(new TableCol().reference("date").label("Date").visible(true).help("The purchase date.")) // type = String for date range
			.column(new TableCol().reference("ticket").label("Ticket").visible(false).searchable(true).help("The corresponding ticket number."))
			.column(new TableCol().reference("payments").label("Payment").visible(false).help("The payment method associated with the ticket. It is the same for all lines of the same ticket and does not reflect the payment of the individual line."))
			.column(new TableCol().reference("discountRate").label("Ticket Discount").visible(false).help("The discount rate applied to the entire ticket. This discount is not reflected in the HT (before tax) and TTC (after tax) fields."))
			.column(new TableCol().reference("line-reference").label("Reference").visible(false).searchable(true).help("The product reference."))
			.column(new TableCol().reference("line-label").label("Description").visible(true).searchable(true).help("The product name as shown on POS buttons and receipts."))
			.column(new TableCol().reference("line-unitPrice").label("Unit Price (Excl. Tax)").type(TABLECOL_TYPE.NUMBER5).visible(false).help("The unit price excluding tax before discount."))
			.column(new TableCol().reference("line-unitTaxedPrice").label("Unit Price (Incl. Tax)").type(TABLECOL_TYPE.NUMBER2).visible(false).help("The unit price including tax before discount."))
			.column(new TableCol().reference("line-taxRate").label("VAT").type(TABLECOL_TYPE.PERCENT).visible(false).help("The VAT rate applied."))
			.column(new TableCol().reference("line-quantity").label("Quantity").type(TABLECOL_TYPE.NUMBER).visible(true).help("The product quantity."))
			.column(new TableCol().reference("line-discountRate").label("Discount").type(TABLECOL_TYPE.PERCENT).footerType(TABLECOL_FOOTER.CUSTOM, "Total").visible(false).help("The discount rate applied to the line, included in both HT and TTC fields."))
			.column(new TableCol().reference("line-finalPrice").label("Subtotal (Excl. Tax)").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The net sales amount excluding VAT. It includes the line discount but not the ticket-wide discount."))
			.column(new TableCol().reference("line-finalTaxedPrice").label("Total (Incl. Tax)").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The total sale price including tax. Includes the line discount but not the ticket discount."))

	}
	CustomerDef.loadCustomizedContactFields(function(contactFields) {
		vue.screen.data.contactFields = contactFields;
		vue.screen.component = "vue-customer-form";
		gui_hideLoading();
	});
}

function customers_saveCustomer() {
	let cust = vue.screen.data.customer;
	if (cust.expireDate != null) {
		// Override to send date as timestamp without messing with local data
		cust.expireDate.toJSON = function() { return cust.expireDate.getTime() / 1000; };
	}
	gui_showLoading();
	srvcall_post("api/customer", cust, _customers_saveCallbackClosure(customers_saveCustomer));
}

function customers_saveBalance() {
	let custId = vue.screen.data.customer.id;
	let balance = vue.screen.data.customer.balance;
	gui_showLoading();
	srvcall_patch("api/customer/" + encodeURIComponent(custId) + "/balance/" + encodeURIComponent(balance), null, _customers_saveCallbackClosure(customers_saveBalance));
}

function _customers_saveCallbackClosure(originalFunc) {
	return function(request, status, response) {
		if (srvcall_callbackCatch(request, status, response, originalFunc)) {
			return;
		}
		_customers_saveCallback(request, status, response);
	}
}

function _customers_saveCallback(request, status, response) {
	let cust = vue.screen.data.customer;
	let respCust = JSON.parse(response);
	if (!("id" in cust)) {
		Vue.set(vue.screen.data.customer, "id", respCust["id"]);
	}
	if (cust.expireDate != null) {
		cust.expireDate = respCust.expireDate; // stay in sync with the server's format
	}
	srvcall_imageSave("customer", cust, cust.id, vue.screen.data.image, _customers_saveCommit);
}

function _customers_saveCommit(cust) {
	if (vue.screen.data.image) {
		cust.hasImage = !vue.screen.data.image.delete;
		vue.screen.data.image = null; // Refresh form
	}
	// Update in local database
	storage_open(function(event) {
		storage_write("customers", cust,
			appData.localWriteDbSuccess, appData.localWriteDbError)
	}, appData.localWriteDbOpenError);
}

function customers_filterHistory() {
	let start = vue.screen.data.start;
	let stop = vue.screen.data.stop;
	let custId = vue.screen.data.customer.id;
	srvcall_get("api/ticket/search?dateStart=" + (start.getTime() / 1000) + "&dateStop=" + (stop.getTime() / 1000) + "&customer=" + custId, _customers_historyCallback);
	gui_showLoading();
}

function _customers_historyCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, customers_filterHistory)) {
		return;
	}
	let tickets = JSON.parse(response);
	storage_open(function(event) {
		storage_readStore("products", function(data) {
			_customers_showHistory(tickets, data);
			storage_close();
		});
	});
}

function _customers_showHistory(tickets, products) {
	let prdById = {};
	let crById = {};
	let pmById = {};
	vue.screen.data.tickets = tickets;
	vue.screen.data.customers = [vue.screen.data.customer];
	for (let i = 0; i < products.length; i++) {
		let prd = products[i];
		prdById[prd.id] = prd;
	}
	for (let i = 0; i < vue.screen.data.cashRegisters.length; i++) {
		let cr = vue.screen.data.cashRegisters[i];
		crById[cr.id] = cr;
	}
	for (let i = 0; i < vue.screen.data.paymentModes.length; i++) {
		let pm = vue.screen.data.paymentModes[i];
		pmById[pm.id] = pm;
	}
	let consolidatedLineNum = {};
	let lines = [];
	let tktLines = [];
	for (let i = 0; i < tickets.length; i++) {
		let tkt = tickets[i];
		let date = (vue.screen.data.consolidate) ? null : new Date(tkt.date * 1000);
		let cr = crById[tkt.cashRegister];
		let number = (vue.screen.data.consolidate) ? "" : cr.label + "-" + tkt.number;
		let pmIds = {};
		let pms = [];
		let pmTotal = 0.0;
		for (let j = 0; j < tkt.payments.length; j++) {
			let payment = tkt.payments[j];
			let pm = pmById[payment.paymentMode];
			if (!(pm.id in pmIds)) {
				pmIds[pm.id] = pm.label;
			}
			pmTotal += tkt.payments[j].amount;
		}
		for (let key in pmIds) {
			pms.push(pmIds[key]);
		}
		let payments = pms.join(", ");
		let overPerceived = pmTotal - tkt.finalTaxedPrice;
		let tktDate = new Date(tkt.date * 1000);
		let user = "";
		for (let j = 0; j < vue.screen.data.users.length; j++) {
			if (vue.screen.data.users[j].id == tkt.user) {
				user = vue.screen.data.users[j].name;
				break;
			}
		}
		tktLines.push([cr.label, tkt.sequence, tkt.number, tktDate, payments,
			tkt.finalTaxedPrice, overPerceived, user,
			"<div class=\"btn-group pull-right\" role=\"group\"><button type=\"button\" class=\"btn btn-edit\" onclick=\"javascript:_tickets_selectTicket(vue.screen.data.tickets[" + i + "]);\">Sélectionner</a></div>"]);
		for (let j = 0; j < tkt.lines.length; j++) {
			let line = tkt.lines[j];
			// Set product data if any
			let prd = null;
			if (line.product != null && (line.product in prdById)) {
				prd = prdById[line.product];
			}
			let img;
			let ref = "";
			if (prd != null) {
				if (prd.hasImage) {
					img = login_getHostUrl() + "/api/image/product/" + prd.id + "?Token=" + login_getToken();
				} else {
					img = login_getHostUrl() + "/api/image/product/default?Token=" + login_getToken();
				}
				ref = prd.reference;
			} else {
				img = login_getHostUrl() + "/api/image/product/default?Token=" + login_getToken();
			}
			// Compute prices
			let finalTaxedPrice = line.finalTaxedPrice;
			let finalPrice = line.finalPrice;
			let price;
			let taxedPrice;
			if (line.finalTaxedPrice != null) {
				finalPrice = finalTaxedPrice / (1.0 + line.taxRate);
				taxedPrice = Math.round(line.taxedPrice / line.quantity * 100) / 100.0;
				price = taxedPrice / (1.0 + line.taxRate);
			} else {
				finalTaxedPrice = finalPrice * (1.0 + line.taxRate);
				price = line.price / line.quantity;
				taxedPrice = price * (1.0 + line.taxRate);
			}
			let consolidated = false;
			if (vue.screen.data.consolidate) {
				let lineRef = ref;
				if (lineRef == "") { // Custom product
					lineRef = "custom." + line.productLabel;
				}
				let lineId = lineRef + "-" + line.taxRate + "-" + line.price + "-" + line.discountRate + "-" + tkt.discountRate + "-" + pms;
				if (lineId in consolidatedLineNum) {
					// Consolidate quantities
					lines[consolidatedLineNum[lineId]][10] += line.quantity;
					lines[consolidatedLineNum[lineId]][12] += finalPrice;
					lines[consolidatedLineNum[lineId]][13] += finalTaxedPrice;
					consolidated = true;
				} else {
					consolidatedLineNum[lineId] = lines.length;
				}
			}
			if (!consolidated) {
				// Add new line
				lines.push([
					img,
					date,
					number,
					payments,
					tkt.discountRate,
					ref,
					line.productLabel,
					price,
					taxedPrice,
					line.taxRate,
					line.quantity,
					line.discountRate,
					finalPrice,
					finalTaxedPrice
				]);
			}
		}
	}
	// Convert number fo display
	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		if (vue.screen.data.consolidate) {
			line[1] = tools_dateToString(vue.screen.data.start) + " - " + tools_dateToString(vue.screen.data.stop);
		} else {
			line[1] = tools_dateTimeToString(line[1]);
		}
	}
	vue.screen.data.customerHistory.title("Purchase history from" + tools_dateToString(vue.screen.data.start) + " to " + tools_dateToString(vue.screen.data.stop));
	vue.screen.data.customerHistory.resetContent(lines);
	Vue.set(vue.screen.data, "ticketsTitle", "Tickets from  " + tools_dateToString(vue.screen.data.start) + " to " + tools_dateToString(vue.screen.data.stop));
	gui_hideLoading();
}

function customers_showImport() {
	storage_open(function(event) {
		storage_readStores(["customers", "discountprofiles", "tariffareas", "taxes"], function(data) {
			vue.screen.data = {
				"modelDef": CustomerDef,
				"customers": data.customers,
				"discountProfiles": data.discountprofiles,
				"tariffAreas": data.tariffareas,
				"taxes": data.taxes,
			}
			storage_close();
			CustomerDef.loadCustomizedContactFields(function(contactFields) {
				vue.screen.data.contactFields = contactFields;
				vue.screen.component = "vue-customer-import";
			});
		});
	});
}

function _customers_parseCsv(fileContent, callback) {
	gui_showLoading();
	CustomerDef.contactFieldList.forEach(f => {
		if (f in vue.screen.data.contactFields) {
			let customLabel = vue.screen.data.contactFields[f].value
			if (customLabel) {
				columnMappingDef[customLabel.toLowerCase()] = f;
			}
		}
	});
	storage_open(function(event) {
		storage_readStores(["customers", "discountprofiles", "tariffareas", "taxes"], function(data) {
			let parser = new CsvParser(CustomerDef, data.customers,
					[{modelDef: DiscountProfileDef, "records": data.discountprofiles},
					{modelDef: TariffAreaDef, "records": data.tariffareas},
					{modelDef: TaxDef, "records": data.taxes}]);
			let imported = parser.parseContent(fileContent);
			gui_hideLoading();
			storage_close();
			vue.screen.data.newCustomers = imported.newRecords;
			vue.screen.data.editedCustomers = imported.editedRecords;
			callback(imported);
		});
	});
}

function customers_saveCustomers() {
	let calls = [];
	for (let i = 0; i < vue.screen.data.newCustomers.length; i++) {
		let cust = vue.screen.data.newCustomers[i];
		calls.push({id: "new-" + i, method: "POST", target: "api/customer", data: cust});
	}
	for (let i = 0; i < vue.screen.data.editedCustomers.length; i++) {
		let cust = vue.screen.data.editedCustomers[i];
		calls.push({id: "edit-" + i, method: "POST", target: "api/customer", data: cust});
	}
	vue.screen.data.progress = 0;
	vue.screen.data.progressTotal = calls.length;
	gui_showProgress(vue.screen.data.progress, vue.screen.data.progressTotal);
	srvcall_multicall(calls, customers_saveMultipleCallback, _customers_progress);
}

function _customers_progress() {
	vue.screen.data.progress++;
	gui_showProgress(vue.screen.data.progress, vue.screen.data.progressTotal);
}

function customers_saveMultipleCallback(results) {
	if (Object.keys(results).length > 0) {
		let res = results[Object.keys(results)[0]];
		let showMsg = function() {
			gui_hideLoading();
			gui_showWarning("The data was not sent, please try the operation again.");

		}
		if (srvcall_callbackCatch(res.request, res.status, res.response, showMsg)) {
			return;
		}
	}
	errors = [];
	saves = [];
	for (let reqId in results) {
		let request = results[reqId].request;
		let status = results[reqId].status;
		let response = results[reqId].response;
		if (status == 400) {
			errors.push("Something is wrong with the form data. " + request.statusText);
			continue;
		}
		let respCust = JSON.parse(response);
		if (reqId.substr(0, 4) == "new-") {
			let num = parseInt(reqId.substr(4));
			let cust = vue.screen.data.newCustomers[num];
			if (cust.expireDate != null) {
				cust.expireDate = respCust.expireDate; // stay in sync with the server's format
			}
			cust.id = respCust.id;
			saves.push(cust);
		} else {
			let num = parseInt(reqId.substr(5));
			let cust = vue.screen.data.editedCustomers[num];
			if (cust.expireDate != null) {
				cust.expireDate = respCust.expireDate; // stay in sync with the server's format
			}
			saves.push(cust);
		}
	}
	// Commit changes locally
	let commitSuccess = function(data) {
		gui_hideLoading();
		if (errors.length > 0) {
			if (saves.length > 0) {
				// errors.push("Les autres enregistrements ont été pris en compte. Vous pouvez recharger le fichier pour retrouver les erreurs.");
				errors.push("The other records have been processed. You can reload the file to find the errors.");

			}
			gui_showError(errors);
		} else {
			gui_showMessage("The data has been saved.");
		}
		vue.screen.data = {};
		vue.$refs.screenComponent.reset();
		customers_showImport();
	}
	if (saves.length == 0) {
		gui_hideLoading();
		if (errors.length == 0) {
			gui_showErrors("No operation.");
		} else {
			gui_showErrors(errors);
		}
	} else {
		storage_open(function(event) {
			storage_write("customers", saves,
				commitSuccess, appData.localWriteDbError);
		}, appData.localWriteDbOpenError);
	}
}
function ztickets_show() {
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	vue.screen.data = {
		"start": start,
		"stop": stop,
		"addZeros": false,
		"includeUnusedPayments": false,
		"includeUnusedTaxes": false,
		"includeUnusedCategories": false,
		"table": new Table().reference("zticket-list")
	}
	vue.screen.component = "vue-zticket-list";
}

function ztickets_filter() {
	let start = vue.screen.data.start;
	let stop = vue.screen.data.stop;
	start = start.getFullYear() + "-" + (start.getMonth() + 1) + "-" + start.getDate();
	//stop = stop.getFullYear() + "-" + (stop.getMonth() + 1) + "-" + stop.getDate();
	srvcall_get("api/cash/search/?dateStart=" + start + "&dateStop=" + (stop.getTime() / 1000), _ztickets_filterCallback);
	gui_showLoading();
}

function _ztickets_filterCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, ztickets_filter)) {
		return;
	}
	let zTickets = JSON.parse(response);
	storage_open(function(event) {
		storage_readStores(["cashRegisters", "taxes", "categories", "paymentmodes", "customers"], function(data) {
			_parseZTickets(data["cashRegisters"], data["paymentmodes"],
				data["taxes"], data["categories"], data["customers"], zTickets);
			storage_close();
		});
	});
}

function _parseZTickets(cashRegisters, paymentModes, taxes, categories, customers, zTickets) {
	// Collect the listed taxes, payment modes and cat taxes
	let catTaxes = [];
	let total = {
		"tickets": 0,
		"cs": 0.0,
		"csTaxesTotal": 0.0,
		"errorTotal": 0.0,
		"custBalance": 0.0,
		"paymentModeTotal": [],
		"taxTotal": [],
		"categoryTotal": [],
		"catTaxTotal": [],
		"custBalanceTotal": [],
		"overPerceivedTotal": 0.0,
	};
	for (let i = 0; i < categories.length; i++) {
		for (let j = 0; j < taxes.length; j++) {
			catTaxes.push(JSON.parse(JSON.stringify(taxes[j])));
			catTaxes[i * taxes.length + j]["cat"] = categories[i]["label"];
		}
	}
	let cashRegistersById = [];
	for (let i = 0; i < cashRegisters.length; i++) {
		let cr = cashRegisters[i];
		cashRegistersById[cr.id] = cr;
	}
	let renderZs = [];
	let keptPayments = [];
	let keptTaxes = [];
	let keptCategories = [];
	let keptCatTaxes = [];
	let keptCustBalances = [];
	for (let i = 0; i < paymentModes.length; i++) {
		keptPayments[i] = false;
	}
	for (let i = 0; i < taxes.length; i++) {
		keptTaxes[i] = false;
	}
	for (let i = 0; i < categories.length; i++) {
		keptCategories[i] = false;
	}
	for (let i = 0; i < categories.length; i++) {
		for (let j = 0; j < taxes.length; j++) {
			keptCatTaxes[i * taxes.length + j] = false;
		}
	}
	for (let i = 0; i < customers.length; i++) {
		keptCustBalances[i] = false;
	}
	// Build the full data
	for (let i = 0; i < zTickets.length; i++) {
		let z = zTickets[i];
		let openDate = new Date(z.openDate * 1000);
		let closeDate = new Date(z.closeDate * 1000);
		let cashRegister = "";
		if (z.cashRegister in cashRegistersById) {
			cashRegister = cashRegistersById[z.cashRegister].label;
		}
		let closeError = 0.0;
		if (z.closeCash != null && z.expectedCash != null) {
			closeError = z.closeCash - z.expectedCash;
		}
		let csTaxes = z.cs;
		let closeErrorDisplay = closeError.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
		let renderZ = {
			"cashRegister": cashRegister,
			"sequence": z.sequence,
			"openDate": openDate,
			"closeDate": closeDate,
			"openCash": (z.openCash != null) ? z.openCash : "",
			"closeCash": (z.closeCash != null) ? z.closeCash : "",
			"expectedCash": (z.expectedCash != null) ? z.expectedCash : "",
			"closeError": closeError > 0 ? "+" + closeErrorDisplay : closeErrorDisplay,
			"ticketCount": z.ticketCount,
			"cs": z.cs,
			"csPeriod": z.csPeriod,
			"csFYear": z.csFYear,
			"csPerpetual": (z.csPerpetual) ? z.csPerpetual : "",
			"custBalance": 0.0,
			"payments": [],
			"taxes": [],
			"categories": [],
			"catTaxes": [],
			"custBalances": [],
		}
		let paymentTotal = 0.0;
		for (let j = 0; j < paymentModes.length; j++) {
			let pm = paymentModes[j];
			let found = false;
			let renderZIndex = 0;
			for (let k = 0; k < z.payments.length; k++) {
				let pmt = z.payments[k];
				if (pmt.paymentMode == pm.id) {
					if (found) {
						renderZ.payments[renderZIndex].amount += pmt.amount;
					} else {
						renderZIndex = renderZ.payments.length;
						renderZ.payments.push({"amount": pmt.amount});
					}
					paymentTotal += pmt.amount;
					found = true;
					keptPayments[j] = true;
				}
			}
			if (!found) {
				if (vue.screen.data.addZeros) {
					renderZ.payments.push({"amount": 0.0});
				} else {
					renderZ.payments.push({"amount": ""});
				}
			} else {
				renderZ.payments[renderZIndex].amount = renderZ.payments[renderZIndex].amount;
			}
		}
		for (let j = 0; j < taxes.length; j++) {
			let tax = taxes[j];
			let found = false;
			for (let k = 0; k < z.taxes.length; k++) {
				if (z.taxes[k].tax == tax.id) {
					renderZ.taxes.push({"base": z.taxes[k].base,
						"amount": z.taxes[k].amount});
					csTaxes += z.taxes[k].amount;
					found = true;
					keptTaxes[j] = true;
					break;
				}
			}
			if (!found) {
				if (vue.screen.data.addZeros) {
					renderZ.taxes.push({"base": 0.0, "amount": 0.0});
				} else {
					renderZ.taxes.push({"base": "", "amount": ""});
				}
			}
		}
		renderZ.csTaxes = csTaxes;
		let overPerceived = paymentTotal - csTaxes;
		renderZ.overPerceived = overPerceived;
		for (let j = 0; j < categories.length; j++) {
			let cat = categories[j];
			let found = false;
			for (let k = 0; k < z.catSales.length; k++) {
				if (z.catSales[k].reference == cat.reference) {
					renderZ.categories.push({"amount": z.catSales[k].amount});
					found = true;
					keptCategories[j] = true;
					break;
				}
			}
			if (!found) {
				if (vue.screen.data.addZeros) {
					renderZ.categories.push({"amount": 0.0});
				} else {
					renderZ.categories.push({"amount": ""});
				}
			}
		}
		for (let j = 0; j < categories.length; j++) {
			let cat = categories[j]
			for (let j2 = 0; j2 < taxes.length; j2++) {
				let tax = taxes[j2]
				let found = false;
				for (let k = 0; k < z.catTaxes.length; k++) {
					if (z.catTaxes[k].reference == cat.reference && z.catTaxes[k].tax == tax.id) {
						renderZ.catTaxes.push({"base": z.catTaxes[k].base,
							"amount": z.catTaxes[k].amount});
						found = true;
						keptCatTaxes[j * taxes.length + j2] = true;
						break;
					}
				}
				if (!found) {
					if (vue.screen.data.addZeros) {
						renderZ.catTaxes.push({"base": 0.0, "amount": 0.0});
					} else {
						renderZ.catTaxes.push({"base": "", "amount": ""});
					}
				}
			}
		}
		for (let j = 0; j < customers.length; j++) {
			let customer = customers[j];
			let found = false;
			for (let k = 0; k < z.custBalances.length; k++) {
				if (z.custBalances[k].id.customer == customer.id) {
					renderZ.custBalances.push({"amount": z.custBalances[k].balance});
					renderZ.custBalance += z.custBalances[k].balance;
					found = true;
					keptCustBalances[j] = true;
					break;
				}
			}
			if (!found) {
				if (vue.screen.data.addZeros) {
					renderZ.custBalances.push({"amount": 0.0});
				} else {
					renderZ.custBalances.push({"amount": ""});
				}
			}
		}
		renderZ.custBalance = renderZ.custBalance;
		renderZs.push(renderZ);
	}
	// Remove the empty columns
	let spliced = 0;
	if (!vue.screen.data.includeUnusedPayments) {
		for (let i = 0; i < keptPayments.length; i++) {
			if (!keptPayments[i]) {
				for (let j = 0; j < renderZs.length; j++) {
					renderZs[j]["payments"].splice(i - spliced, 1);
				}
				paymentModes.splice(i - spliced, 1);
				spliced++;
			}
		}
	}
	spliced = 0;
	if (!vue.screen.data.includeUnusedTaxes) {
		for (let i = 0; i < keptTaxes.length; i++) {
			if (!keptTaxes[i]) {
				for (let j = 0; j < renderZs.length; j++) {
					renderZs[j]["taxes"].splice(i - spliced, 1);
				}
				taxes.splice(i - spliced, 1);
				spliced++;
			}
		}
	}
	spliced = 0;
	if (!vue.screen.data.includeUnusedCategories) {
		for (let i = 0; i < keptCategories.length; i++) {
			if (!keptCategories[i]) {
				for (let j = 0; j < renderZs.length; j++) {
					renderZs[j]["categories"].splice(i - spliced, 1);
				}
				categories.splice(i - spliced, 1);
				spliced++;
			}
		}
	}
	spliced = 0;
	for (let i = 0; i < keptCatTaxes.length; i++) {
		if (!keptCatTaxes[i]) {
			for (let j = 0; j < renderZs.length; j++) {
				renderZs[j]["catTaxes"].splice(i - spliced, 1);
			}
			catTaxes.splice(i - spliced, 1);
			spliced++;
		}
	}
	spliced = 0;
	for (let i = 0; i < keptCustBalances.length; i++) {
		if (!keptCustBalances[i]) {
			for (let j = 0; j < renderZs.length; j++) {
				renderZs[j]["custBalances"].splice(i - spliced, 1);
			}
			customers.splice(i - spliced, 1);
			spliced++;
		}
	}
	// Set table
	let oldColumns = vue.screen.data.table.columns;
	let oldColumnVisible = function(label, old, default_val) {
		for (let i = 0; i < old.length; i++) {
			if (old[i].label == label) {
				return old[i].isVisible;
			}
		}
		return default_val;
	};
	vue.screen.data.table.reset();
	vue.screen.data.table.title("Tickets Z du " + tools_dateToString(vue.screen.data.start) + " au " + tools_dateToString(vue.screen.data.stop));
	vue.screen.data.table
		// .column(new TableCol().reference("cashRegister").label("Caisse").visible(oldColumnVisible("Caisse", oldColumns, true)).help("Le nom de la caisse."))
		// .column(new TableCol().reference("sequence").label("N°").type(TABLECOL_TYPE.NUMBER).visible(oldColumnVisible("N°", oldColumns, true)).help("Le numéro de séquence de la session de caisse."))
		// .column(new TableCol().reference("openDate").label("Ouverture").type(TABLECOL_TYPE.DATETIME).visible(oldColumnVisible("Ouverture", oldColumns, true)).help("La date et heure d'ouverture de la session de caisse."))
		// .column(new TableCol().reference("closeDate").label("Clôture").type(TABLECOL_TYPE.DATETIME).visible(oldColumnVisible("Clôture", oldColumns, true)).help("La date et heure de clôture de la session de caisse."))
		// .column(new TableCol().reference("openCash").label("Fond ouverture").type(TABLECOL_TYPE.NUMBER2).visible(oldColumnVisible("Fond ouverture", oldColumns, true)).help("Le montant du fond de caisse compté à l'ouverture."))
		// .column(new TableCol().reference("closeCash").label("Fond clôture").type(TABLECOL_TYPE.NUMBER2).visible(oldColumnVisible("Fond clôture", oldColumns, true)).help("Le montant du fond de caisse compté à la clôture."))
		// .column(new TableCol().reference("expectedCash").label("Fond attendu").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.CUSTOM, "Totaux").visible(oldColumnVisible("Fond attendu", oldColumns, true)).help("Le montant du fond de caisse attendu à la clôture, calculé à partir du fond de caisse à l'ouverture et des encaissements."))
		// .column(new TableCol().reference("cashError").label("Erreur de caisse").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Erreur de caisse", oldColumns, true)).help("L'écart entre le fond de caisse à la clôture et le fond de caisse attendu. Lorsqu'il est positif, il y avait trop de monnaie, lorsque négatif, il en manquait."))
		// .column(new TableCol().reference("tickets").label("Tickets").type(TABLECOL_TYPE.NUMBER).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Tickets", oldColumns, false)).help("Le nombre de tickets réalisés sur la session de caisse."))
		// .column(new TableCol().reference("cs").label("CA HT").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("CA", oldColumns, true)).class("z-oddcol").help("Le montant total du chiffre d'affaire hors taxes réalisé pendant la session."))
		// .column(new TableCol().reference("csPeriod").label("CA HT mois").type(TABLECOL_TYPE.NUMBER2).visible(oldColumnVisible("CA mois", oldColumns, false)).class("z-oddcol").help("Le cumul du chiffre d'affaire réalisé sur la période. Ce cumul est remis à zéro lorsque la clôture mensuelle est choisie au moment de clôturer la caisse."))
		// .column(new TableCol().reference("csFYear").label("CA HT année").type(TABLECOL_TYPE.NUMBER2).visible(oldColumnVisible("CA année", oldColumns, false)).class("z-oddcol").help("Le cumul du chiffre d'affaire réalisé sur l'année ou exercice fiscal. Ce cumul est remis à zéro lorsque la clôture annuelle est choisie au moment de clôturer la caisse."))
		// .column(new TableCol().reference("csPerpetual").label("CA HT perpétuel").type(TABLECOL_TYPE.NUMBER2).visible(oldColumnVisible("CA perpétuel", oldColumns, false)).class("z-oddcol").help("Le cumul perpetuel du chiffre d'affaire réalisé avec cette caisse. Ce cumul n'est jamais remis à zéro."))
		// .column(new TableCol().reference("csTaxes").label("CA + taxes").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("CA + taxes", oldColumns, false)).class("z-oddcol").help("Le total TTC de la session."))
		// .column(new TableCol().reference("custBalance").label("Balance client").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Balance client", oldColumns, false)).class("z-oddcol").help("La variation totale des soldes des comptes clients. En positif pour les recharges pré-payés ou remboursements, en négatif pour les dépenses ou dettes."));
		//

		.column(new TableCol().reference("cashRegister").label("Register").visible(oldColumnVisible("Register", oldColumns, true)).help("The name of the register."))
		.column(new TableCol().reference("sequence").label("No.").type(TABLECOL_TYPE.NUMBER).visible(oldColumnVisible("No.", oldColumns, true)).help("The session sequence number of the register."))
		.column(new TableCol().reference("openDate").label("Opening").type(TABLECOL_TYPE.DATETIME).visible(oldColumnVisible("Opening", oldColumns, true)).help("The date and time when the register session was opened."))
		.column(new TableCol().reference("closeDate").label("Closing").type(TABLECOL_TYPE.DATETIME).visible(oldColumnVisible("Closing", oldColumns, true)).help("The date and time when the register session was closed."))
		.column(new TableCol().reference("openCash").label("Opening float").type(TABLECOL_TYPE.NUMBER2).visible(oldColumnVisible("Opening float", oldColumns, true)).help("The amount of cash counted at opening."))
		.column(new TableCol().reference("closeCash").label("Closing float").type(TABLECOL_TYPE.NUMBER2).visible(oldColumnVisible("Closing float", oldColumns, true)).help("The amount of cash counted at closing."))
		.column(new TableCol().reference("expectedCash").label("Expected float").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.CUSTOM, "Totals").visible(oldColumnVisible("Expected float", oldColumns, true)).help("The expected amount of cash at closing, calculated from the opening float and payments."))
		.column(new TableCol().reference("cashError").label("Cash error").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Cash error", oldColumns, true)).help("The difference between the actual and expected cash at closing. A positive value indicates excess cash, a negative value indicates a shortage."))
		.column(new TableCol().reference("tickets").label("Receipts").type(TABLECOL_TYPE.NUMBER).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Receipts", oldColumns, false)).help("The number of receipts issued during the register session."))
		.column(new TableCol().reference("cs").label("Sales excl. VAT").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Sales", oldColumns, true)).class("z-oddcol").help("The total sales amount excluding VAT during the session."))
		.column(new TableCol().reference("csPeriod").label("Monthly sales excl. VAT").type(TABLECOL_TYPE.NUMBER2).visible(oldColumnVisible("Monthly sales", oldColumns, false)).class("z-oddcol").help("The accumulated sales amount over the current period. This is reset when monthly closing is selected at register closure."))
		.column(new TableCol().reference("csFYear").label("Annual sales excl. VAT").type(TABLECOL_TYPE.NUMBER2).visible(oldColumnVisible("Annual sales", oldColumns, false)).class("z-oddcol").help("The accumulated sales amount over the fiscal year. This is reset when annual closing is selected at register closure."))
		.column(new TableCol().reference("csPerpetual").label("Perpetual sales excl. VAT").type(TABLECOL_TYPE.NUMBER2).visible(oldColumnVisible("Perpetual sales", oldColumns, false)).class("z-oddcol").help("The perpetual accumulated sales amount for this register. This is never reset."))
		.column(new TableCol().reference("csTaxes").label("Sales incl. taxes").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Sales incl. taxes", oldColumns, false)).class("z-oddcol").help("The total including taxes for the session."))
		.column(new TableCol().reference("custBalance").label("Customer balance").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Customer balance", oldColumns, false)).class("z-oddcol").help("The total variation of customer account balances. Positive for pre-paid top-ups or refunds, negative for expenses or debts."))

	// for (let i = 0; i < paymentModes.length; i++) {
	// 	let pm = paymentModes[i];
	// 	vue.screen.data.table.column(new TableCol().reference("pm-" + pm.reference).label(pm.label).type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(pm.label, oldColumns, true)).help("Le montant des encaissements réalisés avec ce moyen de paiement sur la session."));
	// }
	// vue.screen.data.table.column(new TableCol().reference("overPerceived").label("Produit exceptionnel").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Produit exceptionnel", oldColumns, false)).help("Le montant trop perçu pour les modes de paiement sans rendu-monnaie ou les arrondis de TVA sur remises."));
	// for (let i = 0; i < taxes.length; i++) {
	// 	let tax = taxes[i];
	// 	vue.screen.data.table.column(new TableCol().reference("tax-" + i + "-base").label(tax.label + " base").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(tax.label + " base", oldColumns, false)).class("z-oddcol").help("Le montant de chiffre d'affaire hors taxe associé au taux de TVA."));
	// 	vue.screen.data.table.column(new TableCol().reference("tax-" + i + "-amount").label(tax.label + " TVA").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(tax.label + " TVA", oldColumns, false)).class("z-oddcol").help("Le montant de TVA collectée associé au taux de TVA."));
	// }
	// for (let i = 0; i < categories.length; i++) {
	// 	let cat = categories[i];
	// 	vue.screen.data.table.column(new TableCol().reference("cat-" + cat.reference + "-cs").label(cat.label).type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(cat.label, oldColumns, false)).help("Le montant de chiffre d'affaire hors taxe réalisé dans cette catégorie de produit (indicatif)."));
	// }
	// for (let i = 0; i < catTaxes.length; i++) {
	// 	let catTax = catTaxes[i];
	// 	vue.screen.data.table.column(new TableCol().reference("catTax-" + i + "-base").label(catTax.cat + " " + catTax.label + " base").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(catTax.cat + " " + catTax.label + " base", oldColumns, false)).class("z-oddcol").help("Le montant de chiffre d'affaire hors taxe réalisé dans cette catégorie pour ce taux de TVA (indicatif)."));
	// 	vue.screen.data.table.column(new TableCol().reference("catTax-" + i + "-amount").label(catTax.cat + " " + catTax.label + " TVA").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(catTax.cat + " " + catTax.label + " TVA", oldColumns, false)).class("z-oddcol").help("Le montant de TVA collectée pour cette catégorie pour ce taux de TVA (indicatif)."));
	// }
	// for (let i = 0; i < customers.length; i++) {
	// 	let customer = customers[i];
	// 	vue.screen.data.table.column(new TableCol().reference("cust-" + customer.id + "-balance").label(customer.dispName).type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(customer.dispName, oldColumns, false)).help("La variation du solde client"));
	// }

	for (let i = 0; i < paymentModes.length; i++) {
		let pm = paymentModes[i];
		vue.screen.data.table.column(new TableCol().reference("pm-" + pm.reference).label(pm.label).type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(pm.label, oldColumns, true)).help("The amount of payments made using this payment method during the session."));
	}
	vue.screen.data.table.column(new TableCol().reference("overPerceived").label("Exceptional income").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Exceptional income", oldColumns, false)).help("The overpaid amount for payment methods without change or VAT rounding on discounts."));
	for (let i = 0; i < taxes.length; i++) {
		let tax = taxes[i];
		vue.screen.data.table.column(new TableCol().reference("tax-" + i + "-base").label(tax.label + " base").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(tax.label + " base", oldColumns, false)).class("z-oddcol").help("The VAT-excluded revenue amount associated with this VAT rate."));
		vue.screen.data.table.column(new TableCol().reference("tax-" + i + "-amount").label(tax.label + " VAT").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(tax.label + " VAT", oldColumns, false)).class("z-oddcol").help("The VAT amount collected associated with this VAT rate."));
	}
	for (let i = 0; i < categories.length; i++) {
		let cat = categories[i];
		vue.screen.data.table.column(new TableCol().reference("cat-" + cat.reference + "-cs").label(cat.label).type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(cat.label, oldColumns, false)).help("The VAT-excluded sales revenue made in this product category (indicative)."));
	}
	for (let i = 0; i < catTaxes.length; i++) {
		let catTax = catTaxes[i];
		vue.screen.data.table.column(new TableCol().reference("catTax-" + i + "-base").label(catTax.cat + " " + catTax.label + " base").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(catTax.cat + " " + catTax.label + " base", oldColumns, false)).class("z-oddcol").help("The VAT-excluded sales revenue made in this category for this VAT rate (indicative)."));
		vue.screen.data.table.column(new TableCol().reference("catTax-" + i + "-amount").label(catTax.cat + " " + catTax.label + " VAT").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(catTax.cat + " " + catTax.label + " VAT", oldColumns, false)).class("z-oddcol").help("The VAT amount collected for this category for this VAT rate (indicative)."));
	}
	for (let i = 0; i < customers.length; i++) {
		let customer = customers[i];
		vue.screen.data.table.column(new TableCol().reference("cust-" + customer.id + "-balance").label(customer.dispName).type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(customer.dispName, oldColumns, false)).help("The variation in the customer's balance"));
	}

	for (let i = 0; i < renderZs.length; i++) {
		let z = renderZs[i];
		let line = [z.cashRegister, z.sequence, z.openDate, z.closeDate, z.openCash, z.closeCash, z.expectedCash,
			z.closeError, z.ticketCount, z.cs, z.csPeriod, z.csFYear, z.csPerpetual, z.csTaxes, z.custBalance];
		for (let j = 0; j < z.payments.length; j++) {
			line.push(z.payments[j].amount);
		}
		line.push(z.overPerceived);
		for (let j = 0; j < z.taxes.length; j++) {
			line.push(z.taxes[j].base);
			line.push(z.taxes[j].amount);
		}
		for (let j = 0; j < z.categories.length; j++) {
			line.push(z.categories[j].amount);
		}
		for (let j = 0; j < z.catTaxes.length; j++) {
			line.push(z.catTaxes[j].base);
			line.push(z.catTaxes[j].amount);
		}
		for (let j = 0; j < z.custBalances.length; j++) {
			line.push(z.custBalances[j].amount);
		}
		vue.screen.data.table.line(line);
	}
	if (renderZs.length == 0) {
		vue.screen.data.table.noResult();
	}
	vue.$refs.screenComponent.$refs.zTable.restoreDefaultPreferences();
	gui_hideLoading();
}


var _tickets_data = {};

function tickets_show() {
	let start = new Date();
	start.setHours(4);
	start.setMinutes(0);
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	storage_open(function(event) {
		storage_readStores(["cashRegisters", "taxes", "paymentmodes", "users", "customers"], function(data) {
			if (data["cashRegisters"].length > 0) {
				cr = data["cashRegisters"][0].id;
			}
			vue.screen.data = {
				"start": start,
				"stop": stop,
				"cashRegisters": data["cashRegisters"],
				"taxes": data["taxes"],
				"paymentModes": data["paymentmodes"],
				"users": data["users"],
				"customers": data["customers"],
				"cashRegisterId": cr
			};
			vue.screen.component = "vue-tickets-list";
		});
	});
}

function tickets_search() {
	let start = vue.screen.data.start;
	let stop = vue.screen.data.stop;
	let crId = vue.screen.data.cashRegisterId;
	_tickets_data = {"start": start.getTime() / 1000,
		"stop": stop.getTime() / 1000,
		"crId": crId,
		"pages": 0,
		"currentPage": 0,
		"tickets": []
	};
	if (crId != "") {
		srvcall_get("api/ticket/search?count=1&cashRegister=" + encodeURIComponent(crId) + "&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_countCallback);
	} else {
		srvcall_get("api/ticket/search?count=1&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_countCallback);
	}
	gui_showLoading();
}

function _tickets_countCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, tickets_search)) {
		return;
	}
	let count = parseInt(response);
	let pages = parseInt(count / 100);
	if (count % 100 > 0) {
		pages++;
	}
	_tickets_data.pages = pages;
	gui_showProgress(0, pages);
	if (_tickets_data.crId != "") {
		srvcall_get("api/ticket/search?limit=100&cashRegister=" + encodeURIComponent(_tickets_data.crId) + "&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_filterCallback);
	} else {
		srvcall_get("api/ticket/search?limit=100&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_filterCallback);
	}
}

function _tickets_filterCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, tickets_search)) {
		return;
	}
	let tickets = JSON.parse(response);
	for (let i = tickets.length - 1; i >= 0; i--) {
		_tickets_data.tickets.push(tickets[i]);
	}
	_tickets_data.currentPage++;
	if (_tickets_data.currentPage < _tickets_data.pages) {
		gui_showProgress(_tickets_data.currentPage, _tickets_data.pages);
		if (_tickets_data.crId != "") {
			srvcall_get("api/ticket/search?limit=100&offset=" + (100 * _tickets_data.currentPage) + "&cashRegister=" + encodeURIComponent(_tickets_data.crId) + "&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_filterCallback);
		} else {
			srvcall_get("api/ticket/search?limit=100&offset=" + (100 * _tickets_data.currentPage) + "&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_filterCallback);
		}
	} else {
		_tickets_dataRetreived();
	}
}

function _tickets_dataRetreived() {
	gui_hideLoading();
	Vue.set(vue.screen.data, "tableTitle", "Tickets du " + tools_dateToString(vue.screen.data.start) + " au " + tools_dateToString(vue.screen.data.stop));
	Vue.set(vue.screen.data, "tickets", _tickets_data.tickets);
}

var _salesbyproduct_data = {};

function salesbyproduct_show() {
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	vue.screen.data = {
		"start": start,
		"stop": stop,
		"includeArchives": false,
		"includeZero": true,
		"separateCashRegisters": false,
		"separateTaxes": false,
		"table": new Table().reference("salesByProduct-list")
	}
	vue.screen.component = "vue-salesbyproduct";
}

function salesbyproduct_filter() {
	let start = vue.screen.data.start;
	let stop = vue.screen.data.stop;
	_salesbyproduct_data = {"start": start.getTime() / 1000,
		"stop": stop.getTime() / 1000,
		"pages": 0,
		"currentPage": 0,
		"separateByCR": vue.screen.data.separateCashRegisters,
		"separateByTax": vue.screen.data.separateTaxes,
		"products": {},
		"customProducts": {},
		"initSalesData": function() {
			return {
				"qty": 0,
				"price": 0.0,
				"priceTax": 0.0,
				"tax": 0.0,
				"taxDetails": {},
			};
		},
	};
	srvcall_get("api/ticket/search?count=1&dateStart=" + _salesbyproduct_data.start + "&dateStop=" + _salesbyproduct_data.stop, _salesbyproduct_countCallback);
	gui_showLoading();
}

function _salesbyproduct_countCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, salesbyproduct_filter)) {
		return;
	}
	let count = parseInt(response);
	let pages = parseInt(count / 100);
	if (count % 100 > 0) {
		pages++;
	}
	_salesbyproduct_data.pages = pages;
	gui_showProgress(0, pages);
	srvcall_get("api/ticket/search?limit=100&dateStart=" + _salesbyproduct_data.start + "&dateStop=" + _salesbyproduct_data.stop, _salesbyproduct_filterCallback); 
}

function _salesbyproduct_filterCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, salesbyproduct_filter)) {
		return;
	}
	let tickets = JSON.parse(response);
	for (let i = 0; i < tickets.length; i++) {
		let ticket = tickets[i];
		for (let j = 0; j < ticket.lines.length; j++) {
			let line = ticket.lines[j];
			// Initialize product data for the first time
			if (line.product != null) {
				if (!(line.product in _salesbyproduct_data.products)) {
					if (_salesbyproduct_data.separateByCR) {
						_salesbyproduct_data.products[line.product] = {};
					} else {
						_salesbyproduct_data.products[line.product] = _salesbyproduct_data.initSalesData();
					}
				}
				if (_salesbyproduct_data.separateByCR) {
					if (!(ticket.cashRegister in _salesbyproduct_data.products[line.product])) {
						_salesbyproduct_data.products[line.product][ticket.cashRegister] = _salesbyproduct_data.initSalesData();
					}
				}
			} else {
				if (!(line.productLabel in _salesbyproduct_data.customProducts)) {
					if (_salesbyproduct_data.separateByCR) {
						_salesbyproduct_data.customProducts[line.productLabel] = {};
					} else {
						_salesbyproduct_data.customProducts[line.productLabel] = _salesbyproduct_data.initSalesData();
					}
				}
				if (_salesbyproduct_data.separateByCR) {
					if (!(ticket.cashRegister in _salesbyproduct_data.customProducts[line.productLabel])) {
						_salesbyproduct_data.customProducts[line.productLabel][ticket.cashRegister] = _salesbyproduct_data.initSalesData();
					}
				}
			}
			// Pick the correct sales data
			let salesData = null;
			if (line.product != null) {
				if (_salesbyproduct_data.separateByCR) {
					salesData = _salesbyproduct_data.products[line.product][ticket.cashRegister];
				} else {
					salesData = _salesbyproduct_data.products[line.product];
				}
			} else {
				if (_salesbyproduct_data.separateByCR) {
					salesData = _salesbyproduct_data.customProducts[line.productLabel][ticket.cashRegister];
				} else {
					salesData = _salesbyproduct_data.customProducts[line.productLabel];
				}
			}
			// Update the sales data
			let price = (line.finalTaxedPrice / (1.0 + line.taxRate));
			salesData.qty += line.quantity;
			salesData.priceTax += line.finalTaxedPrice;
			salesData.price += price;
			// Include tax details
			if (!(line.tax in salesData.taxDetails)) {
				salesData.taxDetails[line.tax] = {"base": 0.0, "amount": 0.0};
			}
			salesData.taxDetails[line.tax].base += price;
			salesData.taxDetails[line.tax].amount += line.finalTaxedPrice - price;
		}
	}
	_salesbyproduct_data.currentPage++;
	if (_salesbyproduct_data.currentPage < _salesbyproduct_data.pages) {
		gui_showProgress(_salesbyproduct_data.currentPage, _salesbyproduct_data.pages);
		srvcall_get("api/ticket/search?limit=100&offset=" + (100 * _salesbyproduct_data.currentPage) + "&dateStart=" + _salesbyproduct_data.start + "&dateStop=" + _salesbyproduct_data.stop, _salesbyproduct_filterCallback); 
	} else {
		_salesbyproduct_dataRetreived();
	}
}

function _salesbyproduct_dataRetreived() {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStores(["categories", "products", "cashRegisters", "taxes"], function(data) {
			let cr = null;
			let taxes = null;
			if (vue.screen.data.separateCashRegisters) {
				cr = data["cashRegisters"];
			}
			if (vue.screen.data.separateTaxes) {
				taxes = data["taxes"];
			}
			_salesbyproduct_render(cr, data["categories"], data["products"], taxes);
			storage_close();
		});
	});
}

function _salesbyproduct_render(cashRegisters, categories, products, taxes) {
	// Sort for display
	let separateByCR = cashRegisters != null;
	if (cashRegisters != null) {
		cashRegisters = cashRegisters.sort(tools_sort("reference"));
	}
	let separateByTax = taxes != null;
	if (vue.screen.data.includeZero) {
		// Initialize all missing products
		if (separateByCR) {
			for (let i = 0; i < products.length; i++) {
				let prd = products[i];
				if (prd.visible || vue.screen.data.includeArchives) {
					if (!(prd.id in _salesbyproduct_data.products)) {
						_salesbyproduct_data.products[prd.id] = {};
					}
					for (let j = 0; j < cashRegisters.length; j++) {
						let cashRegister = cashRegisters[j];
						if (!(cashRegister.id in _salesbyproduct_data.products[prd.id])) {
							_salesbyproduct_data.products[prd.id][cashRegister.id] = _salesbyproduct_data.initSalesData();
						}
					}
				}
			}
			for (let prdLabel in _salesbyproduct_data.customProducts) {
				for (let j = 0; j < cashRegisters.length; j++) {
					let cashRegister = cashRegisters[j];
					if (!(cashRegister.id in _salesbyproduct_data.customProducts[prdLabel])) {
						_salesbyproduct_data.customProducts[prdLabel][cashRegister.id] = _salesbyproduct_data.initSalesData();
					}
				}
			}
		} else {
			for (let i = 0; i < products.length; i++) {
				let prd = products[i];
				if (prd.visible || vue.screen.data.includeArchives) {
					if (!(prd.id in _salesbyproduct_data.products)) {
						_salesbyproduct_data.products[prd.id] = _salesbyproduct_data.initSalesData();
					}
				}
			}
		}
	}
	// Fill missing tax detail with 0
	if (separateByTax) {
		for (let prdId in _salesbyproduct_data.products) {
			if (separateByCR) {
				for (let cr in _salesbyproduct_data.products[prdId]) {
					for (let i = 0; i < taxes.length; i++) {
						let tax = taxes[i];
						if (!(tax.id in _salesbyproduct_data.products[prdId][cr].taxDetails)) {
							_salesbyproduct_data.products[prdId][cr].taxDetails[tax.id] = {"base": 0.0, "amount": 0.0};
						}
					}
				}
			} else {
				for (let i = 0; i < taxes.length; i++) {
					let tax = taxes[i];
					if (!(tax.id in _salesbyproduct_data.products[prdId].taxDetails)) {
						_salesbyproduct_data.products[prdId].taxDetails[tax.id] = {"base": 0.0, "amount": 0.0};
					}
				}
			}
		}
		for (let prdId in _salesbyproduct_data.customProducts) {
			if (separateByCR) {
				for (let cr in _salesbyproduct_data.customProducts[prdId]) {
					for (let i = 0; i < taxes.length; i++) {
						let tax = taxes[i];
						if (!(tax.id in _salesbyproduct_data.customProducts[prdId][cr].taxDetails)) {
							_salesbyproduct_data.customProducts[prdId][cr].taxDetails[tax.id] = {"base": 0.0, "amount": 0.0};
						}
					}
				}
			} else {
				for (let i = 0; i < taxes.length; i++) {
					let tax = taxes[i];
					if (!(tax.id in _salesbyproduct_data.customProducts[prdId].taxDetails)) {
						_salesbyproduct_data.customProducts[prdId].taxDetails[tax.id] = {"base": 0.0, "amount": 0.0};
					}
				}
			}
		}
	}
	let catById = [];
	for (let i = 0; i < categories.length; i++) {
		catById[categories[i].id] = categories[i];
		catById[categories[i].id].products = [];
	}
	for (let i = 0; i < products.length; i++) {
		// Put the data into the rendering data (catById)
		let prd = products[i];
		if (prd.visible || vue.screen.data.includeArchives) {
			if (!(prd.id in _salesbyproduct_data.products) && vue.screen.data.includeZero && !separateByCR) {
				_salesbyproduct_data.products[prd.id] = _salesbyproduct_data.initSalesData();
			}
			if (prd.id in _salesbyproduct_data.products) {
				catById[prd.category].products.push(prd);
			}
		}
	}
	// Get non empty categories and sort their content
	let stats = [];
	for (let id in catById) {
		if (catById[id].products.length > 0) {
			catById[id].products = catById[id].products.sort(tools_sort("dispOrder", "reference"));
			stats.push(catById[id]);
		}
	}
	// Sort the categories
	stats = stats.sort(tools_sort("dispOrder", "reference"));
	let customProductLabels = Object.keys(_salesbyproduct_data.customProducts).sort();
	// Prepare rendering
	let lines = [];
	for (let i = 0; i < stats.length; i++) {
		let cat = stats[i].label;
		for (let j = 0; j < stats[i].products.length; j++) {
			prd = stats[i].products[j];
			let img = null;
			if (prd.hasImage) {
				img = login_getHostUrl() + "/api/image/product/" + prd.id + "?Token=" + login_getToken();
			} else {
				img = login_getHostUrl() + "/api/image/product/default?Token=" + login_getToken();
			}
			if (!separateByCR) {
				let qty = _salesbyproduct_data.products[prd.id].qty;
				let price = _salesbyproduct_data.products[prd.id].price;
				let line = [img, "", cat, prd.reference, prd.label, qty, price];
				if (prd.priceBuy > 0) {
					line.push(prd.priceBuy * qty);
					line.push(price - prd.priceBuy * qty);
				} else {
					line.push("");
					line.push("");
				}
				line.push(_salesbyproduct_data.products[prd.id].priceTax);
				if (separateByTax) {
					for (let k = 0; k < taxes.length; k++) {
						let taxDetail = _salesbyproduct_data.products[prd.id].taxDetails[taxes[k].id];
						if (taxDetail.base != 0.0) {
							line.push(taxDetail.base);
							line.push(taxDetail.amount);
							line.push(taxDetail.base + taxDetail.amount);
						} else {
							line.push("");
							line.push("");
							line.push("");
						}
					}
				}
				lines.push(line);
			} else {
				for (let k = 0; k < cashRegisters.length; k++) {
					let cr = cashRegisters[k];
					if (cr.id in _salesbyproduct_data.products[prd.id]) {
						let qty = _salesbyproduct_data.products[prd.id][cr.id].qty;
						let price = _salesbyproduct_data.products[prd.id][cr.id].price;
						let line = [img, cr.label, cat, prd.reference, prd.label, qty, price];
						if (prd.priceBuy > 0) {
							line.push(prd.priceBuy * qty);
							line.push(price - prd.priceBuy * qty);
						} else {
							line.push("");
							line.push("");
						}
						line.push(_salesbyproduct_data.products[prd.id][cr.id].priceTax);
						if (separateByTax) {
							for (let l = 0; l < taxes.length; l++) {
								let taxDetail = _salesbyproduct_data.products[prd.id][cr.id].taxDetails[taxes[l].id];
								if (taxDetail.base != 0.0) {
									line.push(taxDetail.base);
									line.push(taxDetail.amount);
									line.push(taxDetail.base + taxDetail.amount);
								} else {
									line.push("");
									line.push("");
									line.push("");
								}
							}
						}
						lines.push(line);
					}
				}
			}
		}
	}
	for (let i = 0; i < customProductLabels.length; i++) {
		let productLabel = customProductLabels[i];
		if (!separateByCR) {
			let qty = _salesbyproduct_data.customProducts[productLabel].qty;
			let price = _salesbyproduct_data.customProducts[productLabel].price;
			let priceTax = _salesbyproduct_data.customProducts[productLabel].priceTax;
			let line = ["", "", "", "", productLabel, qty, price, "", "", priceTax];
			if (separateByTax) {
				for (let l = 0; l < taxes.length; l++) {
					let taxDetail = _salesbyproduct_data.customProducts[productLabel].taxDetails[taxes[l].id];
					if (taxDetail.base != 0.0) {
						line.push(taxDetail.base);
						line.push(taxDetail.amount);
						line.push(taxDetail.base + taxDetail.amount);
					} else {
						line.push("");
						line.push("");
						line.push("");
					}
				}
			}
			lines.push(line);
		} else {
			for (let k = 0; k < cashRegisters.length; k++) {
				let cr = cashRegisters[k];
				if (cr.id in _salesbyproduct_data.customProducts[productLabel]) {
					let qty = _salesbyproduct_data.customProducts[productLabel][cr.id].qty;
					let price = _salesbyproduct_data.customProducts[productLabel][cr.id].price;
					let priceTax = _salesbyproduct_data.customProducts[productLabel][cr.id].priceTax;
					let line = ["", "", "", "", productLabel, qty, price, "", "", priceTax];
					if (separateByTax) {
						for (let l = 0; l < taxes.length; l++) {
							let taxDetail = _salesbyproduct_data.customProducts[productLabel][cr.id].taxDetails[taxes[l].id];
							if (taxDetail.base != 0.0) {
								line.push(taxDetail.base);
								line.push(taxDetail.amount);
								line.push(taxDetail.base + taxDetail.amount);
							} else {
								line.push("");
								line.push("");
								line.push("");
							}
						}
					}
					lines.push(line);
				}
			}
		}
	}
	// Set table
	let oldColumns = vue.screen.data.table.columns;
	let oldColumnVisible = function(label, old, default_val) {
		for (let i = 0; i < old.length; i++) {
			if (old[i].label == label) {
				return old[i].visible;
			}
		}
		return default_val;
	};
	vue.screen.data.table.title("Sales by products from  "
			+ tools_dateToString(vue.screen.data.start)
			+ " au "
			+ tools_dateToString(vue.screen.data.stop));
	vue.screen.data.table.reset();
	vue.screen.data.table

		// .column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).visible(oldColumnVisible("Image", oldColumns, true)).exportable(false).help("L'image du produit. Ce champ ne peut être exporté."))
		// .column(new TableCol().reference("cashRegister").label("Caisse").visible(oldColumnVisible("Caisse", oldColumns, false)).help("La caisse pour laquelle les vente sont comptabilisées. Si l'option Détailler par caisse n'est pas cochée, ce champ est vide."))
		// .column(new TableCol().reference("category").label("Catégorie").visible(oldColumnVisible("Catégorie", oldColumns, true)).searchable(true).help("La catégorie actuelle du produit."))
		// .column(new TableCol().reference("reference").label("Reference").visible(oldColumnVisible("Reference", oldColumns, false)).searchable(true).help("La référence du produit."))
		// .column(new TableCol().reference("label").label("Désignation").footerType(TABLECOL_FOOTER.CUSTOM, "Total").visible(oldColumnVisible("Désignation", oldColumns, true)).searchable(true).help("Le nom du produit tel qu'affiché sur les boutons de la caisse et le ticket."))
		// .column(new TableCol().reference("quantity").label("Quantité").type(TABLECOL_TYPE.NUMBER).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Quantité", oldColumns, true)).help("La quantité de produit vendue sur la période.").class("z-oddcol"))
		// .column(new TableCol().reference("priceSell").label("Vente HT").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Vente HT", oldColumns, false)).help("Le montant de chiffre d'affaire hors taxes réalisé par le produit sur la période concernée.").class("z-oddcol"))
		// .column(new TableCol().reference("priceBuy").label("Prix d'achat").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Prix d'achat", oldColumns, false)).help("Le prix d'achat hors taxes actuel. Ce montant n'a pas d'historique et ne correspond pas forcément au prix d'achat au moment de la vente.").class("z-oddcol"))
		// .column(new TableCol().reference("margin").label("Marge").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Marge", oldColumns, false)).help("La marge réalisée sur les ventes du produit sur la période. Cette marge est calculée en fonction du prix d'achat actuel et non du prix d'achat au moment de la vente.").class("z-oddcol"))
		// .column(new TableCol().reference("priceSellVat").label("Vente TTC").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Vente TTC", oldColumns, false)).help("Le montant de chiffre d'affaire TTC réalisé par le produit sur la période concernée.").class("z-oddcol"));
		//

		.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).visible(oldColumnVisible("Image", oldColumns, true)).exportable(false).help("The product image. This field cannot be exported."))
		.column(new TableCol().reference("cashRegister").label("Cash Register").visible(oldColumnVisible("Cash Register", oldColumns, false)).help("The cash register for which sales are accounted. If the option 'Detail by cash register' is not checked, this field is empty."))
		.column(new TableCol().reference("category").label("Category").visible(oldColumnVisible("Category", oldColumns, true)).searchable(true).help("The current category of the product."))
		.column(new TableCol().reference("reference").label("Reference").visible(oldColumnVisible("Reference", oldColumns, false)).searchable(true).help("The product reference."))
		.column(new TableCol().reference("label").label("Designation").footerType(TABLECOL_FOOTER.CUSTOM, "Total").visible(oldColumnVisible("Designation", oldColumns, true)).searchable(true).help("The product name as displayed on cash register buttons and tickets."))
		.column(new TableCol().reference("quantity").label("Quantity").type(TABLECOL_TYPE.NUMBER).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Quantity", oldColumns, true)).help("The quantity of product sold during the period.").class("z-oddcol"))
		.column(new TableCol().reference("priceSell").label("Sales excl. tax").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Sales excl. tax", oldColumns, false)).help("The amount of sales revenue excluding tax generated by the product during the period.").class("z-oddcol"))
		.column(new TableCol().reference("priceBuy").label("Purchase Price").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Purchase Price", oldColumns, false)).help("The current purchase price excluding tax. This amount has no history and does not necessarily correspond to the purchase price at the time of sale.").class("z-oddcol"))
		.column(new TableCol().reference("margin").label("Margin").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Margin", oldColumns, false)).help("The margin realized on the product sales during the period. This margin is calculated based on the current purchase price and not the purchase price at the time of sale.").class("z-oddcol"))
		.column(new TableCol().reference("priceSellVat").label("Sales incl. tax").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Sales incl. tax", oldColumns, false)).help("The amount of sales revenue including tax generated by the product during the period.").class("z-oddcol"));


	if (separateByTax) {
		for (let i = 0; i < taxes.length; i++) {
			let tax = taxes[i];
			let col = new TableCol().reference("tax-" + i + "-base").label(tax.label + " base").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(tax.label + " base", oldColumns, false)).help("Le montant de chiffre d'affaire hors taxe associé au taux de TVA.");
			if (i % 2 != 0) {
				col.class("z-oddcol");
			}
			vue.screen.data.table.column(col);
			col = new TableCol().reference("tax-" + i + "-amount").label(tax.label + " TVA").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(tax.label + " TVA", oldColumns, false)).help("Le montant de TVA collectée associé au taux de TVA.");
			if (i % 2 != 0) {
				col.class("z-oddcol");
			}
			vue.screen.data.table.column(col);
			col = new TableCol().reference("tax-" + i + "-total").label(tax.label + " TTC").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(tax.label + " TTC", oldColumns, false)).help("Le montant TTC associé au taux de TVA.");
			if (i % 2 != 0) {
				col.class("z-oddcol");
			}
			vue.screen.data.table.column(col);
		}
	}
	vue.screen.data.table.resetContent(lines);
	vue.$refs.screenComponent.$refs.salesTable.restoreDefaultPreferences();
	gui_hideLoading();
}

var _salesbycategory_data = {};

function salesbycategory_show() {
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	vue.screen.data = {
		"start": start,
		"stop": stop,
		"includeArchives": false,
		"includeZero": true,
		"separateCashRegisters": false,
		"separateTaxes": false,
		"table": new Table().reference("salesByCategory-list")
	}
	vue.screen.component = "vue-salesbycategory";
}

function salesbycategory_filter() {
	let start = vue.screen.data.start;
	let stop = vue.screen.data.stop;
	_salesbycategory_data = {
		"start": start.getTime() / 1000,
		"stop": stop.getTime() / 1000,
		"pages": 0,
		"currentPage": 0,
		"separateByCR": vue.screen.data.separateCashRegisters,
		"separateByTax": vue.screen.data.separateTaxes,
		"products": {}, // Products data by id
		"productCat": {}, // Category id from product id
		"categories": {}, // Category sales data by category id (0 for custom products)
		"initSalesData": function() {
			return {
				"qty": 0,
				"price": 0.0,
				"priceTax": 0.0,
				"priceBuy": 0.0,
				"margin": 0.0,
				"tax": 0.0,
				"taxDetails": {},
			};
		},
	};
	srvcall_get("api/ticket/search?count=1&dateStart=" + _salesbycategory_data.start + "&dateStop=" + _salesbycategory_data.stop, _salesbycategory_countCallback);
	gui_showLoading();
}

function _salesbycategory_countCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, salesbycategory_filter)) {
		return;
	}
	let count = parseInt(response);
	let pages = parseInt(count / 100);
	if (count % 100 > 0) {
		pages++;
	}
	_salesbycategory_data.pages = pages;
	gui_showProgress(0, pages);
	// Load products to get their category, then load tickets
	storage_open(function(event) {
		storage_readStore("products", function(data) {
			for (let i = 0; i < data.length; i++) {
				let product = data[i];
				_salesbycategory_data.productCat[product.id] = product.category;
				_salesbycategory_data.products[product.id] = product;
			}
			storage_close();
			srvcall_get("api/ticket/search?limit=100&dateStart=" + _salesbycategory_data.start + "&dateStop=" + _salesbycategory_data.stop, _salesbycategory_filterCallback);
		});
	});
}

function _salesbycategory_filterCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, salesbycategory_filter)) {
		return;
	}
	let tickets = JSON.parse(response);
	for (let i = 0; i < tickets.length; i++) {
		let ticket = tickets[i];
		for (let j = 0; j < ticket.lines.length; j++) {
			let line = ticket.lines[j];
			let catId = 0;
			let unitPriceBuy = 0.0;
			if (line.product != null) {
				catId = _salesbycategory_data.productCat[line.product];
				unitPriceBuy = _salesbycategory_data.products[line.product].priceBuy;
			}
			// Initialize sales data to 0 for categories seen the first time
			if (!(catId in _salesbycategory_data.categories)) {
				if (_salesbycategory_data.separateByCR) {
					_salesbycategory_data.categories[catId] = {};
				} else {
					_salesbycategory_data.categories[catId] = _salesbycategory_data.initSalesData();
				}
			}
			// Count sales
			let salesData = _salesbycategory_data.categories[catId];
			let price = (line.finalTaxedPrice / (1.0 + line.taxRate));
			let priceBuy = unitPriceBuy * line.quantity;
			if (_salesbycategory_data.separateByCR) {
				// Separated by cash registers
				if (!(ticket.cashRegister in salesData)) {
					salesData[ticket.cashRegister] = _salesbycategory_data.initSalesData();
				}
				salesData = _salesbycategory_data.categories[catId][ticket.cashRegister];
			}
			salesData.qty += line.quantity;
			salesData.price += price;
			salesData.priceTax += line.finalTaxedPrice;
			salesData.priceBuy += priceBuy;
			salesData.margin += price - priceBuy;
			salesData.tax += line.finalTaxedPrice - price;
			if (!(line.tax in salesData["taxDetails"])) {
				salesData["taxDetails"][line.tax] = {"base": 0.0, "amount": 0.0};
			}
			salesData["taxDetails"][line.tax].base += price;
			salesData["taxDetails"][line.tax].amount += line.finalTaxedPrice - price;
		}
	}
	_salesbycategory_data.currentPage++;
	if (_salesbycategory_data.currentPage < _salesbycategory_data.pages) {
		gui_showProgress(_salesbycategory_data.currentPage, _salesbycategory_data.pages);
		srvcall_get("api/ticket/search?limit=100&offset=" + (100 * _salesbycategory_data.currentPage) + "&dateStart=" + _salesbycategory_data.start + "&dateStop=" + _salesbycategory_data.stop, _salesbycategory_filterCallback);
	} else {
		_salesbycategory_dataRetreived();
	}
}

function _salesbycategory_dataRetreived() {
	gui_showLoading();
	storage_open(function (event) {
		storage_readStores(["categories", "cashRegisters", "taxes"], function (data) {
			let cr = null
			if (vue.screen.data.separateCashRegisters) {
				cr = data["cashRegisters"];
			}
			let taxes = null;
			if (vue.screen.data.separateTaxes) {
				taxes = data["taxes"];
			}
			_salesbycategory_render(cr, data["categories"], taxes);
			storage_close();
		});
	});
}

function _salesbycategory_render(cashRegisters, categories, taxes) {
	// Sort for display
	let separateByCR = cashRegisters != null;
	if (cashRegisters != null) {
		cashRegisters = cashRegisters.sort(tools_sort("reference"));
	}
	let separateByTaxes = taxes != null;
	// Include 0 for non used categories
	if (vue.screen.data.includeZero) {
		for (let i = 0; i < categories.length; i++) {
			let cat = categories[i];
			if (separateByCR) {
				if (!(cat.id in _salesbycategory_data.categories)) {
					_salesbycategory_data.categories[cat.id] = {};
				}
				// Initialize all missing 0 in separated cash registers
				let salesData = _salesbycategory_data.categories[cat.id];
				for (let j = 0; j < cashRegisters.length; j++) {
					let cashRegister = cashRegisters[j];
					if (!(cashRegister.id in salesData)) {
						salesData[cashRegister.id] = _salesbycategory_data.initSalesData();
					}
					// Include 0 for unused taxes
					if (separateByTaxes) {
						salesData = _salesbycategory_data.categories[cat.id][cashRegister.id];
						for (let k = 0; k < taxes.length; k++) {
							if (!(k in salesData.taxDetails)) {
								salesData.taxDetails[k] = {"base": 0.0, "amount": 0.0};
							}
						}
					}
				}
			} else {
				if (!(cat.id in _salesbycategory_data.categories)) {
					_salesbycategory_data.categories[cat.id] = _salesbycategory_data.initSalesData();
				}
				// Include 0 for unused taxes
				if (separateByTaxes) {
					let salesData = _salesbycategory_data.categories[cat.id];
					for (let j = 0; j < taxes.length; j++) {
						if (!(j in salesData.taxDetails)) {
							salesData.taxDetails[j] = {"base": 0.0, "amount": 0.0};
						}
					}
				}
			}
		}
		if (separateByCR) {
			// Set 0 for custom products only if there are some
			if ((0 in _salesbycategory_data.categories) &&  _salesbycategory_data.categories[0].length > 0) {
				let salesData = _salesbycategory_data.categories[0];
				for (let j = 0; j < cashRegisters.length; j++) {
					let cashRegister = cashRegisters[j];
					if (!(cashRegister.id in salesData)) {
						salesData[cashRegister.id] = _salesbycategory_data.initSalesData();
					}
				}
			}
		} // else don't add 0 for custom products if there are none
	}
	// Set 0 for unused taxes
	if (separateByTaxes) {
		for (let catId in _salesbycategory_data.categories) {
			let salesData;
			if (separateByCR) {
				for (let crId in _salesbycategory_data.categories[catId]) {
					for (let i = 0; i < taxes.length; i++) {
						if (!(taxes[i].id in _salesbycategory_data.categories[catId][crId].taxDetails)) {
							_salesbycategory_data.categories[catId][crId].taxDetails[taxes[i].id] = {"base": 0.0, "amount": 0.0};
						}
					}
				}
			} else {
				for (let i = 0; i < taxes.length; i++) {
					if (!(taxes[i].id in _salesbycategory_data.categories[catId].taxDetails)) {
						_salesbycategory_data.categories[catId].taxDetails[taxes[i].id] = {"base": 0.0, "amount": 0.0};
					}
				}
			}
		}
	}
	// Sort the categories
	let sortedCats = categories.sort(tools_sort("dispOrder", "reference"));
	let sortedData = [];
	for (let i = 0; i < sortedCats.length; i++) {
		let catId = sortedCats[i].id;
		if (catId in _salesbycategory_data.categories) {
			sortedData.push(_salesbycategory_data.categories[catId]);
			sortedData[sortedData.length - 1].category = sortedCats[i];
		}
	}
	// Add custom products at the end if there are some
	if (0 in _salesbycategory_data.categories) {
		sortedData.push(_salesbycategory_data.categories[0]);
		sortedData[sortedData.length - 1].category = {"label": "Open products ", "reference": "", "hasImage": false};
	}
	// Prepare rendering
	let lines = [];
	for (let i = 0; i < sortedData.length; i++) {
		let cat = sortedData[i].category;
		let salesData = sortedData[i];

		let img = null;
		if (cat.hasImage) {
			img = login_getHostUrl() + "/api/image/category/" + cat.id + "?Token=" + login_getToken();
		} else {
			img = login_getHostUrl() + "/api/image/category/default?Token=" + login_getToken();
		}
		if (!separateByCR) {
			let line = [
				img,
				"",
				cat.label,
				cat.reference,
				salesData.qty,
				salesData.price,
				salesData.priceBuy,
				salesData.margin,
				salesData.priceTax,
				salesData.tax
			];
			if (separateByTaxes) {
				for (let j = 0; j < taxes.length; j++) {
					if (salesData.taxDetails[taxes[j].id].base != 0.0) {
						let taxDetail = salesData.taxDetails[taxes[j].id];
						line.push(taxDetail.base);
						line.push(taxDetail.amount);
						line.push(taxDetail.base + taxDetail.amount);
					} else {
						line.push("");
						line.push("");
						line.push("");
					}
				}
			}
			lines.push(line);
		} else {
			for (let j = 0 ; j < cashRegisters.length; j++) {
				let cr = cashRegisters[j];
				let line = [
					img,
					cr.label,
					cat.label,
					cat.reference,
					salesData[cr.id].qty,
					salesData[cr.id].price,
					salesData[cr.id].priceBuy,
					salesData[cr.id].margin,
					salesData[cr.id].priceTax,
					salesData[cr.id].tax
				];
				if (separateByTaxes) {
					for (let k = 0; k < taxes.length; k++) {
						if (salesData[cr.id].taxDetails[taxes[k].id].base != 0.0) {
							let taxDetail = salesData[cr.id].taxDetails[taxes[k].id];
							line.push(taxDetail.base);
							line.push(taxDetail.amount);
							line.push(taxDetail.base + taxDetail.amount);
						} else {
							line.push("");
							line.push("");
							line.push("");
						}
					}
				}
				lines.push(line);
			}
		}
	}
	// Set table
	let oldColumns = vue.screen.data.table.columns;
	let oldColumnVisible = function(label, old, default_val) {
		for (let i = 0; i < old.length; i++) {
			if (old[i].label == label) {
				return old[i].visible;
			}
		}
		return default_val;
	};
	vue.screen.data.table.reset();
	vue.screen.data.table

		// .column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).visible(oldColumnVisible("Image", oldColumns, true)).exportable(false).help("L'image de la catégorie. Ce champ ne peut être exporté."))
		// .column(new TableCol().reference("cashRegister").label("Caisse").visible(oldColumnVisible("Caisse", oldColumns, false)).help("La caisse pour laquelle les vente sont comptabilisées. Si l'option Détailler par caisse n'est pas cochée, ce champ est vide."))
		// .column(new TableCol().reference("label").label("Catégorie").visible(oldColumnVisible("Catégorie", oldColumns, true)).help("Le nom de la catégorie."))
		// .column(new TableCol().reference("reference").label("Référence").footerType(TABLECOL_FOOTER.CUSTOM, "Total").visible(oldColumnVisible("Référence", oldColumns, false)).help("La référence de la catégorie."))
		// .column(new TableCol().reference("quantity").label("Quantité").type(TABLECOL_TYPE.NUMBER).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Quantité", oldColumns, true)).help("La quantité de produits vendus sur la période.").class("z-oddcol"))
		// .column(new TableCol().reference("priceSell").label("Total ventes HT").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Total ventes HT", oldColumns, false)).help("Le montant de chiffre d'affaire hors taxes réalisé par les produits de la catégorie sur la période concernée.").class("z-oddcol"))
		// .column(new TableCol().reference("priceBuy").label("Total achats HT").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Total achats HT", oldColumns, false)).help("Le prix d'achat hors taxes actuel. Ce montant n'a pas d'historique et ne correspond pas forcément au prix d'achat au moment de la vente.").class("z-oddcol"))
		// .column(new TableCol().reference("margin").label("Marge").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Marge", oldColumns, false)).help("La marge réalisée sur les ventes des produits sur la période. Cette marge est calculée en fonction du prix d'achat actuel et non du prix d'achat au moment de la vente.").class("z-oddcol"))
		// .column(new TableCol().reference("priceSellVat").label("Ventes TTC").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Ventes TTC", oldColumns, false)).help("Le montant de chiffre d'affaire TTC réalisé par les produits de la catégorie sur la période concernée.").class("z-oddcol"))
		// .column(new TableCol().reference("taxTotal").label("Total TVA").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Total TVA", oldColumns, false)).help("Le montant de la TVA collectée sur les produits de la catégorie sur la période concernée.").class("z-oddcol"));
		//

		.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).visible(oldColumnVisible("Image", oldColumns, true)).exportable(false).help("The category image. This field cannot be exported."))
		.column(new TableCol().reference("cashRegister").label("Cash Register").visible(oldColumnVisible("Cash Register", oldColumns, false)).help("The cash register for which the sales are accounted. If the 'Detail by cash register' option is not checked, this field is empty."))
		.column(new TableCol().reference("label").label("Category").visible(oldColumnVisible("Category", oldColumns, true)).help("The name of the category."))
		.column(new TableCol().reference("reference").label("Reference").footerType(TABLECOL_FOOTER.CUSTOM, "Total").visible(oldColumnVisible("Reference", oldColumns, false)).help("The reference of the category."))
		.column(new TableCol().reference("quantity").label("Quantity").type(TABLECOL_TYPE.NUMBER).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Quantity", oldColumns, true)).help("The quantity of products sold during the period.").class("z-oddcol"))
		.column(new TableCol().reference("priceSell").label("Total Sales excl. VAT").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Total Sales excl. VAT", oldColumns, false)).help("The total sales amount excluding VAT made by the products of the category during the concerned period.").class("z-oddcol"))
		.column(new TableCol().reference("priceBuy").label("Total Purchases excl. VAT").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Total Purchases excl. VAT", oldColumns, false)).help("The current purchase price excluding VAT. This amount has no history and does not necessarily correspond to the purchase price at the time of sale.").class("z-oddcol"))
		.column(new TableCol().reference("margin").label("Margin").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Margin", oldColumns, false)).help("The margin realized on product sales during the period. This margin is calculated based on the current purchase price, not the purchase price at the time of sale.").class("z-oddcol"))
		.column(new TableCol().reference("priceSellVat").label("Sales incl. VAT").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Sales incl. VAT", oldColumns, false)).help("The total sales amount including VAT made by the products of the category during the concerned period.").class("z-oddcol"))
		.column(new TableCol().reference("taxTotal").label("Total VAT").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Total VAT", oldColumns, false)).help("The total VAT collected on products of the category during the concerned period.").class("z-oddcol"));

	if (separateByTaxes) {
		for (let i = 0; i < taxes.length; i++) {
			let tax = taxes[i];
			let col = new TableCol().reference("tax-" + i + "-base").label(tax.label + " base").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(tax.label + " base", oldColumns, false)).help("Le montant de chiffre d'affaire hors taxe associé au taux de TVA.");
			if (i % 2 != 0) {
				col.class("z-oddcol");
			}
			vue.screen.data.table.column(col);
			col = new TableCol().reference("tax-" + i + "-amount").label(tax.label + " TVA").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(tax.label + " TVA", oldColumns, false)).help("Le montant de TVA collectée associé au taux de TVA.");
			if (i % 2 != 0) {
				col.class("z-oddcol");
			}
			vue.screen.data.table.column(col);
			col = new TableCol().reference("tax-" + i + "-total").label(tax.label + " TTC").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(tax.label + " TTC", oldColumns, false)).help("Le montant de TTC associé au taux de TVA.");
			if (i % 2 != 0) {
				col.class("z-oddcol");
			}
			vue.screen.data.table.column(col);
		}
	}
	vue.screen.data.table.title("Sales by category from "
		+ tools_dateToString(vue.screen.data.start)
		+ " au "
		+ tools_dateToString(vue.screen.data.stop));
	lines.forEach(l => {
		vue.screen.data.table.line(l);
	});

	gui_hideLoading();
}


var _salesdetails_data = {};

function salesdetails_show() {
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	storage_open(function(event) {
		storage_readStores(["cashRegisters", "products", "categories", "paymentmodes", "customers"], function(data) {
			let catById = {};
			let prdById = {};
			let crById = {};
			let custById = {};
			for (let i = 0; i < data["cashRegisters"].length; i++) {
				let cr = data["cashRegisters"][i];
				crById[cr.id] = cr
			}
			for (let i = 0; i < data["products"].length; i++) {
				let prd = data["products"][i];
				prdById[prd.id] = prd;
			}
			for (let i = 0; i < data["categories"].length; i++) {
				let cat = data["categories"][i];
				catById[cat.id] = cat;
			}
			for (let i = 0; i < data["customers"].length; i++) {
				let cust = data["customers"][i];
				custById[cust.id] = cust;
			}
			vue.screen.data = {
				"start": start,
				"stop": stop,
				"crById": crById,
				"prdById": prdById,
				"catById": catById,
				"custById": custById,
				"paymentModes": data["paymentmodes"],
				"table": new Table().reference("salesDetail-list")

					// .column(new TableCol().reference("cashRegister").label("Caisse").visible(false).help("Le nom de la caisse."))
					// .column(new TableCol().reference("paymentmodes").label("Encaissement").visible(true).help("Les modes de paiement utilisés à l'encaissement."))
					// .column(new TableCol().reference("number").label("Ticket").type(TABLECOL_TYPE.NUMBER).visible(false).help("Le numéro du ticket de la caisse."))
					// .column(new TableCol().reference("date").type(TABLECOL_TYPE.DATETIME).label("Date").visible(false).help("La date de réalisation de la vente."))
					// .column(new TableCol().reference("semaine").label("Semaine").type(TABLECOL_TYPE.NUMBER).visible(false).help("Le numero de la semaine dans l'année."))
					// .column(new TableCol().reference("mois").label("Mois").type(TABLECOL_TYPE.NUMBER).visible(false).help("Le numéro du mois."))
					// .column(new TableCol().reference("customer").label("Client").visible(false).help("Le compte client associé."))
					// .column(new TableCol().reference("line").label("Ligne").type(TABLECOL_TYPE.NUMBER).visible(false).help("Le numéro de ligne du ticket."))
					// .column(new TableCol().reference("articleLine").label("Ligne-article").type(TABLECOL_TYPE.NUMBER).visible(false).help("Le numéro de l'article du ticket. Diffère de la ligne uniquement pour les compositions. Le contenu de la composition partage le même numéro de ligne-article avec la composition elle-même."))
					// .column(new TableCol().reference("category").label("Catégorie").visible(true).searchable(true).help("La catégorie à laquelle le produit est rattaché, si disponible."))
					// .column(new TableCol().reference("reference").label("Référence").visible(true).searchable(true).help("La référence du produit, si disponible."))
					// .column(new TableCol().reference("label").label("Désignation").visible(true).searchable(true).help("La désignation du produit telle qu'imprimée sur le ticket au moment de la vente."))
					// .column(new TableCol().reference("tax").label("TVA").type(TABLECOL_TYPE.PERCENT).visible(true).help("Le taux de TVA appliqué."))
					// .column(new TableCol().reference("priceBuy").label("Prix d'achat HT").type(TABLECOL_TYPE.NUMBER5).visible(false).help("Le prix d'achat actuel du produit si disponible. Ce montant n'est pas historisé et ne correspond pas forcément au prix d'achat au moment de la vente."))
					// .column(new TableCol().reference("unitPriceSell").label("Prix unitaire HT").type(TABLECOL_TYPE.NUMBER5).visible(false).help("Le prix de vente unitaire hors taxes."))
					// .column(new TableCol().reference("unitPriceSellVat").label("Prix unitaire TTC").type(TABLECOL_TYPE.NUMBER2).visible(false).help("Le prix de vente unitaire TTC."))
					// .column(new TableCol().reference("quantity").label("Quantité").type(TABLECOL_TYPE.NUMBER).visible(true).help("La quantité vendue."))
					// .column(new TableCol().reference("priceSell").label("Sous-total HT").type(TABLECOL_TYPE.NUMBER5).visible(false).help("Le montant hors taxes de la ligne avant application des réductions."))
					// .column(new TableCol().reference("priceSellVat").label("Sous-total TTC").type(TABLECOL_TYPE.NUMBER2).visible(false).help("Le montant TTC de la ligne avant application des réductions."))
					// .column(new TableCol().reference("discountRate").label("Remise").type(TABLECOL_TYPE.PERCENT).visible(true).help("Le taux de réduction appliqué à la ligne."))
					// .column(new TableCol().reference("finalPrice").label("Total HT").type(TABLECOL_TYPE.NUMBER5).visible(true).help("Le montant hors taxes de la ligne après réduction."))
					// .column(new TableCol().reference("finalTaxedPrice").label("Total TTC").type(TABLECOL_TYPE.NUMBER2).visible(true).help("Le montant TTC de la ligne après réductions."))
					// .column(new TableCol().reference("margin").label("Marge HT").type(TABLECOL_TYPE.NUMBER5).visible(false).help("La marge indicative de la ligne. La marge est calculée à partir du prix d'achat actuel qui peut être différent de celui lors de la vente du produit."))
					//


					.column(new TableCol().reference("cashRegister").label("Cash Register").visible(false).help("The name of the cash register."))
					.column(new TableCol().reference("paymentmodes").label("Payment Methods").visible(true).help("The payment methods used at checkout."))
					.column(new TableCol().reference("number").label("Ticket").type(TABLECOL_TYPE.NUMBER).visible(false).help("The cash register ticket number."))
					.column(new TableCol().reference("date").type(TABLECOL_TYPE.DATETIME).label("Date").visible(false).help("The date when the sale was made."))
					.column(new TableCol().reference("semaine").label("Week").type(TABLECOL_TYPE.NUMBER).visible(false).help("The week number in the year."))
					.column(new TableCol().reference("mois").label("Month").type(TABLECOL_TYPE.NUMBER).visible(false).help("The month number."))
					.column(new TableCol().reference("customer").label("Customer").visible(false).help("The associated customer account."))
					.column(new TableCol().reference("line").label("Line").type(TABLECOL_TYPE.NUMBER).visible(false).help("The ticket line number."))
					.column(new TableCol().reference("articleLine").label("Article Line").type(TABLECOL_TYPE.NUMBER).visible(false).help("The article number on the ticket. Differs from line number only for product bundles. The contents of a bundle share the same article line number as the bundle itself."))
					.column(new TableCol().reference("category").label("Category").visible(true).searchable(true).help("The category to which the product belongs, if available."))
					.column(new TableCol().reference("reference").label("Reference").visible(true).searchable(true).help("The product reference, if available."))
					.column(new TableCol().reference("label").label("Designation").visible(true).searchable(true).help("The product designation as printed on the ticket at the time of sale."))
					.column(new TableCol().reference("tax").label("VAT").type(TABLECOL_TYPE.PERCENT).visible(true).help("The applied VAT rate."))
					.column(new TableCol().reference("priceBuy").label("Purchase Price excl. tax").type(TABLECOL_TYPE.NUMBER5).visible(false).help("The current purchase price of the product if available. This amount is not historicized and may not correspond to the purchase price at the time of sale."))
					.column(new TableCol().reference("unitPriceSell").label("Unit Price excl. tax").type(TABLECOL_TYPE.NUMBER5).visible(false).help("The unit selling price excluding taxes."))
					.column(new TableCol().reference("unitPriceSellVat").label("Unit Price incl. tax").type(TABLECOL_TYPE.NUMBER2).visible(false).help("The unit selling price including taxes."))
					.column(new TableCol().reference("quantity").label("Quantity").type(TABLECOL_TYPE.NUMBER).visible(true).help("The quantity sold."))
					.column(new TableCol().reference("priceSell").label("Subtotal excl. tax").type(TABLECOL_TYPE.NUMBER5).visible(false).help("The line amount excluding taxes before applying discounts."))
					.column(new TableCol().reference("priceSellVat").label("Subtotal incl. tax").type(TABLECOL_TYPE.NUMBER2).visible(false).help("The line amount including taxes before applying discounts."))
					.column(new TableCol().reference("discountRate").label("Discount").type(TABLECOL_TYPE.PERCENT).visible(true).help("The discount rate applied to the line."))
					.column(new TableCol().reference("finalPrice").label("Total excl. tax").type(TABLECOL_TYPE.NUMBER5).visible(true).help("The line amount excluding taxes after discount."))
					.column(new TableCol().reference("finalTaxedPrice").label("Total incl. tax").type(TABLECOL_TYPE.NUMBER2).visible(true).help("The line amount including taxes after discounts."))
					.column(new TableCol().reference("margin").label("Margin excl. tax").type(TABLECOL_TYPE.NUMBER5).visible(false).help("The indicative margin for the line. Margin is calculated from the current purchase price, which may differ from that at the time of product sale."))



			}
			vue.screen.component = "vue-salesdetails";
		});
	});

}

function salesdetails_filter() {
	let start = vue.screen.data.start;
	let stop = vue.screen.data.stop;
	_salesdetails_data = {"start": start.getTime() / 1000,
		"stop": stop.getTime() / 1000,
		"pages": 0,
		"currentPage": 0,
		"tickets": []};
	srvcall_get("api/ticket/search?count=1&dateStart=" + _salesdetails_data.start + "&dateStop=" + _salesdetails_data.stop, _salesdetails_countCallback);
	gui_showLoading();
}

function _salesdetails_countCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, salesdetails_filter)) {
		return;
	}
	let count = parseInt(response);
	let pages = parseInt(count / 100);
	if (count % 100 > 0) {
		pages++;
	}
	_salesdetails_data.pages = pages;
	gui_showProgress(0, pages);
	srvcall_get("api/ticket/search?limit=100&dateStart=" + _salesdetails_data.start + "&dateStop=" + _salesdetails_data.stop, _salesdetails_filterCallback);
}

function _salesdetails_filterCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, salesdetails_filter)) {
		return;
	}
	let tickets = JSON.parse(response);
	for (let i = 0; i < tickets.length; i++) {
		_salesdetails_data.tickets.push(tickets[i]);
	}
	_salesdetails_data.currentPage++;
	if (_salesdetails_data.currentPage < _salesdetails_data.pages) {
		gui_showProgress(_salesdetails_data.currentPage, _salesdetails_data.pages);
		srvcall_get("api/ticket/search?limit=100&offset=" + (100 * _salesdetails_data.currentPage) + "&dateStart=" + _salesdetails_data.start + "&dateStop=" + _salesdetails_data.stop, _salesdetails_filterCallback);
	} else {
		_salesdetails_dataRetreived();
	}
}

function _salesdetails_dataRetreived() {
	gui_showLoading();
	_salesdetails_render(_salesdetails_data.tickets);
}

function _salesdetails_render(tickets) {
	// Prepare rendering
	let lines = [];
	for (let i = 0; i < tickets.length; i++) {
		let ticket = tickets[i];
		let inCompo = false;
		let articleLine = 0;

		let pmModes = {};
		for (let j = 0; j < ticket.payments.length; j++) {
			let payment = ticket.payments[j];
			if (!(payment.paymentMode in pmModes)) {
				pmModes[payment.paymentMode] = true;
			}
		}
		let pmModesStr = "";
		for (pm in pmModes) {
			for (let j = 0; j < vue.screen.data.paymentModes.length; j++) {
				pmMode = vue.screen.data.paymentModes[j]
				if (pm == pmMode.id) {
					pmModesStr += ", " + pmMode.label;
				}
			}
		}
		pmModesStr = pmModesStr.substring(2);
		let customer = "";
		if (ticket.customer != null) {
			customer = vue.screen.data.custById[ticket.customer].dispName;
		}
		for (let j = 0; j < ticket.lines.length; j++) {
			let tktLine = ticket.lines[j];
			let method = pmModesStr
			let date = new Date(ticket.date * 1000);
			let week = date.getWeek()
			let month = date.getMonth() + 1;
			let category = "";
			let reference = "";
			let taxedRef = tktLine.finalTaxedPrice != null;
			let unitPrice = tktLine.unitPrice;
			let taxedUnitPrice = tktLine.taxedUnitPrice;
			let priceBuy = "";
			let price = tktLine.price;
			let taxedPrice = tktLine.taxedPrice;
			let finalPrice = tktLine.finalPrice;
			let finalTaxedPrice = tktLine.finalTaxedPrice;
			let margin = "";
			let line = tktLine.dispOrder + 1;
			if (inCompo && (tktLine.price == 0.0 || tktLine.taxedPrice == 0.0)) {
				// Keep article line to match the composition line
			} else {
				articleLine++;
				inCompo = false;
			}
			if (tktLine.product != null) {
				let prd = vue.screen.data.prdById[tktLine.product];
				category = vue.screen.data.catById[prd.category].label;
				reference = prd.reference;
				priceBuy = prd.priceBuy;
				if (prd.composition) {
					inCompo = true;
				}
			}
			if (taxedRef) {
				unitPrice = taxedUnitPrice / (1.0 + tktLine.taxRate);
				price = taxedPrice / (1.0 + tktLine.taxRate);
				finalPrice = finalTaxedPrice / (1.0 + tktLine.taxRate);
			} else {
				taxedUnitPrice = unitPrice * (1.0 + tktLine.taxRate);
				taxedPrice = price * (1.0 + tktLine.taxRate);
				finalTaxedPrice = finalPrice * (1.0 + tktLine.taxRate);
			}
			if (priceBuy != "") {
				let prd = vue.screen.data.prdById[tktLine.product];
				margin = finalPrice - (tktLine.quantity * prd.priceBuy);
			}
			lines.push([vue.screen.data.crById[ticket.cashRegister].label,
				method,
				ticket.number,
				date,
				week,
				month,
				customer,
				line,
				articleLine,
				category,
				reference,
				tktLine.productLabel,
				tktLine.taxRate,
				priceBuy,
				unitPrice,
				taxedUnitPrice,
				tktLine.quantity,
				price,
				taxedPrice,
				tktLine.discountRate,
				finalPrice,
				finalTaxedPrice,
				margin]);
		}
	}
	vue.screen.data.table.title("Sales details from "
		+ tools_dateToString(vue.screen.data.start)
		+ " to "
		+ tools_dateToString(vue.screen.data.stop));
	vue.screen.data.table.resetContent(lines);
	gui_hideLoading();

}
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
	vue.screen.data = {floors: floors};
	vue.screen.component = "vue-floors-edit"
	gui_hideLoading();
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
	Vue.set(vue.screen.data, "floors", floors);
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

function paymentmodes_show() {
	gui_showLoading();
	vue.screen.data = {paymentModes: [], sort: "dispOrder"};
	storage_open(function(event) {
		storage_readStores(["paymentmodes", "roles"], function(data) {
			vue.screen.data.paymentModes = data.paymentmodes.sort(tools_sort("dispOrder", "reference"));
			vue.screen.data.paymentModes.forEach(pm => {
				pm.roles = [];
				data.roles.forEach(role => {
					if (role.permissions.indexOf("payment." + pm.reference) != -1) {
						pm.roles.push(role.name);
					}
				});
			});
			vue.screen.component = "vue-paymentmode-list";
			gui_hideLoading();
			storage_close();
			let cashWarning = (!data.paymentmodes.find(pm => pm.reference == "cash"));
			vue.screen.data.cashWarning = cashWarning;
		});
	});
}

function paymentmodes_showPaymentMode(id) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStore("paymentmodes", function(paymentModes) {
			if (id!= null) {
				storage_get("paymentmodes", parseInt(id), function(paymentMode) {
					_paymentmodes_showPaymentMode(paymentMode, paymentModes);
					storage_close();
				});
			} else {
				_paymentmodes_showPaymentMode(PaymentMode_default(), paymentModes);
				storage_close();
			}
		});
	});
}

function _paymentmodes_showPaymentMode(paymentMode, paymentModes) {
	let hadValueImage = {};
	let deleteValueImage = {};
	let deleteValueImageButton = {};
	for (let i = 0; i < paymentMode.values.length; i++) {
		let pmValue = paymentMode.values[i];
		hadValueImage[pmValue.value] = pmValue.hasImage;
		deleteValueImage[pmValue.value] = false;
		deleteValueImageButton[pmValue.value] = "Delete";
	}
	vue.screen.data = {
		paymentMode: paymentMode,
		paymentModes: paymentModes,
		deleteImage: false,
		deleteImageButton: "Delete",
		hadImage: paymentMode.hasImage, // Save for later check
		hadValueImage: hadValueImage,
		deleteValueImage: deleteValueImage,
		deleteValueImageButton: deleteValueImageButton,
	}
	vue.screen.component = "vue-paymentmode-form";
	gui_hideLoading();
}

function paymentmodes_toggleImage() {
	if (vue.screen.data.paymentMode.hasImage) {
		vue.screen.data.paymentMode.hasImage = false;
		vue.screen.data.deleteImage = true;
		document.getElementById("edit-image").value = "";
		vue.screen.data.deleteImageButton = "Restore";
	} else {
		vue.screen.data.paymentMode.hasImage = true;
		vue.screen.data.deleteImage = false;
		vue.screen.data.deleteImageButton = "Delete"
	}
}

function paymentmodes_toggleValueImage(pmValue) {
	if (pmValue.hasImage) {
		pmValue.hasImage = false;
		vue.screen.data.deleteValueImage[pmValue.value] = true;
		let imgTag = document.getElementById("edit-image-" + pmValue.value);
		if (imgTag != null) {
			imgTag.value = "";
		}
		vue.screen.data.deleteValueImageButton[pmValue.value] = "Restore";
	} else {
		pmValue.hasImage = true;
		vue.screen.data.deleteValueImage[pmValue.value] = false;
		vue.screen.data.deleteValueImageButton[pmValue.value] = "Delete"
	}
}

function paymentmodes_removeValue(index) {
	vue.screen.data.paymentMode.values.splice(index, 1);
}

function paymentmodes_removeReturn(index) {
	vue.screen.data.paymentMode.returns.splice(index, 1);
}

function paymentmodes_savePaymentMode() {
	let pm = vue.screen.data.paymentMode;
	gui_showLoading();
	for (let i = 0; i < pm.returns.length; i++) {
		delete pm.returns[i]['id'];
	}
	for (let i = 0; i < pm.values.length; i++) {
		delete pm.values[i]['id'];
	}
	if ("id" in pm) {
		srvcall_post("api/paymentmode", pm, paymentmodes_saveCallback);
	} else {
		// Remove self-referencing payment mode return id before sending to the API
		pm.returns.forEach(function(ret) {
			if (ret.returnMode == -1) {
				delete ret.returnMode;
			}
		});
		srvcall_put("api/paymentmode/" + encodeURIComponent(pm["reference"]), pm, paymentmodes_saveCallback);
	}
}

function paymentmodes_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, paymentmodes_savePaymentMode)) {
		return;
	}
	if (status == 400) {
		if (request.statusText === "Reference is already taken") {
			gui_showError("The reference already exists, please choose another one.");
			document.getElementById("edit-reference").focus(); // TODO: make this Vuejsy.
		} else {
			gui_showError("There is something wrong with the form data. " + request.statusText);
		}

		gui_hideLoading();
		return;
	}
	let pm = vue.screen.data.paymentMode;
	if (!("id" in pm)) {
		// Assign id to payment mode
		let respPM = JSON.parse(response);
		pm.id = respPM["id"];
		// Assign id to self-referencing returns
		pm.returns.forEach(function(ret) {
			if (typeof ret.returnMode === "undefined") {
				ret.returnMode = pm.id;
			}
		});
	}
	// Send image update requests
	let calls = [];
	let imgTag = document.getElementById("edit-image");
	if (vue.screen.data.deleteImage) {
		pm.hasImage = false;
		calls.push({id: "pmImg", method: "DELETE", target: "api/image/paymentmode/" + encodeURIComponent(pm.id)});
	} else if (imgTag.files.length != 0) {
		pm.hasImage = true;
		if (vue.screen.data.hadImage) {
			calls.push({id: "pmImg",
					method: "PATCH",
					target: "api/image/paymentmode/" + encodeURIComponent(pm.id), data: imgTag.files[0]
			});
		} else {
			calls.push({id: "pmImg",
					method: "PUT",
					target: "api/image/paymentmode/" + encodeURIComponent(pm.id),
					data: imgTag.files[0]
			});
		}
	}
	for (let i = 0; i < pm.values.length; i++) {
		let pmValue = pm.values[i];
		let imgValueTag = document.getElementById("edit-value-image-" + pmValue.value);
		if (pmValue.value in vue.screen.data.deleteValueImage && vue.screen.data.deleteValueImage[pmValue.value]) {
			pmValue.hasImage = false;
			calls.push({id: "pmValueImg-" + pmValue.value,
					method: "DELETE",
					target: "api/image/paymentmodevalue/" + encodeURIComponent(pm.id) + "-" + encodeURIComponent(pmValue.value)
			});
		} else if (imgValueTag.files.length != 0) {
			pmValue.hasImage = true;
			if (pmValue.value in vue.screen.data.hadValueImage && vue.screen.data.hadValueImage[pmValue.value]) {
				calls.push({id: "pmValueImg-" + pmValue.value,
						method: "PATCH",
						target: "api/image/paymentmodevalue/" + encodeURIComponent(pm.id) + "-" + encodeURIComponent(pmValue.value),
						data: imgValueTag.files[0]
				});
			} else {
				calls.push({id: "pmValueImg-" + pmValue.value,
						method: "PUT",
						target: "api/image/paymentmodevalue/" + encodeURIComponent(pm.id) + "-" + encodeURIComponent(pmValue.value),
						data: imgValueTag.files[0]
				});
			}
		}
	}
	if (calls.length > 0) {
		srvcall_multicall(calls, _paymentmodes_savePreCommit);
	}
 else {
		_paymentmodes_saveCommit(pm);
	}
}

function _paymentmodes_savePreCommit(calls) {
	_paymentmodes_saveCommit(vue.screen.data.paymentMode);
}

function _paymentmodes_saveCommit(pm) {
	document.getElementById("edit-image").value = "";
	if (pm.hasImage) {
		// Force image refresh
		pm.hasImage = false;
		pm.hasImage = true;
	}
	for (let i = 0; i < pm.values.length; i++) {
		let pmValue = pm.values[i];
		if (pmValue.hasImage) {
			pmValue.hasImage = false;
			pmValue.hasImage = true;
		}
		let imgValueTag = document.getElementById("edit-value-image-" + pmValue.value);
		imgValueTag.value = "";
	}
	// Update in local database
	storage_open(function(event) {
		storage_write("paymentmodes", pm,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}
function users_show() {
	gui_showLoading();
	vue.screen.data = {users: [], roles: []};
	storage_open(function(event) {
		storage_readStores(["users", "roles"], function(data) {
			let rolesByIds = {};
			for (let i = 0; i < data["roles"].length; i++) {
				rolesByIds[data["roles"][i].id] = data["roles"][i];
			}
			vue.screen.data.roles = rolesByIds;
			vue.screen.data.users = data["users"];
			vue.screen.component = "vue-user-list"
			gui_hideLoading();
			storage_close();
		});
	});
}

function users_showUser(id) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStore("roles", function(roles) {
			if (id != null) {
				storage_get("users", parseInt(id), function(user) {
					_users_showUser(user, roles);
					storage_close();
				});
			} else {
				_users_showUser(User_default(), roles);
				storage_close();
			}
		});
	});
}

function _users_showUser(user, roles) {
	let roleByIds = {};
	for (let i = 0; i < roles.length; i++) {
		roleByIds[roles[i].id] = roles[i];
	}
	vue.screen.data = {
		user: user,
		roles: roleByIds,
	}
	vue.screen.component = "vue-user-form";
	gui_hideLoading();
}

function user_saveUser() {
	let user = vue.screen.data.user;
	gui_showLoading();
	srvcall_post("api/user", user, user_saveCallback);
}

function user_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, user_saveUser)) {
		return;
	}
	if (status == 400) {
		// gui_showError("Quelque chose cloche dans les données du formulaire. " + request.statusText);
		gui_showError("Something is wrong with the form data. " + request.statusText);
		gui_hideLoading();
		return;
	}
	let user = vue.screen.data.user;
	if (!("id" in user)) {
		let respUser = JSON.parse(response);
		user.id = respUser["id"];
	}
	_user_saveCommit(user);
}

function _user_saveCommit(user) {
	// Update in local database
	storage_open(function(event) {
		storage_write("users", user,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}

function users_updatePassword() {
	let user = vue.screen.data.user;
	let password = document.getElementById("edit-reset-password").value;
	gui_showLoading();
	srvcall_post("api/user/" + encodeURIComponent(user.id) + "/password", {"oldPassword": user.password, "newPassword": password}, user_updPwdCallback);
}

function user_updPwdCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, users_updatePassword)) {
		return;
	}
	if (status == 400) {
		// gui_showError("Quelque chose cloche dans les données du formulaire. " + request.statusText);
		gui_showError("Something is wrong with the form data. " + request.statusText);

		gui_hideLoading();
		return;
	}
	let respPwd = JSON.parse(response);
	if (respPwd != true) {
		gui_showError("The password could not be changed.");
		gui_hideLoading();
	} else {
		gui_showMessage("The password has been reset.");
		gui_hideLoading();
		// Store the updated password localy even if it is not encrypted yet (until next sync)
		storage_open(function(event) {
			let user = vue.screen.data.user;
			user.password = document.getElementById("edit-reset-password").value;
			storage_write("users", user, appData.localWriteDbSuccess,
				function(event) {
					gui_hideLoading();
					gui_showError("Le mot de passe a été réinitialisé mais une erreur est survenue<br />" + event.target.error);
					storage_close();
				});
		});
	}
}
function roles_show() {
	gui_showLoading();

	storage_open(function(event) {
		storage_readStore("roles", function(roles) {
			vue.screen.data = {roles: roles};
			vue.screen.component = "vue-role-list"
			gui_hideLoading();
			storage_close();
		});
	});
}

function roles_showRole(id) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStore("paymentmodes", function(paymentModes) {
			if (id != null) {
				storage_get("roles", parseInt(id), function(role) {
					_roles_showRole(role, paymentModes);
					storage_close();
				});
			} else {
				_roles_showRole(Role_default(), paymentModes);
				storage_close();
			}
		});
	});
}

function _roles_showRole(role, paymentModes) {
	vue.screen.data = {
		role: role,
		paymentModes: paymentModes,
		permissions: {
			session: [
				{value: "button.openmoney", name: "Open the cash register"},
				{value: "fr.pasteque.pos.panels.JPanelCloseMoney", name: "Close the cash register"},
				{value: "fr.pasteque.pos.panels.JPanelPayments", name: "Perform cash register operations"},
				{value: "fr.pasteque.pos.sales.JPanelTicketEdits", name: "Control sales (Desktop)"},
				{value: "sales.EditTicket", name: "Control sales (Android)"},
				{value: "button.print", name: "Print an order"},
				{value: "button.opendrawer", name: "Open cash drawer outside payment (Desktop)"},
			],
			tickets: [
				{value: "fr.pasteque.pos.sales.JPanelTicketSales", name: "Take orders"},
				{value: "sales.Total", name: "Process payment for an order"},
				{value: "sales.EditLines", name: "Cancel/reduce an order"},
				{value: "sales.RefundTicket", name: "Refund a ticket"},
				{value: "sales.PrintTicket", name: "Reprint a ticket"},
			],
			misc: [
				{value: "fr.pasteque.pos.customers.JPanelCustomer", name: "Create customer accounts"},
				{value: "Menu.ChangePassword", name: "Change own password"},
				{value: "fr.pasteque.pos.config.JPanelConfiguration", name: "Access configuration screen (Desktop)"},
				{value: "fr.pasteque.pos.panels.JPanelPrinter", name: "Print history (Desktop)"},
			],
		}

	}
	vue.screen.component = "vue-role-form";
	gui_hideLoading();
}

function role_saveRole() {
	let role = vue.screen.data.role;
	gui_showLoading();
	srvcall_post("api/role", role, role_saveCallback);
}

function role_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, category_saveCategory)) {
		return;
	}
	if (status == 400) {
		gui_showError("Something's wrong with the form data. " + request.statusText);
		gui_hideLoading();
		return;
	}
	let role = vue.screen.data.role;
	if (!("id" in role)) {
		let respRole = JSON.parse(response);
		role.id = respRole["id"];
	}
	_role_saveCommit(role);
}

function _role_saveCommit(role) {
	// Update in local database
	storage_open(function(event) {
		storage_write("roles", role,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}
function cashregisters_show() {
	gui_showLoading();
	storage_open(function(event) {
		let crStore = appData.db.transaction(["cashRegisters"], "readonly").objectStore("cashRegisters");
		let crs = [];
		vue.screen.data = {cashRegisters: []};
		storage_readStore("cashRegisters", function(cashRegisters) {
			vue.screen.data.cashRegisters = cashRegisters;
			vue.screen.component = "vue-cashregister-list"
			storage_close();
			gui_hideLoading();
		});
	});
}

function cashregisters_showCashRegister(id) {
	gui_showLoading();
	if (id != null) {
		storage_open(function(event) {
			storage_get("cashRegisters", parseInt(id), function(cashRegister) {
				_cashregisters_showCashRegister(cashRegister);
				storage_close();
			});
		});
	} else {
		_cashregisters_showCashRegister(CashRegister_default());
	}
}
function _cashregisters_showCashRegister(cashRegister) {
	vue.screen.data = {
		cashRegister: cashRegister,
	}
	vue.screen.component = "vue-cashregister-form";
	gui_hideLoading();
}

function cashregister_saveCashRegister() {
	let cashRegister = vue.screen.data.cashRegister;
	gui_showLoading();
	srvcall_post("api/cashregister", cashRegister, cashregister_saveCallback);
}

function cashregister_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, cashregister_saveCashRegister)) {
		return;
	}
	if (status == 400) {
		gui_showError("Something's wrong with the form data. " + request.statusText);
		gui_hideLoading();
		return;
	}
	let cashRegister = vue.screen.data.cashRegister;
	if (!("id" in cashRegister)) {
		let respCr = JSON.parse(response);
		cashRegister.id = respCr["id"];
	}
	_cashregister_saveCommit(cashRegister);
}

function _cashregister_saveCommit(cashRegister) {
	storage_open(function(event) {
		storage_write("cashRegisters", cashRegister,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteOpenDbError);
}
let _resources_caredResources = [
	"Printer.Ticket.Logo",
	"Printer.Ticket.Header",
	"Printer.Ticket.Footer",
	"MobilePrinter.Logo",
	"MobilePrinter.Header",
	"MobilePrinter.Footer"
];

function _resources_resType(label) {
	switch (label) {
		case "Printer.Ticket.Logo":
		case "MobilePrinter.Logo":
			return Resource_TYPE_IMAGE;
		case "Printer.Ticket.Header":
		case "Printer.Ticket.Footer":
		case "MobilePrinter.Header":
		case "MobilePrinter.Footer":
			return Resource_TYPE_TEXT;
	}
}

function _resources_careAbout(res) {
	let lbl = res.label;
	for (let i = 0; i < _resources_caredResources.length; i++) {
		if (res.label == _resources_caredResources[i]) {
			return true;
		}
	}
	return false;
}

function _resources_fill(resources) {
	let missingResources = [];
	for (let i = 0; i < _resources_caredResources.length; i++) {
		let missing = true;
		for (let j = 0; j < resources.length; j++) {
			if (_resources_caredResources[i] == resources[j].label) {
				missing = false;
				break;
			}
		}
		if (missing) {
			let res = Resource_default();
			res.label = _resources_caredResources[i];
			res.type = _resources_resType(res.label);
			_resources_fillCustomData(res);
			missingResources.push(res);
		}
	}
	for (let i = 0; i < missingResources.length; i++) {
		resources.push(missingResources[i]);
	}
}

function _resources_fillCustomData(res) {
	let lbl = res.label;
	switch (lbl) {
		case "Printer.Ticket.Logo":
			res.dispName = "Logo of ticket (Desktop)";
			res.dispOrder = 0;
			break;
		case "Printer.Ticket.Header":
			res.dispName = "Ticket header (Desktop)";
			res.textWidth = 42;
			res.dispOrder = 1;
			break;
		case "Printer.Ticket.Footer":
			res.dispName = "Ticket footer (Desktop)";
			res.textWidth = 42;
			res.dispOrder = 2;
			break;
		case "MobilePrinter.Logo":
			res.dispName = "Logo of ticket (Android)";
			res.dispOrder = 3;
			break;
		case "MobilePrinter.Header":
			res.dispName = "Ticket header (Android)";
			res.textWidth = 32;
			res.dispOrder = 4;
			break;
		case "MobilePrinter.Footer":
			res.dispName = "Ticket footer (Android)";
			res.textWidth = 32;
			res.dispOrder = 5;
			break;
	}
}

function _resource_unsetCustomData(res) {
	delete res.dispName;
	delete res.textWidth;
}

function resources_show() {
	gui_showLoading();
	storage_open(function(event) {
		let res = []
		storage_readStore("resources", function(resources) {
			for (let i = 0; i < resources.length; i++) {
				if (_resources_careAbout(resources[i])) {
					_resources_fillCustomData(resources[i]);
					res.push(resources[i]);
				}
			}
			_resources_fill(res);
			_resources_showResources(res);
			storage_close();
		});
	});
}

function _resources_showResources(resources) {
	gui_hideLoading();
	let sortedRes = resources.sort(tools_sort("dispOrder"));
	vue.screen.data = {
		"resources": sortedRes
	}
	vue.screen.component = "vue-resources-list";
}

function resources_showResource(resLabel) {
	gui_showLoading();
	if (resLabel == "option.customer.customFields") {
		CustomerDef.loadCustomizedContactFields(function(contactFields) {
			let orderedFields = [];
			CustomerDef.contactFieldList.forEach(f => {
				orderedFields.push(contactFields[f]);
			});
			vue.screen.data = {
				contactFields: orderedFields
			};
			vue.screen.component="vue-customercontact";
		});
		return;
	}
	storage_open(function(event) {
		storage_get("resources", resLabel, function(res) {
			if (typeof(res) == "undefined") {
				res = Resource_default();
				res.label = resLabel;
				res.type = _resources_resType(res.label);
			}
			_resources_fillCustomData(res);
			vue.screen.data = {
				resource: res,
				deleteImage: false,
				resTypes: {"Resource_TYPE_TEXT": Resource_TYPE_TEXT}, // Phoque
				hasImage: res.content != null,
				hadImage: res.content != null,
				deleteContentButton: "Supprimer",
			};
			if (res.type == Resource_TYPE_IMAGE) {
			}
			vue.screen.component = "vue-resource-form";
			gui_hideLoading();
			storage_close();
		});
	});
}

function resources_toggleImage() {
	if (vue.screen.data.hasImage) {
		vue.screen.data.hasImage = false;
		vue.screen.data.deleteImage = true;
		document.getElementById("edit-image").value = "";
		vue.screen.data.deleteContentButton = "Restaurer";
	} else {
		vue.screen.data.hasImage = true;
		vue.screen.data.deleteImage = false;
		vue.screen.data.deleteContentButton = "Supprimer";
	}
}

function resources_saveResource() {
	let res = vue.screen.data.resource;
	_resource_unsetCustomData(res);
	gui_showLoading();
	if (res.type == Resource_TYPE_TEXT) {
		if (res.content == "") {
			srvcall_delete("api/resource/" + encodeURIComponent(res.label), _resources_saveCallback);
		} else {
			srvcall_post("api/resource", res, _resources_saveCallback);
		}
	} else {
		if (vue.screen.data.deleteImage) {
			srvcall_delete("api/resource/" + encodeURIComponent(res.label), _resources_saveCallback);
		} else {
			let imgTag = document.getElementById("edit-image");
			if (imgTag.files.length != 0) {
				let reader = new FileReader();
				reader.onload = function(event) {
					let fileContent = btoa(event.target.result);
					res.content = fileContent;
					srvcall_post("api/resource", res, _resources_saveCallback);
				};
				reader.onerror = function(event) {
					gui_hideLoading();
					// gui_showError("Le fichier n'a pu être envoyé");
					gui_showError("The file could not be sent");
				}
				reader.readAsBinaryString(imgTag.files[0]);
			} else {
				gui_hideLoading();
				// gui_showMessage("Les modifications ont été enregistrées");
				gui_showMessage("The changes have been saved");
			}
		}
	}
}

function _resources_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, resources_saveResource)) {
		return;
	}
	if (status == 400) {
		gui_showError("Something is wrong with the form data. " + request.statusText);
		gui_hideLoading();
		return;
	}
	_resources_saveCommit(vue.screen.data.resource);
}

function _resources_saveCommit(res) {
	if (res.hasImage) {
		// Force image refresh
		res.hasImage = false;
		res.hasImage = true;
	}
	// Update in local database
	storage_open(function(event) {
		if (res.type == Resource_TYPE_TEXT && res.content == "") {
			storage_delete("resources", res.label,
				appData.localWriteDbSuccess, appData.localWriteDbError);
		} else {
			storage_write("resources", res, function(event) {
				appData.localWriteDbSuccess(event);
				_resources_fillCustomData(res);
			}, appData.localWriteDbError);
		}
	}, appData.localWriteDbOpenError);
}

function resources_saveCustomFields(option) {
	if (arguments.length == 0) {
		option = vue.screen.data.option;
	} else {
		vue.screen.data.option = option;
	}
	srvcall_post("api/option", option, _resources_saveCustomFieldsCallback);
}

function _resources_saveCustomFieldsCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, resources_saveCustomFields)) {
		return;
	}
	if (status == 400) {
		gui_showError("Something is wrong with the form data. " + request.statusText);
		gui_hideLoading();
		return;
	}
	_resources_saveCustomFieldsCommit(vue.screen.data.option);
}

function _resources_saveCustomFieldsCommit(option) {
	// Update in local database
	storage_open(function(event) {
		storage_write("options", option, function(event) {
			appData.localWriteDbSuccess(event);
		}, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}
function discountprofiles_show() {
	gui_showLoading();
	vue.screen.data = {discountProfiles: []};
	storage_open(function(event) {
		storage_readStore("discountprofiles", function(profiles) {
			vue.screen.data.discountProfiles = profiles;
			vue.screen.component = "vue-discountprofile-list"
			gui_hideLoading();
			storage_close();
		});
	});
}

function discountprofiles_showProfile(id) {
	gui_showLoading();
	if (id != null) {
		storage_open(function(event) {
			storage_get("discountprofiles", parseInt(id), function(dp) {
				_discountprofiles_showProfile(dp);
				storage_close();
			});
		});
	} else {
		_discountprofiles_showProfile(DiscountProfile_default());
	}
}

function _discountprofiles_showProfile(profile) {
	vue.screen.data = {
		discountProfile: profile,
	}
	vue.screen.component = "vue-discountprofile-form";
	gui_hideLoading();
}

function discountprofile_saveProfile() {
	let profile = vue.screen.data.discountProfile;
	gui_showLoading();
	srvcall_post("api/discountprofile", profile, discountprofile_saveCallback);
}

function discountprofile_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, discountprofile_saveProfile)) {
		return;
	}
	if (status == 400) {
		gui_showError("Something is wrong with the form data. " + request.statusText);
		gui_hideLoading();
		return;
	}
	let profile = vue.screen.data.discountProfile;
	if (!("id" in profile)) {
		let respProfile = JSON.parse(response);
		profile.id = respProfile["id"];
	}
	// Update in local database
	storage_open(function(event) {
		storage_write("discountprofiles", profile,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}

function discountprofiles_showImport() {
	vue.screen.data = {
		"modelDef": DiscountProfileDef,
	};
	vue.screen.component = "vue-discountprofile-import";
}

function _discountprofiles_parseCsv(fileContent, callback) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStore("discountprofiles", function(discountProfiles) {
			let parser = new CsvParser(DiscountProfileDef, discountProfiles, []);
			let imported = parser.parseContent(fileContent);
			storage_close();
			gui_hideLoading();
			vue.screen.data.newProfiles = imported.newRecords;
			vue.screen.data.editedProfiles = imported.editedRecords;
			callback(imported);
		});
	});
}

function discountprofiles_saveDiscountProfiles() {
	let calls = [];
	for (let i = 0; i < vue.screen.data.newProfiles.length; i++) {
		let profile = vue.screen.data.newProfiles[i];
		calls.push({id: "new-" + i, method: "POST", target: "api/discountprofile", data: profile});
	}
	for (let i = 0; i < vue.screen.data.editedProfiles.length; i++) {
		let profile = vue.screen.data.editedProfiles[i];
		calls.push({id: "edit-" + i, method: "POST", target: "api/discountprofile", data: profile});
	}
	vue.screen.data.progress = 0;
	vue.screen.data.progressTotal = calls.length;
	gui_showProgress(vue.screen.data.progress, vue.screen.data.progressTotal);
	srvcall_multicall(calls, discountprofiles_saveMultipleCallback, _discountprofiles_progress);
}

function _discountprofiles_progress() {
	vue.screen.data.progress++;
	gui_showProgress(vue.screen.data.progress, vue.screen.data.progressTotal);
}

function discountprofiles_saveMultipleCallback(results) {
	if (Object.keys(results).length > 0) {
		let res = results[Object.keys(results)[0]];
		let showMsg = function() {
			gui_hideLoading();
			gui_showWarning("The data was not sent, please try the operation again.");
		}
		if (srvcall_callbackCatch(res.request, res.status, res.response, showMsg)) {
			return;
		}
	}
	errors = [];
	saves = [];
	for (let reqId in results) {
		let request = results[reqId].request;
		let status = results[reqId].status;
		let response = results[reqId].response;
		if (status == 400) {
			errors.push("There is something wrong with the form data. " + request.statusText);
			continue;
		}
		if (reqId.substr(0, 4) == "new-") {
			let num = parseInt(reqId.substr(4));
			let profile = vue.screen.data.newProfiles[num];
			let respProfile = JSON.parse(response);
			profile.id = respProfile.id;
			saves.push(profile);
		} else {
			let num = parseInt(reqId.substr(5));
			let profile = vue.screen.data.editedProfiles[num];
			saves.push(profile);
		}
	}
	// Commit changes locally
	let commitSuccess = function(data) {
		gui_hideLoading();
		if (errors.length > 0) {
			if (saves.length > 0) {
				errors.push("The other records have been processed. You can reload the file to find the errors.");
			}
			gui_showError(errors);
		} else {
			gui_showMessage("The data has been saved.");
		}
		vue.screen.data = {};
		vue.$refs.screenComponent.reset();
		discountprofiles_showImport();
	}
	if (saves.length == 0) {
		gui_hideLoading();
		if (errors.length == 0) {
			gui_showErrors("No operation.");
		} else {
			gui_showErrors(errors);
		}
	} else {
		storage_open(function(event) {
			storage_write("discountprofiles", saves,
				commitSuccess, appData.localWriteDbError);
		}, appData.localWriteDbOpenError);
	}
}
function currencies_show() {
	gui_showLoading();
	vue.screen.data = {currencies: []};
	storage_open(function(event) {
		storage_readStore("currencies", function(currencies) {
			vue.screen.data.currencies = currencies;
			vue.screen.component = "vue-currency-list"
			storage_close();
			gui_hideLoading();
		});
	});
}

function currencies_showCurrency(id) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStore("currencies", function(currencies) {
			if (id != null) {
				storage_get("currencies", parseInt(id), function(currency) {
					_currencies_showCurrency(currency, currencies);
					storage_close();
				});
			} else {
				_currencies_showCurrency(Currency_default(), currencies);
				storage_close();
			}
		});
	});
}
function _currencies_showCurrency(currency, currencies) {
	let wasMain = false;
	if (currency.main) {
		wasMain = true; // force by value
	}
	vue.screen.data = {
		currency: currency,
		currencies: currencies,
		wasMain: wasMain,
	}
	vue.screen.component = "vue-currency-form";
	gui_hideLoading();
}

function currency_saveCurrency() {
	let curr = vue.screen.data.currency;
	gui_showLoading();
	if ("id" in curr) {
		srvcall_post("api/currency", curr, currency_saveCallback);
	} else {
		srvcall_put("api/currency/" + encodeURIComponent(curr["reference"]), curr, currency_saveCallback);
	}
}

function currency_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, currency_saveCurrency)) {
		return;
	}
	if (status == 400) {
		if (request.statusText === "Reference is already taken") {
			gui_showError("The reference already exists. Please choose another one.");
			document.getElementById("edit-reference").focus(); // TODO: Make this Vue-friendly.
		} else {
			gui_showError("Something's wrong with the form data. " + request.statusText);
		}

		gui_hideLoading();
		return;
	}
	let curr = vue.screen.data.currency;
	if (!("id" in curr)) {
		let respCurr = JSON.parse(response);
		curr.id = respCurr["id"];
	}
	// Update in local database
	storage_open(function(event) {
		if (!vue.screen.data.wasMain && curr.main) {
			// Set main to false to the previously main currency
			let currStore = appData.db.transaction(["currencies"], "readwrite").objectStore("currencies");
			currStore.openCursor().onsuccess = function(event) {
				let cursor = event.target.result;
				if (cursor) {
					let oldCurr = cursor.value;
					if (oldCurr.main) {
						oldCurr.main = false;
						storage_write("currencies", oldCurr, function(event) {
							_currency_saveCommit(curr);
							return;
						});
					}
					cursor.continue();
				} else {
					_currency_saveCommit(curr);
				}
			};
		} else {
			_currency_saveCommit(curr);
		}
	});
}

function _currency_saveCommit(curr) {
	storage_write("currencies", curr,
		appData.localWriteDbSuccess, appData.localWriteDbError);
}
function producttags_show() {
	gui_showLoading();
	vue.screen.data = {
		formats: productTagFormats,
		format: 0,
		marginH: 0,
		marginV: 0,
		startFrom: 1,
		tags: [],
	}
	storage_open(function(event) {
		storage_readStores(["categories", "taxes", "currencies"], function(data) {
			vue.screen.data.categories = data.categories;
			vue.screen.data.taxById = {};
			for (let i = 0; i < data.taxes.length; i++) {
				let tax = data.taxes[i];
				vue.screen.data.taxById[tax.id] = tax;
			}
			for (let i = 0; i < data.currencies.length; i++) {
				if (data.currencies[i].main) {
					vue.screen.data.currency = data.currencies[i];
					break;
				}
			}
			vue.screen.component = "vue-producttags-form";
			gui_hideLoading();
			storage_close();
		});
	});
}


function producttags_addTag(product) {
	let tags = vue.screen.data.tags;
	for (let i = 0; i < tags.length; i++) {
		let tag = tags[i];
		if (tag.product.id == product.id) {
			tag.quantity++;
			return;
		}
	}
	//vue.screen.data.productCache[product.id] = product;
	tags.push({"product": product, "quantity": 1});
}

function producttags_delTag(productId) {
	let tags = vue.screen.data.tags;
	for (let i = 0; i < tags.length; i++) {
		let tag = tags[i];
		if (tag.product.id == productId) {
			tags.splice(i, 1);
			return;
		}
	}
}

function _producttags_addPdfTag(content, format, product, col, row, dh, dv) {
	let tax = vue.screen.data.taxById[product.tax];
	let priceSellVat = (product.priceSell * (1 + tax.rate));
	let priceOne = priceSellVat / product.scaleValue;
	let x = format.margin.h + dh + col * format.table.colSize + col * format.padding.h;
	let y = format.margin.v + dv + row * format.table.rowSize + row * format.padding.v;
	// Draw label limits
	let top = y;
	let bottom = y + format.table.rowSize;
	let left = x;
	let right = x + format.table.colSize;
	content.push({absolutePosition: {x: 0, y: 0}, canvas: [
		// Top left corner
		{type: "line", x1: left * MM_TO_PT, y1: top * MM_TO_PT, x2: (left + 1) * MM_TO_PT, y2: top * MM_TO_PT, lineWidth: 1},
		{type: "line", x1: left * MM_TO_PT, y1: top * MM_TO_PT, x2: left * MM_TO_PT, y2: (top + 1) * MM_TO_PT, lineWidth: 1},
		// Top right corner
		{type: "line", x1: (right - 1) * MM_TO_PT, y1: top * MM_TO_PT, x2: right * MM_TO_PT, y2: top * MM_TO_PT, lineWidth: 1},
		{type: "line", x1: right * MM_TO_PT, y1: top * MM_TO_PT, x2: right * MM_TO_PT, y2: (top + 1) * MM_TO_PT, lineWidth: 1},
		// Bottom left corner
		{type: "line", x1: left * MM_TO_PT, y1: bottom * MM_TO_PT, x2: (left + 1) * MM_TO_PT, y2: bottom * MM_TO_PT, lineWidth: 1},
		{type: "line", x1: left * MM_TO_PT, y1: (bottom - 1) * MM_TO_PT, x2: left * MM_TO_PT, y2: bottom * MM_TO_PT, lineWidth: 1},
		// Bottom right corner
		{type: "line", x1: (right - 1) * MM_TO_PT, y1: bottom * MM_TO_PT, x2: right * MM_TO_PT, y2: bottom * MM_TO_PT, lineWidth: 1},
		{type: "line", x1: right * MM_TO_PT, y1: (bottom - 1) * MM_TO_PT, x2: right * MM_TO_PT, y2: bottom * MM_TO_PT, lineWidth: 1},
	]});
	// Label
	content.push({columns: [{
		width: format.label.width * MM_TO_PT,
		text: product.label,
		absolutePosition: {x: (left + format.label.x) * MM_TO_PT, y: (top + format.label.y) * MM_TO_PT},
		fontSize: format.label.dots,
	}]});
	// Barcode
	if (product.barcode != "") {
		let element = document.createElement("img");
		JsBarcode(element, product.barcode);
		content.push({columns: [{
			image: element.getAttribute("src"),
			width: format.barcode.width * MM_TO_PT,
			height: format.barcode.height * MM_TO_PT,
			absolutePosition: {x: (left + format.barcode.x) * MM_TO_PT, y: (top + format.barcode.y) * MM_TO_PT},
		}]});
	}
	// Price
	content.push({columns: [{
		width: format.price.width,
		absolutePosition: {x: (left + format.price.x) * MM_TO_PT, y: (top + format.price.y) * MM_TO_PT},
		text: priceSellVat.toLocaleString(undefined, { minimumFractionDigits: 2 }) + vue.screen.data.currency.symbol,
		fontSize: format.price.dots,
	}]});
	// Price by unit
	let priceRefText = priceOne.toLocaleString(undefined, { minimumFractionDigits: 2 }) + vue.screen.data.currency.symbol;
	switch (product.scaleType) {
		case 1:
			priceRefText += " per kg";
			break;
		case 2:
			priceRefText += " per litre";
			break;
		case 3:
			priceRefText += " per hour";
			break;
	}
	if (product.scaleType != 0) {
		content.push({ columns: [{
			width: format.unit.width,
			absolutePosition: { x: (left + format.unit.x) * MM_TO_PT, y: (top + format.unit.y) * MM_TO_PT},
			text: priceRefText,
			fontSize: format.unit.dots,
		}]});
	}
	// Reference
	content.push({columns: [{
		width: format.reference.width,
		absolutePosition: {x: (left + format.reference.x) * MM_TO_PT, y: (top + format.reference.y) * MM_TO_PT},
		text: product.reference,
		fontSize: format.reference.dots,
	}]});
}

function producttags_generatePdf() {
	let tagList = [];
	for (let i = 0; i < vue.screen.data.tags.length; i++) {
		let tag = vue.screen.data.tags[i];
		let count = tag.quantity;
		for (let j = 0; j < count; j++) {
			tagList.push(tag);
		}
	}
	let format = vue.screen.data.formats[vue.screen.data.format];
	let fonts = {
		tiresias: {
			normal: "Tiresias_Infofont.ttf",
		}
	}
	pdfDef = {
		pageSize: format.paper.size,
		pageOrientation: format.paper.orientation,
		defaultStyle: {
			font: "tiresias",
		},
		content: []
	};
	let col = vue.screen.data.startFrom - 1;
	let row = Math.floor(col / format.table.colNum);
	col %= format.table.colNum;
	for (let i = 0; i < tagList.length; i++) {
		let tag = tagList[i];
		_producttags_addPdfTag(pdfDef.content, format, tag.product, col, row, vue.screen.data.marginH, vue.screen.data.marginV);
		col++;
		if (col == format.table.colNum) {
			row++;
			if (row == format.table.rowNum) {
				pdfDef.content[pdfDef.content.length -1].pageBreak = "after";
				row = 0;
			}
			col = 0;
		}
	}
	let pdf = pdfMake.createPdf(pdfDef, null, fonts);
	pdf.download();
}

function taxes_show() {
	gui_showLoading();
	vue.screen.data = {taxes: []};
	storage_open(function(event) {
		storage_readStore("taxes", function(taxes) {
			vue.screen.data.taxes = taxes;
			vue.screen.component = "vue-tax-list"
			storage_close();
			gui_hideLoading();
		});
	});
}

function taxes_showTax(id) {
	gui_showLoading();
	if (id == null) {
		_taxes_showTax(Tax_default());
		gui_hideLoading();
	} else {
		storage_open(function(event) {
			storage_get("taxes", parseInt(id), function(tax) {
				_taxes_showTax(tax);
				storage_close();
			});
		});
	}
}
function _taxes_showTax(tax) {
	vue.screen.data = {
		tax: tax,
	}
	vue.screen.component = "vue-tax-form";
	gui_hideLoading();
}

function taxes_saveTax() {
	let tax = vue.screen.data.tax;
	gui_showLoading();
	srvcall_post("api/tax", tax, taxes_saveCallback);
}

function taxes_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, taxes_saveTax)) {
		return;
	}
	if (status == 400) {
		gui_showError("Something is wrong with the form data. " + request.statusText);
		gui_hideLoading();
		return;
	}
	let tax = vue.screen.data.tax;
	if (!("id" in tax)) {
		let respTax = JSON.parse(response);
		tax.id = respTax["id"];
	}
	// Update in local database
	storage_open(function(event) {
		storage_write("taxes", tax,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteOpenDbError);
}
function preferences_show() {
	gui_showLoading();
	storage_open(function(event) {
		storage_get("options", OPTION_PREFERENCES, function(option) {
			vue.screen.data = {
				font: "sans",
				tablePageSize: 250,
			};
			if (option != null) {
				let content = JSON.parse(option.content);
				if ("font" in content) {
					vue.screen.data.font = content.font;
				}
				if ("tablePageSize" in content) {
					vue.screen.data.tablePageSize = content.tablePageSize;
				}
			}
			vue.screen.component = "vue-preferences";
			storage_close();
			gui_hideLoading();
		});
	});
}

function preferences_save() {
	gui_showLoading();
	let preferences = Option(OPTION_PREFERENCES, JSON.stringify(vue.screen.data));
	storage_setSessionOption("font", null);
	srvcall_post("api/option", preferences, preferences_saveCallback);
}

function preferences_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, preferences_save)) {
		return;
	}
	var data = JSON.parse(response);
	storage_open(function(event) {
		storage_write("options", data, appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}

function accounting_showZ() {
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	storage_open(function(event) {
		storage_get("options", OPTION_ACCOUNTING_CONFIG, function(option) {
			let values = {
				sales: {},
				taxes: {},
				paymentModes: {},
				customers: {},
				extra: {},
			}
			if (option) {
				// Set values from option
				values = JSON.parse(option.content);
			}
			vue.screen.data = {
				"start": start,
				"stop": stop,
				"accounts": values,
				"missing": {
					sales: {},
					taxes: {},
					customers: {},
					paymentModes: {},
					extra: {},
				},
				"table": new Table().reference("accounting-z-list")

					.column(new TableCol().reference("date").label("Date").type(TABLECOL_TYPE.DATE).visible(true).help("Session opening date."))
					.column(new TableCol().reference("account").label("Account").visible(true).help("Account number for the entry"))
					.column(new TableCol().reference("label").label("Description").visible(true).help("Entry description"))
					.column(new TableCol().reference("debit").label("Debit").visible(true).type(TABLECOL_TYPE.NUMBER2))
					.column(new TableCol().reference("credit").label("Credit").visible(true).type(TABLECOL_TYPE.NUMBER2))
					.column(new TableCol().reference("reference").label("Document").visible(true).help("Reference document name for the entry"))

			}
			vue.screen.component = "vue-accounting-z";
			storage_close();
		});
	});
}

function accounting_ztickets_filter() {
	let start = vue.screen.data.start;
	let stop = vue.screen.data.stop;
	start = start.getFullYear() + "-" + (start.getMonth() + 1) + "-" + start.getDate();
	srvcall_get("api/cash/search/?dateStart=" + start + "&dateStop=" + (stop.getTime() / 1000), _accounting_ztickets_filterCallback);
	gui_showLoading();
}

function _accounting_ztickets_filterCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, accounting_ztickets_filter)) {
		return;
	}
	let zTickets = JSON.parse(response);
	storage_open(function(event) {
		storage_readStores(["cashRegisters", "taxes", "categories", "paymentmodes", "customers"], function(data) {
			_accounting_parseZTickets(data["cashRegisters"], data["paymentmodes"],
				data["taxes"], data["categories"], data["customers"], zTickets);
			storage_close();
		});
	});
}

function _accounting_parseZTickets(cashRegisters, paymentModes, taxes, categories, customers, zTickets) {
	let cashRegistersById = [];
	cashRegisters.forEach(function(cr) {
		cashRegistersById[cr.id] = cr;
	});
	let paymentModesById = [];
	let paymentModeCash = null;
	paymentModes.forEach(function(pm) {
		paymentModesById[pm.id] = pm;
		if (pm.reference == "cash") {
			paymentModeCash = pm;
		}
	});
	let taxesById = [];
	taxes.forEach(function (tax) {
		taxesById[tax.id] = tax;
	});
	let customersById = [];
	customers.forEach(function(cust) {
		customersById[cust.id] = cust;
	});
	vue.screen.data.missing = {
		sales: {},
		taxes: {},
		customers: {},
		paymentModes: {},
		extra: {},
	};
	let lines = [];
	zTickets.forEach(function(z) {
		let totalDebit = 0.0;
		let totalCredit = 0.0;
		var date = new Date(z.openDate * 1000);
		let cashRegister = "";
		if (z.cashRegister in cashRegistersById) {
			cashRegister = cashRegistersById[z.cashRegister].label;
		}
		let ref = cashRegister + "-" + z.sequence;
		z.taxes.forEach(function (tax) {
			if (tax.base == 0.0) {
				return;
			}
			let accountSales = vue.screen.data.accounts.sales?.[tax.tax];
			if (!accountSales) {
				accountSales = "???";
				if (!(tax.tax in vue.screen.data.missing.sales)) {
					vue.screen.data.missing.sales[tax.tax] = taxesById?.[tax.tax]?.label;
				}
			}
			let labelSales = "Sales ";
			if (tax.tax in taxesById) {
				labelSales += taxesById[tax.tax].label;
			}
			let creditSales = "";
			let debitSales = "";
			if (tax.base > 0.0) {
				creditSales = tax.base;
				totalCredit += tax.base;
			} else {
				debitSales = -tax.base;
				totalDebit += -tax.base;
			}
			lines.push([date, accountSales, labelSales, debitSales, creditSales, ref]);
			if (tax.amount != 0.0) {
			let accountTax = vue.screen.data.accounts.taxes?.[tax.tax];
				if (!accountTax) {
					accountTax = "???";
					if (!(tax.tax in vue.screen.data.missing.taxes)) {
						vue.screen.data.missing.taxes[tax.tax] = taxesById?.[tax.tax]?.label;
					}
				}
				let labelTax = "VAT Collected";
				if (tax.tax in taxesById) {
					labelTax += taxesById[tax.tax].label;
				}
				let creditTax = "";
				let debitTax = "";
				if (tax.amount > 0.0) {
					creditTax = tax.amount;
					totalCredit += tax.amount;
				} else {
					debitTax = -tax.amount;
					totalDebit += -tax.amount;
				}
				lines.push([date, accountTax, labelTax, debitTax, creditTax, ref]);
			}
		});
		z.payments.forEach(function(pmt) {
			let label = "Payment Received";
			if (pmt.paymentMode in paymentModesById) {
				// Ignore debt and prepaid, those are accounted in customer's balance
				let mode = paymentModesById[pmt.paymentMode];
				label += mode.label;
				if ((mode.type & 0x2) || (mode & 0x4)) {
					return;
				}
			}
			let account = vue.screen.data.accounts.paymentModes?.[pmt.paymentMode];
			if (!account) {
				account = "???";
				if (!(pmt.paymentMode in vue.screen.data.missing.paymentModes)) {
					vue.screen.data.missing.paymentModes[pmt.paymentMode] = paymentModesById?.[pmt.paymentMode]?.label;
				}
			}
			let credit = "";
			let debit = "";
			if (pmt.amount > 0.0) {
				debit = pmt.amount;
				totalDebit += pmt.amount;
			} else {
				credit = -pmt.amount;
				totalCredit += -pmt.amount;
			}
			lines.push([date, account, label, debit, credit, ref]);
		});
		z.custBalances.forEach(function(cust) {
			let account = vue.screen.data.accounts.customers?.[cust.customer];
			if (!account) {
				account = "???";
				if (!(cust.customer in vue.screen.data.missing.customers)) {
					vue.screen.data.missing.customers[cust.customer] = customersById?.[cust.customer]?.dispName;
				}
			}
			let label = "Customer Balance";
			let credit = "";
			let debit = "";
			if (cust.customer in customersById) {
				label += customersById[cust.customer].dispName;
			}
			if (cust.balance > 0.0) {
				credit = cust.balance;
				totalCredit += cust.balance;
			} else {
				debit = -cust.balance;
				totalDebit += -cust.balance;
			}
			lines.push([date, account, label, debit, credit, ref]);
		});
		let closeError = 0.0;
		if (z.closeCash != null && z.expectedCash != null) {
			closeError = z.closeCash - z.expectedCash;
		}
		if (closeError != 0.0) {
			let label = "Cash Register Error";
			let account = null;
			if (paymentModeCash) {
				account = vue.screen.data.accounts.paymentModes?.[paymentModeCash.id];
				if (!account) {
					account = "???";
					if (!(paymentModeCash.id in vue.screen.data.missing.paymentModes)) {
						vue.screen.data.missing.paymentModes[paymentModeCash.id] = paymentModeCash.label;
					}
				}
			} else {
				account = "???";
			}
			let debit = "";
			let credit = "";
			if (closeError > 0.0) {
				debit = closeError;
				totalDebit += closeError;
			} else {
				credit = -closeError;
				totalCredit += -closeError;
			}
			lines.push([date, account, label, debit, credit, ref]);
		}
		let unbalance = totalDebit - totalCredit;
		if (Math.abs(unbalance) > 0.005) {
			let credit = "";
			let debit = "";
			let account, label;
			if (unbalance > 0.0) {
				label = "Exceptional Product";
				let key = "extraCredit";
				account = vue.screen.data.accounts.extra?.[key];
				if (!account) {
					account = "???";
					if (!(key in vue.screen.data.missing.extra)) {
						vue.screen.data.missing.extra[key] = label;
					}
				}
				credit = unbalance;
			} else {
				label = "Exceptional Loss";
				let key = "extraDebit";
				account = vue.screen.data.accounts.extra?.[key];
				if (!account) {
					account = "???";
					if (!(key in vue.screen.data.missing.extra)) {
						vue.screen.data.missing.extra[key] = label;
					}
				}
				debit = -unbalance;
			}
			lines.push([date, account, label, debit, credit, ref]);
		}
	});
	vue.screen.data.table.resetContent(lines);
	gui_hideLoading();
}

function accounting_showConfig() {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStores(["taxes", "paymentmodes", "customers"], function(data) {
				vue.screen.data = {
					taxes: data.taxes,
					paymentModes: data.paymentmodes,
					customers: data.customers,
					values: {
						sales: {},
						taxes: {},
						paymentModes: {},
						customers: {},
						extra: {},
					}
				};
			storage_get("options", OPTION_ACCOUNTING_CONFIG, function(option) {
				let values = vue.screen.data.values; // no values
				if (option) {
					// Set values from option
					values = JSON.parse(option.content);
				}
				["sales", "taxes", "paymentModes", "customers", "extra"].forEach(function(key) {
					if (!(key in values)) {
						values[key] = {};
					}
				});
				Object.keys(values.sales).forEach(tid => {
					vue.screen.data.values.sales[tid] = values?.sales?.[tid]
				});
				Object.keys(values.taxes).forEach(tid => {
					vue.screen.data.values.taxes[tid] = values?.taxes?.[tid]
				});
				Object.keys(values.paymentModes).forEach(pmId => {
					vue.screen.data.values.paymentModes[pmId] = values?.paymentModes?.[pmId];
				});
				Object.keys(values.customers).forEach(custId => {
					vue.screen.data.values.customers[custId + ""] = values?.customers?.[custId];
				});
				Object.keys(values.extra).forEach(id => {
					vue.screen.data.values.extra[id] = values?.extra?.[id];
				});
				vue.screen.component = "vue-accounting-config";
				storage_close();
				gui_hideLoading();
			});
		});
	});
}

function accounting_saveConfig() {
	gui_showLoading();
	// Remove empty string values
	let values = {
		sales: {},
		taxes: {},
		paymentModes: {},
		customers: {},
		extra: {},
	};
	for (key in values) {
		for (id in vue.screen.data.values[key]) {
			if (vue.screen.data.values[key][id] != "") {
				values[key][id] = vue.screen.data.values[key][id];
			}
		}
	}
	let config = Option(OPTION_ACCOUNTING_CONFIG, JSON.stringify(values));
	srvcall_post("api/option", config, accounting_saveConfigCallback);
}

function accounting_saveConfigCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, accounting_saveConfig)) {
		return;
	}
	let data = JSON.parse(response);
	storage_open(function(event) {
		storage_write("options", data, appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}
/** The loading screen component. Use gui_showLoading/gui_showProgress to use it.
 * @props loading The loading data structure {loading: (boolean) shown or hidden,
 * progress: (null|number) the current step in progressive loading,
 * progressMax: (null|number) the total number of loading steps}. */
Vue.component("vue-loading", {
	props: ["loading"],
	template: `<div id="loading" v-if="loading.loading">
	<p>Loading...</p>
	<p v-if="loading.progressMax" id="loading-progress">{{loading.progress}}/{{loading.progressMax}}</p>
</div>
`
});

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
Vue.component("vue-login", {
	props: ["login"],
	data: function() {
		return {
			"font": "default"
		};
	},
	template: `<div id="login" class="login-box" v-if="login.loggedIn == false">
	<aside class="box box-body">
		<div id="login-logo">
			<img src="res/img/opurexlogo.png" alt="Opurex POS Admin" />
		</div>
		<fieldset>
			<legend>Font</legend>
			<div class="form-group">
				<input id="font-pt" type="radio" name="font" value="default" v-model="font" />
				<label for="font-pt" class="default-font">Default</label>
			</div>
			<div class="form-group">
				<input id="font-system" type="radio" name="font" value="system" v-model="font" />
				<label for="font-system" class="no-font">Disable font</label>
			</div>
			<div class="form-group">
				<input id="font-opendyslexic" type="radio" name="font" value="opendyslexic" v-model="font" />
				<label for="font-opendyslexic" class="dyslexic-friendly">Open Dyslexic</label>
			</div>
			<div class="form-group">
				<input id="font-atkinsonhyperlegible" type="radio" name="font" value="hyperlegible" v-model="font" />
				<label for="font-atkinsonhyperlegible" class="hyperlegible">Atkinson Hyperlegible</label>
			</div>
		</fieldset>
	</aside>
	<nav class="box box-body login-box-body">
		<h1>Login to Opurex Pos server</h1>
		<p class="form-msg"></p>
		<form name="loginform" onsubmit="javascript:login_sendLogin();return false;" id="loginform" action="" method="post" class="form-tiny">
			<div class="form-group">
				<label class="control-label required" for="user_server">Server</label>
				<input type="text" id="user_server" required="required" class="form-control" v-model="login.server" />
			</div>
			<div class="form-group">
				<label class="control-label required" for="user_login">Username</label>
				<input type="text" id="user_login" required="required" class="form-control" v-model="login.user" />
			</div>
			<div class="form-group">
				<label class="control-label required" for="user_pass">Password</label>
				<input type="password" id="user_pass" required="required" class="form-control" v-model="login.password" />
			</div>
			<div class="form-group">
				<input type="checkbox" name="https" id="user_https" v-model="login.https" />
				<label for="user_https">Secure connection <span class="tooltip">(use HTTPS)</span></label>
			</div>
			<div class="form-control">
				<button class="btn btn-primary" type="submit">Log in</button>
			</div>
		</form>
	</nav>
</div>
`,
	mounted: function() {
		if (login_getUser()) {
			document.getElementById("user_pass").focus();
		}
	},
	watch: {
		font: function(val) {
			if (val != "default") {
				gui_setFont(val);
				storage_setSessionOption("font", val);
			} else {
				gui_setFont("sans");
				storage_setSessionOption("font", null);
			}
		},
		"login.loggedIn": function(val) {
			if (val == false) {
				let font = storage_getSessionOption("font");
				if (font == null) {
					font = "default";
				}
				this.font = font;
			}
		}
	}
});
Vue.component("vue-catalog-picker", {
	props: ["categories", "prdPickCallback", "excludeCompositions"],
	data: function() {
		return { products: [], selectedCatId: null };
	},
	template: `
<div class="catalog-picker">
	<ul class="catalog-picker-categories">
		<li v-for="cat in this.categories" class="catalog-category">
			<button type="button" v-on:click="switchCategory(cat.id)">
				<img v-bind:src="catImageSrc(cat)" />
				<label>{{cat.label}}</label>
			</button>
		</li>
	</ul>
	<ul class="catalog-picker-products">
		<li v-for="prd in products">
			<button type="button" v-on:click="prdPickCallback(prd)">
				<img v-bind:src="prdImageSrc(prd)" />
				<label v-bind:class="{'invisible-data': !prd.visible}">{{prd.label}}</label>
			</button>
		</li>
	</ul>
</div>
`,
	methods: {
		switchCategory: function(id) {
			this.selectedCatId = id;
		},
		catImageSrc: function(cat) {
			return srvcall_imageUrl("category", cat);
		},
		prdImageSrc: function(prd) {
			return srvcall_imageUrl("product", prd);
		},
		showProducts: function(products) {
			this.products = products;
		},
	},
	mounted: function() {
		this.selectedCatId = this.categories[0].id;
	},
	watch: {
		selectedCatId: function(newCatId, oldCatID) {
			let thiss = this;
			storage_open(function(event) {
				storage_getProductsFromCategory(newCatId, function(products) {
					if (thiss.excludeCompositions) {
						thiss.products = [];
						for (let i = 0; i < products.length; i++) {
							if (!products[i].composition) {
								thiss.products.push(products[i]);
							}
						}
					} else {
						thiss.products = products;
					}
					storage_close();
				});
			});
		},
	},
})
Vue.component("vue-import-preview", {
	props: {
		newTitle: { type: String },
		editTitle: { type: String },
		unchangedTitle: { type: String },
		modelDef: { type: Object },
		modelsLabel: { type: String },
		importResult: { type: Object, default: function () { return null; } },
		linkedRecords: { type: Object, default: function () { return {}; } },
		tableColumns: { type: Array },
		warnings: { type: Array, default: function () { return []; } }
	},
	data: function () {
		return {
			showErrors: true,
			showWarnings: true,
			showUnchanged: false
		};
	},
	template: `<div class="because" v-if="importResult != null">
		<template v-if="importResult.warnings.length > 0 || importResult.unknownColumns.length > 0">
			<div class="text-flow">
				<h2>Alerts</h2>
				<div>
					<button type="button" class="btn btn-add" v-on:click="showWarnings = !showWarnings">
						<template v-if="showWarnings">Hide</template>
						<template v-else>Show the {{warnCount}} alerts</template>
					</button>
				</div>
			</div>
			<table class="table table-bordered table-hover" v-show="showWarnings">
				<thead>
					<tr>
						<th>Line</th>
						<th>Information</th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="importResult.unknownColumns.length > 0">
						<td>1</td>
						<td>The following columns were ignored: 
							<template v-for="col in importResult.unknownColumns">{{col}} </template>
						</td>
					</tr>
					<tr v-for="warn in importResult.warnings">
						<td>{{warn.line}}</td>
						<td>{{warningMessage(warn)}}</td>
					</tr>
				</tbody>
			</table>
		</template>

		<template v-if="importResult.errors.length > 0">
			<div class="text-flow">
				<h2>Read Errors</h2>
				<div>
					<button type="button" class="btn btn-add" v-on:click="showErrors = !showErrors">
						<template v-if="showErrors">Hide</template>
						<template v-else>Show the {{importResult.errors.length}} errors</template>
					</button>
				</div>
			</div>
			<table class="table table-bordered table-hover" v-show="showErrors">
				<thead>
					<tr>
						<th>Line</th>
						<th>Column</th>
						<th>Error</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="err in importResult.errors">
						<td>{{err.line}}</td>
						<td>{{errorColumn(err)}}</td>
						<td>{{errorMessage(err.exception)}}</td>
					</tr>
				</tbody>
			</table>
		</template>

		<template v-if="importResult.newRecords.length > 0">
			<h2>{{newTitle}}</h2>
			<vue-import-preview-table 
				:records="importResult.newRecords" 
				:linkedRecords="linkedRecords" 
				:tableColumns="tableColumns" 
			/>
		</template>

		<template v-if="importResult.editedRecords.length > 0">
			<h2>{{editTitle}}</h2>
			<p>Cells with a red background indicate changes.</p>
			<vue-import-preview-table 
				:records="importResult.editedRecords" 
				:editedValues="importResult.editedValues" 
				:linkedRecords="linkedRecords" 
				:tableColumns="tableColumns" 
			/>
		</template>

		<template v-if="importResult.unchangedRecords.length > 0">
			<div class="text-flow">
				<h2>{{unchangedTitle}}</h2>
				<div>
					<button type="button" class="btn btn-add" v-on:click="showUnchanged = !showUnchanged">
						<template v-if="showUnchanged">Hide</template>
						<template v-else>Show the {{importResult.unchangedRecords.length}} {{modelsLabel}}</template>
					</button>
				</div>
			</div>
			<vue-import-preview-table 
				v-show="showUnchanged" 
				:records="importResult.unchangedRecords" 
				:linkedRecords="linkedRecords" 
				:tableColumns="tableColumns" 
			/>
		</template>

		<template v-if="importResult.newRecords.length > 0 || importResult.editedRecords.length > 0">
			<div>
				<a class="btn btn-edit" v-on:click="save">Save changes</a>
			</div>
		</template>
	</div>`,
	methods: {
		save: function () {
			this.$emit('save', null);
		},
		errorColumn: function (err) {
			if (err.column != null && err.column !== "") {
				return err.column;
			}
			if ("field" in err.exception) {
				let fieldName = err.exception.field;
				if (this.modelDef != null && fieldName in this.modelDef.fields) {
					if ("label" in this.modelDef.fields[fieldName]) {
						return this.modelDef.fields[fieldName].label;
					}
				}
				return fieldName;
			}
			return "Unknown";
		},
		errorMessage: function (exception) {
			if (exception instanceof InvalidFieldException) {
				switch (exception.constraint) {
					case InvalidFieldConstraints.CSTR_ASSOCIATION_NOT_FOUND:
						return `The value "${exception.value}" could not be found`;
					case InvalidFieldConstraints.CSTR_NOT_NULL:
						return "Cannot be empty";
					default:
						return `The value "${exception.value}" is incorrect`;
				}
			}
			if (exception instanceof MissingReferenceColumnException) {
				return "The column is missing and required to perform the import";
			}
			return exception.message;
		},
		warningMessage: function (warn) {
			if (warn.warning === "InsensitiveMatch") {
				return warn.message;
			}
		}
	},
	computed: {
		warnCount: function () {
			let count = this.importResult.warnings.length;
			if (this.importResult.unknownColumns.length > 0) {
				count++;
			}
			return count;
		}
	}
});

Vue.component("vue-import-preview-table", {
	props: ["title", "tableColumns", "records", "editedValues", "linkedRecords"],
	template: `<div class="because">
		<h2 v-if="title">{{title}}</h2>
		<table class="table table-bordered table-hover">
			<thead>
				<tr>
					<template v-for="(col, index) in tableColumns">
						<th :class="col.class">{{col.label}}</th>
					</template>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(record, index) in records">
					<template v-for="col in tableColumns">
						<td :style="hasChanged(index, col.field)">{{fieldValue(record, col)}}</td>
					</template>
				</tr>
			</tbody>
		</table>
	</div>`,
	methods: {
		fieldValue: function(record, tableColumn) {
			if (!("type" in tableColumn)) {
				return record[tableColumn.field];
			}
			let val = record[tableColumn.field];
			switch (tableColumn.type) {
				case "boolean": return (val ? "Yes" : "No");
				case "number": return ((val === "" || val === null) ? "" : val.toLocaleString());
				case "number2": return ((val === "" || val === null) ? "" : val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
				case "number5": return ((val === "" || val === null) ? "" : val.toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 }));
				case "rate": return (val * 100).toLocaleString() + "%";
				case "scaleType":
					switch (val) {
						case 0: case "0": return "-";
						case 1: case "1": return "Weight";
						case 2: case "2": return "Liter";
						case 3: case "3": return "Hour";
					}
				case "date": return new PTDate(val).toString();
				case "record":
					if (val == null) {
						return "";
					}
					let modelName = tableColumn.modelName;
					if (!modelName in this.linkedRecords) {
						console.error("Model name " + modelName + " is not referenced in linkedRecords");
						return "?";
					}
					let linkId = record[tableColumn.field];
					let linkedRecord = this.linkedRecords[modelName].find(r => r.id == linkId);
					if (typeof linkedRecord == "undefined") {
						console.error(modelName + ":" + linkId + " not found in linkedRecords");
						return "?";
					}
					return linkedRecord.label;
				default:
					console.error("Unknown column type \"" + tableColumn.type + "\" for " + tableColumn.field);
					return "?";
			}
		},
		hasChanged: function(index, field) {
			if (this.editedValues && this.editedValues[index][field]) {
				return "font-weight:bold;background-color:#a36052;color:#fff";
			}
			return "";
		}
	},
});
Vue.component("vue-input-checkbox", {
	props: {
		id: {
			type: String,
			required: true,
		},
		label: {
			type: String,
			required: true,
		},
		value: {
			type: Boolean,
			default: false,
		},
	},
	template:`<div class="form-group">
	<input v-bind:id="id" type="checkbox" v-model="localValue" />
	<label v-bind:for="id">{{label}}</label>
</div>
`,
	computed: {
		localValue: {
			get: function() { return this.value; },
			set: function(val) { this.$emit('input', val); }
		}
	}
});
Vue.component("vue-inputdate", {
	props: ["value"],
	template: `<input type="date" v-bind:value="dateAsString(value)" v-on:input="setValue">`,
	methods: {
		dateAsString: function(date) {
			return new PTDate(date).toDataString();
		},
		setValue: function(event) {
			this.$emit('input', event.target.valueAsDate);
		}
	},
});
Vue.component("vue-input-image", {
	props: {
		id: {
			type: String,
			required: true,
		},
		label: {
			type: String,
			required: true,
		},
		modelName: {
			type: String,
			required: true,
		},
		modelId: {
			type: String,
		},
		hadImage: {
			type: Boolean,
			required: true,
		},
		value: { required: true },
	},
	data: function() {
		return {
			hasImage: this.hadImage,
			deleteImage: false,
			localValue: null,
			refreshImage: false,
			imgSrc: null,
		}
	},
	template:`<div class="form-group">
	<label v-bind:for="id">Image</label>
	<img v-if="hasImage" v-bind:src="imgSrc" />
	<input v-if="!deleteImage" v-bind:id="id" v-bind:value="localValue" v-on:change="fileChanged" type="file" accept="image/*" />
	<button type="button" v-if="hadImage" v-on:click="toggleImage" class="btn btn-del">{{deleteImageButton}}</button>
</div>
`,
	methods: {
		toggleImage: function() {
			if (this.hasImage) {
				this.hasImage = false;
				this.deleteImage = true;
				this.localValue = null;
				this.$emit('input', {'file': null, 'delete': true });
			} else {
				this.hasImage = true;
				this.deleteImage = false;
				this.$emit('input', {'file': null, 'delete': false});
			}
		},
		fileChanged: function(event) {
			this.deleteImage = false;
			this.$emit('input', {'file': event.target.files[0], 'delete': this.deleteImage });
		},
		imageSrc: function() {
			if (this.hasImage && this.modelId) {
				return login_getHostUrl() + "/api/image/" + encodeURIComponent(this.modelName) + "/" + encodeURIComponent(this.modelId) + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/" + encodeURIComponent(this.modelName) + "/default?Token=" + login_getToken();
			}
		}
	},
	mounted: function() {
		this.imgSrc = this.imageSrc();
	},
	computed: {
		deleteImageButton: {
			get: function() {
				return (this.hasImage ? "Delete" : "Restore");
			},
		}
	},
	watch: {
		hadImage: function(newVal, oldVal) {
			this.hasImage = newVal;
			this.refreshImage = true;
			this.deleteImage = false;
			this.localValue = null;
			this.imgSrc = this.imageSrc();
		},
		value: function(newVal, oldVal) {
			if (newVal == null) {
				// Force refresh
				this.imgSrc = null;
				this.imgSrc = this.imageSrc();
			}
		},
	}
});
Vue.component("vue-input-number", {
	props: {
		id: {
			type: String,
			required: true,
		},
		label: {
			type: String,
			required: true,
		},
		value: {
			type: Number,
			default: 0,
		},
		required: {
			type: Boolean,
			default: false,
		},
		step: {
			type: Number,
			default: 1,
		},
		min: {
			type: Number,
			default: null,
		},
		max: {
			type: Number,
			default: null,
		}
	},
	template:`<div class="form-group">
	<label v-bind:for="id">{{label}}</label>
	<input v-bind:id="id" type="number" v-model.number="localValue" v-bind:required="required" v-bind:step="step" v-bind:min="min" v-bind:max="max" />
</div>
`,
	computed: {
		localValue: {
			get: function() { return this.value; },
			set: function(val) { this.$emit('input', val); }
		}
	}
});
Vue.component("vue-input-rate", {
	props: {
		id: {
			type: String,
			required: true,
		},
		label: {
			type: String,
			required: true,
		},
		value: {
			type: Number,
			default: 0,
		},
		required: {
			type: Boolean,
			default: false
		},
	},
	template:`<div class="form-group">
	<label v-bind:for="id">{{label}}</label>
	<input v-bind:id="id" type="number" v-model.lazy="localValue" step="0.01" min="0" max="100" /> %
</div>
`,
	computed: {
		localValue: {
			get: function() { return Number((this.value * 100.0).toFixed(2)); },
			set: function(val) { this.$emit('input', Number(val / 100.0).toFixed(5)); }
		}
	}
});
Vue.component("vue-input-text", {
	props: {
		id: {
			type: String,
			required: true,
		},
		label: {
			type: String,
			required: true,
		},
		value: {
			type: String,
			default: "",
		},
		placeholder: {
			type: String,
			default: "",
		},
		required: {
			type: Boolean,
			default: false
		},
	},
	template:`<div class="form-group">
	<label v-bind:for="id">{{label}}</label>
	<input v-bind:id="id" type="text" v-model="localValue" v-bind:required="required" v-bind:placeholder="placeholder" />
</div>
`,
	computed: {
		localValue: {
			get: function() { return this.value; },
			set: function(val) { this.$emit('input', val); }
		}
	}
});
Vue.component("vue-input-textarea", {
	props: {
		id: {
			type: String,
			required: true,
		},
		label: {
			type: String,
			required: true,
		},
		value: {
			type: String,
			default: "",
		},
		required: {
			type: Boolean,
			default: false
		},
	},
	template:`<div class="form-group">
	<label v-bind:for="id">{{label}}</label>
	<textarea v-bind:id="id" v-model="localValue" v-bind:required="required"></textarea>
</div>
`,
	computed: {
		localValue: {
			get: function() { return this.value; },
			set: function(val) { this.$emit('input', val); }
		}
	}
});
/** The message box component. Use gui_showMessage/gui_showError to use it.
 * @props message The message data structure {type: (null|string) the type
 * of message to display, Null to hide,
 * message: (string) The message to display}. */
Vue.component("vue-message", {
	props: ["message"],
	template: `<div id="message-box"
	v-if="message.type" v-bind:class="message.type"
	onclick="javascript:gui_closeMessageBox();">
		<p v-for="msg in message.message">{{msg}}</p>
		<template v-if="message.stack">
		<p>Technical information :</p>
		<pre class="stacktrace" v-if="message.stack">{{message.stack}}</pre>
		</template>
</div>
`
});
/** Type constants for column types. */
const TABLECOL_TYPE = {
	STRING: "string",
	/** Number without fixing precision. */
	NUMBER: "number",
	/** Number with fixed 2 decimals. */
	NUMBER2: "number2",
	/** Number with fixed 5 decimals. */
	NUMBER5: "number5",
	PERCENT: "percent",
	BOOL: "bool",
	/** Date without time. */
	DATE: "date",
	/** Date and time. */
	DATETIME: "datetime",
	/** Time without date. */
	TIME: "time",
	THUMBNAIL: "thumb",
	HTML: "html",

}
const TABLECOL_FOOTER = {
	/** The footer is manualy provided (default). */
	CUSTOM: "custom",
	/** The footer is the sum of all lines (numeric values). */
	SUM: "sum",
}

/**
 * Table definition for the vue-table component.
 */
class Table
{
	#mRef;
	#mTitle;
	#mColumns;
	#mLines;
	#mExportable;
	/** Reactive property for VueJS, do not manipulate it by hand. */
	ready;
	/** Reactive proxy for VueJS, do not manipulate it by hand. */
	vuelines;
	/** Reactive proxy for VueJS, do not manipulate it by hand. */
	vuecolumns;
	/** Reactive proxy for VueJS, do not manipulate it by hand. */
	vuefooter;
	vuehasfooter;

	/** Chainable empty constructor. */
	constructor() {
		this.#mRef = null;
		this.#mTitle = null;
		this.#mColumns = [];
		this.#mLines = [];
		this.#mExportable = true;
		this.ready = false;
		this.vuelines = this.#mLines;
		this.vuecolumns = this.#mColumns;
		this.vuefooter = [];
		this.#mColumns.forEach(c => {
			this.vuefooter.push(c.footer());
		}, this);
		this.#computeHasFooter();
	}
	/**
         * getter/setter.
         * @param ref When defined, set the reference and return the instance for chaining.
         * When not set, get the reference.
         * @return `This` for the setter, reference for the getter.
         */
	reference(ref) {
		if (arguments.length == 0) {
			return this.#mRef;
		}
		this.#mRef = ref;
		return this;
	}
	/**
         * getter/setter.
         * @param t When defined, set the title and return the instance for chaining.
         * When not set, get the title.
         * @return `This` for the setter, title for the getter.
         */
	title(t) {
		if (arguments.length == 0) {
			return this.#mTitle;
		}
		this.#mTitle = t;
		return this;
	}
	/**
	 * getter/adder
	 * @param c The index of the column to get or a new column to add.
	 * When the column has no reference set, it sets the column index
	 * as reference.
	 * @return `This` when used to add a column, the column when used
	 * as a getter.
	 */
	column(c) {
		if (typeof c == "number") {
			return this.#mColumns[c];
		}
		if (c.reference() == null) {
			c.reference(this.#mColumns.length.toString());
		}
		this.#mColumns.push(c);
		return this;
	}
	/**
	 * Get all columns.
	 */
	columns() {
		return this.#mColumns;
	}
	/**
	 * Get the number of columns.
	 */
	columnLength() {
		return this.#mColumns.length;
	}
	#computeHasFooter() {
		let hasFooter = false;
		for (let i = 0; i < this.#mColumns.length; i++) {
			let c = this.#mColumns[i];
			if (c.footer() !== "") {
				hasFooter = true;
				break;
			}
		}
		this.vuehasfooter = hasFooter;
	}
	/**
	 * getter/adder
	 * @param l The index of the line to get or a new line to add.
	 * Adding a line will the the table as ready.
	 * Use raw data when adding lines, the values will be formated
	 * according to the type of the column.
	 * @return `This` when used to add a line, the line when used
	 * as a getter.
	 */
	line(l) {
		if (typeof l == "number") {
			return this.#mLines[l];
		}
		this.#mLines.push(l);
		this.#computeFooters([l]);
		this.ready = true;
	}
	/**
	 * Indicate that the table is ready, without adding any line.
	 */
	noResult() {
		this.ready = true;
	}
	/**
	 * Get the number of lines.
	 */
	lineLength() {
		return this.#mLines.length;
	}
	/**
	 * Get all lines.
	 */
	lines() {
		return this.#mLines;
	}
	/** Sort lines in place */
	sort(sortFunction) {
		this.#mLines.sort(sortFunction);
	}
	/**
	 * Reset the table and optionaly set new content.
	 * Remove all lines, keep the references.
	 * When used without argements, the table is not ready anymore.
	 * @param lines The new table content.
	 */
	resetContent(lines) {
		this.#mLines.splice(0);
		if (arguments.length == 0) {
			this.ready = false;
		} else {
			this.#mLines.push(...lines);
			this.ready = true;
		}
		this.#resetFooters();
		this.#computeFooters(this.#mLines);
	}
	#resetFooters() {
		this.#mColumns.forEach(col => {
			col.resetFooter();
		});
	}
	/**
	* Update the automatic values of the footers with the added lines.
	* @param lines The array of lines that where added to the table.
	*/
	#computeFooters(lines) {
		lines.forEach((line) => {
			for (let i = 0; i < this.columnLength(); i++) {
				let col = this.#mColumns[i];
				let val = line[i];
				col.computeFooter(val);
			}
		}, this);
		this.#computeHasFooter();
	}
	/**
         * getter/setter.
         * @param e When defined, set exportable and return the instance for chaining.
         * When not set, check if exportable.
         * @return `This` for the setter, exportable for the getter.
         */
	exportable(e) {
		if (arguments.length == 0) {
			return this.#mExportable;
		}
		this.#mExportable = e;
		return this;
	}
	/**
	 * Remove all lines, footer and columns, set ready to false.
	 * Use this to update the columns without breaking object reference
	 * and reactivity.
	 */
	reset() {
		this.ready = false;
		this.#mLines.splice(0);
		this.#mColumns.splice(0);
	}
	/**
	 * Export the visible columns to a csv file.
	 * @param withExcelBom Whether to add Byte Order Mask for Excel or not.
	 * @return The csv content as a binary string.
	 */
	getCsv(withExcelBom) {
		let csvData = [];
		// Create the header
		csvData.push([]);
		for (let i = 0; i < this.columnLength(); i++) {
			let col = this.column(i);
			if (col.isVisible && col.exportable() !== false) {
				csvData[0].push(col.label());
			}
		}
		// Add lines
		for (let i = 0; i < this.lineLength(); i++) {
			csvData.push([]);
			let line = this.line(i);
			for (let j = 0; j < this.line(i).length; j++) {
				let col = this.column(j);
				if (col.isVisible && col.exportable()) {
					csvData[i + 1].push(col.formatCsv(line[j]));
				}
			}
		}
		// Add footer
		if (this.vuehasfooter) {
			let line = [];
			for (let i = 0; i < this.columnLength(); i++) {
				let col = this.column(i);
				if (col.isVisible && col.exportable()) {
					switch (col.footerType()) {
						case TABLECOL_FOOTER.SUM:
							line.push(col.formatCsv(col.footer()));
							break;
						default:
							line.push(col.footer());
							break;
					}
				}
			}
			csvData.push(line);
		}
		// Generate csv (with some utf-8 tweak)
		let encodedData = new CSV(csvData).encode();
		encodedData = encodeURIComponent(encodedData).replace(/%([0-9A-F]{2})/g,
			function toSolidBytes(match, p1) {
				return String.fromCharCode('0x' + p1);
			});
		if (withExcelBom) {
			encodedData = String.fromCharCode(0xef, 0xbb, 0xbf) + encodedData;
		}
		return encodedData;
	}
}

/**
 * Table column definition for the vue-table component.
 */
class TableCol
{
	#mRef;
	#mLabel;
	#mFooterType;
	#mFooter;
	#mHelp;
	#mType;
	#mClass;
	#mExportable;
	#mSearchable;
	#mVisible;
	/** Visibility status. As a read/write property for VueJS. */
	isVisible;

	/** Chainable empty constructor. */
	constructor() {
		this.#mRef = null;
		this.#mLabel = "";
		this.#mHelp = "";
		this.#mFooterType = TABLECOL_FOOTER.CUSTOM;
		this.#mFooter = "";
		this.#mType = TABLECOL_TYPE.STRING;
		this.#mExportable = true;
		this.#mSearchable = false;
		this.#mVisible = true;
		this.#mClass = "";
		this.isVisible = true;
	}
	/**
         * getter/setter.
         * @param ref When defined, set the reference and return the instance for chaining.
         * When not set, get the reference.
         * @return `This` for the setter, reference for the getter.
         */
	reference(ref) {
		if (arguments.length == 0) {
			return this.#mRef;
		}
		this.#mRef = ref;
		return this;
	}
	/**
         * getter/setter.
         * @param lbl When defined, set the label and return the instance for chaining.
         * When not set, get the label.
         * @return `This` for the setter, label for the getter.
         */
	label(lbl) {
		if (arguments.length == 0) {
			return this.#mLabel;
		}
		this.#mLabel = lbl;
		return this;
	}
	/**
         * getter/setter.
         * @param h When defined, set the help text and return the instance for chaining.
         * When not set, get the help text.
         * @return `This` for the setter, help for the getter.
         */
	help(h) {
		if (arguments.length == 0) {
			return this.#mHelp;
		}
		this.#mHelp = h;
		return this;
	}
	/**
         * getter/setter.
         * @param t When defined, set the type and return the instance for chaining.
         * When not set, get the type. See TABLECOL_TYPE constants.
         * @return `This` for the setter, type for the getter.
         */
	type(t) {
		if (arguments.length == 0) {
			return this.#mType;
		}
		this.#mType = t;
		return this;
	}
	/**
         * getter/setter.
         * @param ft When defined, set the type and return the instance for chaining.
         * When not set, get the type. See TABLECOL_FOOTER constants.
         * Setting the footer type will reset the footer.
         * Changing the footer after the table is rendered may not update the view.
         * @param customFooter For TABLECOL_FOOTER.CUSTOM only, when defined,
         * set the custom footer.
         * @return `This` for the setter, type for the getter.
         */
	footerType(ft, customFooter) {
		if (arguments.length == 0) {
			return this.#mFooterType;
		}
		switch (ft) {
			case TABLECOL_FOOTER.SUM:
				this.#mFooterType = ft;
				this.resetFooter();
				break;
			case TABLECOL_FOOTER.CUSTOM:
				this.#mFooterType = ft;
				if (arguments.length > 1) {
					this.#mFooter = customFooter;
				} else {
					this.resetFooter();
				}
				break;
			default:
				console.error("Unknown footer type " + ft);
		}
		return this;
	}
	/**
         * getter/setter.
         * @param customFooter When defined, set the custom footer
         * and return the instance for chaining.
         * Setting the footer does nothing if the footer type is not TABLECOL_FOOTER.CUSTOM.
         * Custom footer is always converted to a string, regardless of the type of the column.
         * Changing the footer after the table is rendered may not update the view.
         * When not set, get the footer value.
         * @return `This` for the setter, current footer value for the getter.
         */
	footer(customFooter) {
		if (arguments.length == 0) {
			return this.#mFooter;
		}
		if (this.#mFooterType == TABLECOL_FOOTER.CUSTOM) {
			this.#mFooter = new String(customFooter).valueOf();
		}
		return this;
	}
	resetFooter() {
		switch (this.#mFooterType) {
			case TABLECOL_FOOTER.SUM:
				this.#mFooter = 0;
				break;
			case TABLECOL_FOOTER.CUSTOM:
				// No update
				break;
			default:
				console.error("Unknown footer type " + ft);
		}
	}
	/**
	 * Update automatic footer by adding a new value.
	 * @param newLineValue The value that was added.
	 */
	computeFooter(newLineValue) {
		switch (this.#mFooterType) {
			case TABLECOL_FOOTER.SUM:
				let numVal = 0;
				if (typeof newLineValue != "number") {
					let val = Number(newLineValue);
					if (!Number.isNaN(val)) {
						numVal = val.valueOf();
					}
				} else {
					numVal = newLineValue;
				}
				this.#mFooter += numVal;
				break;
			default: // do nothing
				break;
		}
	}
	/**
         * getter/setter.
         * @param e When defined, set exportable and return the instance for chaining.
         * When not set, check if exportable.
         * @return `This` for the setter, exportable for the getter.
         */
	exportable(e) {
		if (arguments.length == 0) {
			return this.#mExportable;
		}
		this.#mExportable = e;
		return this;
	}
	/**
         * getter/setter.
         * @param s When defined, set searchable and return the instance for chaining.
         * When not set, check if searchable.
         * @return `This` for the setter, searchable for the getter.
         */
	searchable(s) {
		if (arguments.length == 0) {
			return this.#mSearchable;
		}
		this.#mSearchable = s;
		return this;
	}
	/**
         * getter/setter.
	 * For the actual visibility state, see `isVisible`.
         * @param v When defined, set the default visibility and return the instance for chaining.
         * When not set, get the default visibility.
         * @return `This` for the setter, default visibility for the getter.
         */
	visible(v) {
		if (arguments.length == 0) {
			return this.#mVisible;
		}
		this.#mVisible = v;
		this.isVisible = v;
		return this;
	}
	/**
         * getter/setter.
         * @param c When defined, set the css class and return the instance for chaining.
         * When not set, get the css class.
         * @return `This` for the setter, css class for the getter.
         */
	class(c) {
		if (arguments.length == 0) {
			return this.#mClass;
		}
		this.#mClass = c;
		return this;
	}
	/** Return true when type is NUMBER*. */
	isNumber() {
		return this.#mType == TABLECOL_TYPE.NUMBER
				|| this.#mType == TABLECOL_TYPE.NUMBER2
				|| this.#mType == TABLECOL_TYPE.NUMBER5;
	}
	isDateOrTime() {
		return this.#mType == TABLECOL_TYPE.DATE
				|| this.#mType == TABLECOL_TYPE.DATETIME
				|| this.#mType == TABLECOL_TYPE.TIME;
	}
	/**
	 * Format value to render in a table cell as string.
	 * This does not format images, html nor booleans.
	 */
	formatCell(value) {
		if (typeof value === "undefined" || value === null || value === '') {
			return "";
		}
		switch (this.#mType) {
			case TABLECOL_TYPE.NUMBER5:
				return (value == 0.0) ? value : value.toLocaleString(undefined, {minimumFractionDigits: 5, maximumFractionDigits: 5});
			case TABLECOL_TYPE.NUMBER2:
				return (value == 0.0) ? value : value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
			case TABLECOL_TYPE.NUMBER:
				return value.toLocaleString();
			case TABLECOL_TYPE.PERCENT:
				return (value * 100).toLocaleString() + "%";
			case TABLECOL_TYPE.DATE:
				return tools_dateToString(value);
			case TABLECOL_TYPE.DATETIME:
				return tools_dateTimeToString(value);
			case TABLECOL_TYPE.TIME:
				return tools_timeToString(value);
			default:
				if ((typeof value) == "object" || (typeof value) == "string") {
					return value.toString();
				} else {
					return String(value);
				}
		}
	}
	/** Format value for csv export. */
	formatCsv(value) {
		if (typeof value === "undefined" || value === null || value === '') {
			return "";
		}
		switch (this.#mType) {
			case TABLECOL_TYPE.BOOL:
				return value ? "1" : "0";
			case TABLECOL_TYPE.NUMBER:
				return tools_stringToNumber(value.toLocaleString());
			case TABLECOL_TYPE.NUMBER2:
				return tools_stringToNumber(value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}));
			case TABLECOL_TYPE.NUMBER5:
				return tools_stringToNumber(value.toLocaleString(undefined, {minimumFractionDigits: 5, maximumFractionDigits: 5}));
			case TABLECOL_TYPE.PERCENT:
				return (value * 100).toLocaleString() + "%"
			case TABLECOL_TYPE.DATE:
				return tools_dateToString(value);
			case TABLECOL_TYPE.DATETIME:
				return tools_dateTimeToString(value);
			case TABLECOL_TYPE.TIME:
				return tools_timeToString(value);
			default:
				return value;
		}
	}
}

/** Custom preferences for Table */
class TablePrefs
{
	/** The default of the defaults. It could be a constant. */
	static linePerPageSystem = 250;
	/** The customized default. */
	static linePerPageSystemCustom = null;
	/** The table default. */
	#linePerPage;
	#columnVisibility;

	/** Empty constructor. */
	constructor() {
		this.linePerPage = null;
		this.#columnVisibility = new Map();
	}

	/**
	 * Import preferences from an object generated with export().
	 * @return `This` for chaining.
	 */
	import(object) {
		if (!"columns" in object) {
			this.legacyImport(object);
			return;
		}
		for (let key in object.columns) {
			this.setColumnVisibility(key, object.columns[key]);
		}
		if ("linePerPage" in object) {
			this.linePerPage = object.linePerPage;
		}
		return this;
	}

	/** Old column export format. */
	#legacyImport(object) {
		// Legacy column format
		for (let key in object) {
			let col = optVals[key];
			this.setColumnVisibility(key, col.visible);
		}
		return this;
	}

	/** Export the preferences to a jsonable object. */
	export() {
		let option = {"columns": {}};
		this.#columnVisibility.forEach((visible, ref) => {
			option.columns[ref] = visible;
		});
		if (this.linePerPage) {
			option.linePerPage = this.linePerPage;
		}
		return option;
	}

	setColumnVisibility(ref, visible) {
		this.#columnVisibility.set(ref, visible);
	}

	getColumnVisibility(ref) {
		return this.#columnVisibility.get(ref);
	}

	setLinePerPage(count) {
		this.linePerPage = count;
	}

	/**
	 * Get the preferred line per page count.
	 * @return Table preference if set, otherwise system custom default,
	 * otherwise system default.
	 */
	getLinePerPage() {
		if (this.linePerPage != null) {
			return this.linePerPage
		} else if (TablePrefs.linePerPageSystemCustom != null) {
			return TablePrefs.linePerPageSystemCustom;
		}
		return TablePrefs.linePerPageSystem;
	}

	/**
	 * Get the preferred default line per page count for all tables.
	 * @return System custom default if set, otherwise system default.
	 */
	static getSystemDefaultLinePerPage() {
		if (TablePrefs.linePerPageSystemCustom != null) {
			return TablePrefs.linePerPageSystemCustom;
		}
		return TablePrefs.linePerPageSystem;
	}
}

Vue.component("vue-table", {
	props: {
		table: {
			type: Table,
			required: true
		},
		exportable: {
			type: Boolean,
			default: true
		},
		filterable: {
			type: Boolean,
			default: true
		}
	},
	data: function () {
		return {
			randId: "table-" + String(Math.random()).replace("0.", "").valueOf(),
			showHelp: false,
			/** Index (int) or reference (string) as key, visible (boolean) as value. */
			defaultColumns: {},
			searchString: "",
			/** True when search is done and the results should be used. */
			useSearch: false,
			/** True when the search will be modified. */
			searchPending: false,
			/** List of line indexes matching the search input. */
			searchResults: [],
			tablePrefs: new TablePrefs(),
			/** The actual line per page shown, reactive property. */
			linePerPage: TablePrefs.linePerPageSystem,
			/** 0-based page index. Displayed as currentPage + 1 */
			currentPage: 0,
			// Global
			"TABLECOL_TYPE": TABLECOL_TYPE,
			"TABLECOL_FOOTER": TABLECOL_FOOTER,
			"tools_dateToString": tools_dateToString,
			"tools_dateTimeToString": tools_dateTimeToString,
			"tools_timeToString": tools_timeToString
		};
	},
	computed: {
		pageCount: function() {
			if (this.linePerPage == -1) {
				this.currentPage = 0;
				return 1;
			}
			let lineCount = this.table.lineLength();
			if (this.useSearch) {
				lineCount = this.searchResults.length;
			}
			if (lineCount == 0) {
				this.currentPage = 0;
				return 1;
			}
			let pages = Math.floor(lineCount / this.linePerPage);
			if (lineCount % this.linePerPage > 0) {
				pages++;
			}
			if (this.currentPage >= pages) {
				this.currentPage = pages - 1;
			}
			return pages;
		},
		searchable: function() {
			for (let column of this.table.columns()) {
				if (column.searchable()) {
					return true;
				}
			}
			return false;
		}
	},
		template: `<div class="table">
	<div class="filters noprint" v-if="table.vuecolumns.length > 0 && (filterable || exportable)">
		<h3>Show/hide columns</h3>
		<ul class="filter-actions">
			<li>
				<button type="button" class="btn btn-misc" v-on:click="toggleHelp">
					<template v-if="showHelp">
						<img src="res/img/column_descr_hide.png" alt="" style="height: 26px; padding-right: 5px;" />
						<span style="float: right; margin-top: 5px;">Hide field descriptions</span>
					</template>
					<template v-else>
						<img src="res/img/column_descr_show.png" alt="" style="height: 26px; padding-right: 5px;" />
						<span style="float: right; margin-top: 5px;">Show field descriptions</span>
					</template>
				</button>
			</li>
			<li><button type="button" class="btn btn-misc" v-on:click="checkAllColumns">
				<img src="res/img/column_expand.png" alt="" style="height: 26px; padding-right: 5px;" />
				<span style="float: right; margin-top: 5px;">Show all columns</span>
			</button></li>
			<li><button type="button" class="btn btn-misc" v-on:click="uncheckAllColumns">
				<img src="res/img/column_collapse.png" alt="" style="height: 26px; padding-right: 5px;" />
				<span style="float: right; margin-top: 5px;">Hide all columns</span>
			</button></li>
			<li><button type="button" class="btn btn-misc" v-on:click="invertCheckedColumns">Invert displayed columns</button></li>
		</ul>
		<ul class="filter-columns" v-if="filterable" v-bind:class="{'expand-help': showHelp}">
			<li v-for="(col, index) in table.vuecolumns">
				<input v-model="col.isVisible" v-bind:id="htmlId('filter-column-' + index)" type="checkbox" />
				<label v-bind:for="htmlId('filter-column-' + index)">{{col.label()}}</label>
				<p class="help" v-if="showHelp">{{col.help()}}</p>
			</li>
		</ul>
		<ul class="filter-defaults" v-if="table.reference()">
			<li><button type="button" class="btn btn-misc" v-on:click="restoreDefaultPreferences">
				<img src="res/img/column_restore_params.png" alt="" style="height: 26px; padding-right: 5px;" />
				<span style="float: right; margin-top: 5px;">Restore default view</span>
			</button></li>
			<li><button type="button" class="btn btn-misc" v-on:click="savePreferences">
				<img src="res/img/column_save_params.png" alt="" style="height: 26px; padding-right: 5px;" />
				<span style="float: right; margin-top: 5px;">Save as default view</span>
			</button></li>
		</ul>
		<div v-if="table.ready && table.exportable()">
			<a class="btn btn-add" v-on:click="exportCsvOther">Export table</a>
			<a class="btn btn-add" v-on:click="exportCsvExcel">Export table (Excel)</a>
		</div>
	</div>
	<h2 v-if="table.title()">{{table.title()}}</h2>
	<nav class="table-pagination" v-if="table.ready">
		<div class="form-group">
			<label v-bind:for="htmlId('pageNum')">Page</label>
			<button type="button" aria-label="First page" title="First page" v-on:click="movePage(-2)" v-bind:disabled="currentPage == 0">&lt;&lt;</button>
			<button type="button" aria-label="Previous page" title="Previous page" v-on:click="movePage(-1)" v-bind:disabled="currentPage == 0">&lt;</button>
			<select v-bind:id="htmlId('pageNum')" v-model.number="currentPage" v-bind:disabled="pageCount == 1">
				<option v-for="i in pageCount" v-bind:value="i - 1">{{ i }}</option>
			</select>
			<button type="button" aria-label="Next page"  title="Next page" v-on:click="movePage(1)" v-bind:disabled="currentPage == pageCount - 1">&gt;</button>
			<button type="button" aria-label="Last page"  title="Last page" v-on:click="movePage(2)" v-bind:disabled="currentPage == pageCount - 1">&gt;&gt;</button>
		</div>
		<div class="form-group">
			<label v-bind:for="htmlId('pageSize')">Items per page</label>
			<select v-model.number="linePerPage" v-bind:id="htmlId('pageSize')">
				<option value="50">50</option>
				<option value="100">100</option>
				<option value="250">250</option>
				<option value="500">500</option>
				<option value="-1">All</option>
			</select>
		</div>
		<vue-input-text v-bind:id="htmlId('search')" label="Search" v-model="searchString" v-if="searchable" />
	</nav>
	<table class="table table-bordered table-hover" v-if="table.ready">
		<thead>
		<tr>
			<template v-for="(col, index) in table.vuecolumns">
				<th v-show="col.isVisible" v-bind:class="col.class()">{{col.label()}}</th>
			</template>
		</tr>
		</thead>
		<tbody>
		<template v-for="(line,index) in table.vuelines">
			<tr v-if="visibleLine(index)">
				<template v-for="(value, colIndex) in line">
					<td v-if="table.vuecolumns[colIndex].isVisible" v-bind:class="[table.vuecolumns[colIndex].class(), {numeric: table.vuecolumns[colIndex].isNumber(), datetime: table.vuecolumns[colIndex].isDateOrTime()}]">
						<template v-if="value === undefined || value === null || value === ''"></template>
						<template v-else-if="table.vuecolumns[colIndex].type() == TABLECOL_TYPE.THUMBNAIL">
							<img class="img img-thumbnail thumbnail" v-bind:src="value" />
						</template>
						<template v-else-if="table.vuecolumns[colIndex].type() == TABLECOL_TYPE.BOOL">
							<input type="checkbox" disabled="1" v-bind:checked="value" />
						</template>
						<template v-else-if="table.vuecolumns[colIndex].type() == TABLECOL_TYPE.HTML"><span v-html="value"></span></template>
						<template v-else>{{table.vuecolumns[colIndex].formatCell(value)}}</template>
					</td>
				</template>
			</tr>
		</template>
		</tbody>
		<tfoot v-if="table.vuehasfooter">
		<tr>
			<th v-for="(col, index) in table.vuecolumns" v-show="table.vuecolumns[index].isVisible" v-bind:class="table.vuecolumns[index].class()">
				<template v-if="col.footerType() == TABLECOL_FOOTER.SUM">{{col.formatCell(col.footer())}}</template>
				<template v-else>{{col.footer()}}</template>
			</th>
		</tr>
		</tfoot>
	</table>
	<nav class="table-pagination" v-if="table.ready">
		<div class="form-group">
			<label v-bind:for="htmlId('pageNum2')">Page</label>
			<button type="button" aria-label="First page" title="First page" v-on:click="movePage(-2)" v-bind:disabled="currentPage == 0">&lt;&lt;</button>
			<button type="button" aria-label="Previous page" title="Previous page" v-on:click="movePage(-1)" v-bind:disabled="currentPage == 0">&lt;</button>
			<select v-bind:id="htmlId('pageNum2')" v-model.number="currentPage" v-bind:disabled="pageCount == 1">
				<option v-for="i in pageCount" v-bind:value="i - 1">{{ i }}</option>
			</select>
			<button type="button" aria-label="Next page"  title="Next page" v-on:click="movePage(1)" v-bind:disabled="currentPage == pageCount - 1">&gt;</button>
			<button type="button" aria-label="Last page"  title="Last page" v-on:click="movePage(2)" v-bind:disabled="currentPage == pageCount - 1">&gt;&gt;</button>
		</div>
		<div class="form-group">
			<label v-bind:for="htmlId('pageSize2')">Items per page</label>
			<select v-model.number="linePerPage" v-bind:id="htmlId('pageSize2')">
				<option value="50">50</option>
				<option value="100">100</option>
				<option value="250">250</option>
				<option value="500">500</option>
				<option value="-1">All</option>
			</select>
		</div>
	</nav>
</div> `,
	methods: {
		// CSV functions
		exportCsv: function (withExcelBom) {
			let csv = this.table.getCsv(withExcelBom);
			// Set href for download
			let href = "data:text/csv;base64," + btoa(csv);
			window.open(href, "csvexport");
		},
		exportCsvOther: function () {
			this.exportCsv(false);
		},
		exportCsvExcel: function () {
			this.exportCsv(true);
		},
		// Check column buttons functions
		toggleHelp: function () {
			this.showHelp = !this.showHelp;
		},
		checkAllColumns: function () {
			for (let i = 0; i < this.table.columnLength(); i++) {
				this.table.column(i).isVisible = true;
			}
		},
		uncheckAllColumns: function () {
			for (let i = 0; i < this.table.columnLength(); i++) {
				this.table.column(i).isVisible = false;
			}
		},
		invertCheckedColumns: function () {
			for (let i = 0; i < this.table.columnLength(); i++) {
				this.table.column(i).isVisible = !this.table.column(i).isVisible;
			}
		},
		// Preferences load/save functions
		loadPreferences: function() {
			let loadTablePrefs = true;
			if (!this.table.reference()) {
				loadTablePrefs = false;
			}
			let optNames = [];
			optNames.push(OPTION_PREFERENCES);
			if (loadTablePrefs) {
				optNames.push(Option_prefName(this.table.reference() + ".defaults"));
			};
			let thiss = this;
			storage_open(function (event) {
				storage_get("options", optNames, function (opts) {
					let prefOpt = opts[optNames[0]];
					if (prefOpt != null) {
						let optVals = JSON.parse(prefOpt.content);
						if ("tablePageSize" in optVals) {
							TablePrefs.linePerPageSystemCustom = optVals.tablePageSize;
						}
					}
					if (loadTablePrefs) {
						let tableOpt = opts[optNames[1]];
						if (tableOpt != null) {
							let optVals = JSON.parse(tableOpt.content);
							thiss.tablePrefs.import(optVals);
						}
					}
					thiss.linePerPage = thiss.tablePrefs.getLinePerPage();
					thiss.restoreDefaultPreferences();
				});
			});
		},
		savePreferences: function () {
			// Read current column visibility and set local default
			let optName = Option_prefName(this.table.reference() + ".defaults")
			let option = {"columns": {}};
			// Set current settings as the new default
			this.table.columns().forEach(col => {
				this.tablePrefs.setColumnVisibility(col.reference(), col.isVisible);
			});
			if (this.linePerPage != TablePrefs.getSystemDefaultLinePerPage()) {
				this.tablePrefs.setLinePerPage(this.linePerPage);
			} else {
				this.tablePrefs.setLinePerPage(null);
			}
			// Save
			let opt = Option(optName, JSON.stringify(this.tablePrefs.export()));
			table_saveDefaultColumns(opt);
		},
		// Visibility functions
		restoreDefaultPreferences: function () {
			this.table.columns().forEach(col => {
				let ref = col.reference();
				if (this.tablePrefs.getColumnVisibility(ref) != null) {
					col.isVisible = this.tablePrefs.getColumnVisibility(ref);
				} else {
					col.isVisible = col.visible();
				}
			});
			this.linePerPage = this.tablePrefs.getLinePerPage();
		},
		visibleLine: function(index) {
			if (this.linePerPage == -1 && !this.useSearch) {
				return true;
			}
			let start = this.currentPage * this.linePerPage;
			let stop = start + this.linePerPage
			if (!this.useSearch) {
				return index >= start && index < stop;
			} else {
				let searchIndex = this.searchResults.indexOf(index);
				if (searchIndex == -1) {
					return false;
				}
				return this.linePerPage == -1 || (searchIndex >= start && searchIndex < stop);
			}
		},
		// Pagination
		movePage: function(delta) {
			switch (delta) {
				case -1:
					if (this.currentPage > 0) {
						this.currentPage -= 1;
					}
					break;
				case 1:
					if (this.currentPage < this.pageCount - 1) {
						this.currentPage += 1;
					}
					break;
				case -2:
					this.currentPage = 0;
					break;
				case 2:
					this.currentPage = this.pageCount - 1;
					break;
			}
		},
		// Search
		runSearch: function() {
			this.searchResults = [];
			let lowVal = this.searchString.toLowerCase();
			for (let i = 0; i < this.table.lineLength(); i++) {
				for (let j = 0; j < this.table.columnLength(); j++) {
					let col = this.table.column(j);
					if (col.visible && (col.searchable())) {
						let val = col.formatCell(this.table.line(i)[j]);
						if (val.toLowerCase().includes(lowVal)) {
							this.searchResults.push(i);
							continue;
						}
					}
				}
			}
			this.searchPending = false;
			this.useSearch = true;
		},
		htmlId: function(id) {
			return this.randId + "-" + id;
		}
	},
	watch: {
		searchString: function(value) {
			if (this.searchTimer) {
				clearTimeout(this.searchTimer);
			}
			if (value == "") {
				this.useSearch = false;
				this.searchPending = false;
				return;
			}
			this.searchPending = true;
			let time = 1000;
			switch (value.length) {
				case 2:
					time = 600;
				case 3:
					time = 500;
				case 4:
					time = 400;
				default:
					time = 250;
			}
			this.searchTimer = setTimeout(() => {
				this.runSearch();
			}, time);
		}
	},
	mounted: function () {
		this.loadPreferences();
	}
});
Vue.component("vue-menu", {
	props: ["menu", "user"],
	data: function() {
		return {
			openedMenu: null,
		};
	},
	template: `<nav id="menu" class="navbar">
	<input type="checkbox" id="menu-collapser" aria-expanded="false" v-show="menu.visible">
	<label for="menu-collapser">Menu</label>
	<a class="navbar-brand" href="?p=home">
		<img alt="Opurex Pos Logo" class="img-responsive img-thumbnail" src="res/img/logo.png">
	</a>
	<ul id="main-menu" v-show="menu.visible">
		<li class="dropdown" v-bind:class="{expanded: (openedMenu == index)}" v-for="section, index in menu.sections">
			<button v-on:click="expandMenu(index)" aria-haspopup="true" v-bind:aria-expanded="isExpanded(index)">{{section.name}}</button>
			<ul class="dropdown-menu" v-if="openedMenu == index">
				<li v-for="item in section.items">
					<template v-if="item.target">
						<a v-bind:style="item.icon" v-bind:href="item.target">{{item.name}}</a>
					</template>
					<template v-else>
						<a v-bind:style="item.icon" v-on:click="item.action();return false;" href="#">{{item.name}}</a>
					</template>
				</li>
			</ul>
		</li>
	</ul>
	<ul id="user-menu">
		<li class="dropdown" v-bind:class="{expanded: (openedMenu == menu.sections.length)}">
			<button v-on:click="expandMenu(menu.sections.length)" aria-haspopup="true" v-bind:aria-expanded="isExpanded(menu.sections.length)">{{user}}</button>
			<ul class="dropdown-menu" v-if="openedMenu == menu.sections.length">
				<li v-for="item in menu.user">
					<template v-if="item.target">
						<a v-bind:style="item.icon" v-bind:href="item.target">{{item.name}}</a>
					</template>
					<template v-else>
						<a v-bind:style="item.icon" v-on:click="item.action();return false;" href="#">{{item.name}}</a>
					</template>
				</li>
			</ul>
		</li>
	</ul>
</nav>
`,
	methods: {
		expandMenu: function(index) {
			this.openedMenu = (this.openedMenu === index) ? null : index;
		},
		isExpanded: function(index) {
			return this.openedMenu === index ? "true" : "false";
		}
	}
});


// TODO: this section should be moved in the controller
function _menu_getTargetUrl(target) {
	return "?p=" + target;
}

function _menu_getIcon(icon) {
	let style = "background-repeat: no-repeat; background-position: 2px 50%; padding-left: 25px;";
	if (icon) {
		return style + " background-image:url('res/img/" + icon + "');";
	} else {
		return style + " background-image:url('res/img/menu_default.png');";
	}
}

function menu_init() {
	return {
		"sections": [
			{
				"name": "Catalog",
				"items": [
					{"target": _menu_getTargetUrl("categories"), "name": "Categories", "icon": _menu_getIcon("menu_category.png")},
					{"target": _menu_getTargetUrl("products"), "name": "Products", "icon": _menu_getIcon("menu_product.png")},
					{"target": _menu_getTargetUrl("tariffareas"), "name": "Tariff Zones", "icon": _menu_getIcon("menu_tariffarea.png")},
					{"target": _menu_getTargetUrl("customers"), "name": "Customers", "icon": _menu_getIcon("menu_customer.png")},
					{"target": _menu_getTargetUrl("discountprofiles"), "name": "Discount Profiles", "icon": _menu_getIcon("menu_discountprofile.png")},
					{"target": _menu_getTargetUrl("producttags"), "name": "Tags", "icon": _menu_getIcon("menu_producttags.png")},
				]
			},
			{
				"name": "Sales",
				"items": [
					{"target": _menu_getTargetUrl("sales_z"), "name": "Z Tickets", "icon": _menu_getIcon(null)},
					{"target": _menu_getTargetUrl("sales_tickets"), "name": "Tickets", "icon": _menu_getIcon(null)},
					{"target": _menu_getTargetUrl("salesbyproduct"), "name": "By Product", "icon": _menu_getIcon(null)},
					{"target": _menu_getTargetUrl("salesbycategory"), "name": "By Category", "icon": _menu_getIcon(null)},
					{"target": _menu_getTargetUrl("salesdetails"), "name": "Details", "icon": _menu_getIcon(null)},
				]
			},
			{
				"name": "Accounting",
				"items": [
					{"target": _menu_getTargetUrl("accounting_z"), "name": "Z Records", "icon": _menu_getIcon(null)},
					{"target": _menu_getTargetUrl("accounting_config"), "name": "Settings", "icon": _menu_getIcon(null)},
				]
			},
			{
				"name": "Settings",
				"items": [
					{"target": _menu_getTargetUrl("floors"), "name": "Table Plan", "icon": _menu_getIcon("menu_floors.png")},
					{"target": _menu_getTargetUrl("cashregisters"), "name": "Cash Registers", "icon": _menu_getIcon("menu_cashregister.png")},
					{"target": _menu_getTargetUrl("paymentmodes"), "name": "Payment Methods", "icon": _menu_getIcon("menu_paymentmode.png")},
					{"target": _menu_getTargetUrl("currencies"), "name": "Currencies", "icon": _menu_getIcon("menu_currencies.png")},
					{"target": _menu_getTargetUrl("taxes"), "name": "VAT", "icon": _menu_getIcon("menu_tax.png")},
					{"target": _menu_getTargetUrl("users"), "name": "Users", "icon": _menu_getIcon("menu_user.png")},
					{"target": _menu_getTargetUrl("roles"), "name": "Permissions", "icon": _menu_getIcon("menu_role.png")},
					{"target": _menu_getTargetUrl("resources"), "name": "Customization", "icon": _menu_getIcon("menu_resources.png")},
				]
			}
		],
		"user": [
			{"target": _menu_getTargetUrl("preferences"), "name": "Preferences", "icon": _menu_getIcon("menu_preferences.png")},
			{"action": login_logout, "name": "Log Out", "icon": _menu_getIcon("menu_logout.png")},
		],
		"visible": true
	}
}
Vue.component("vue-category-list", {
	props: ["data"],
	data: function() {
		return {
			categoriesTable: new Table().reference("category-list")
				.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).exportable(false).visible(true).help("The category button image. Cannot be exported."))
				.column(new TableCol().reference("reference").label("Reference").visible(false).searchable(true).help("Reference must be unique for each category. Used for modification during category import."))
				.column(new TableCol().reference("label").label("Designation").visible(true).searchable(true).help("Category name displayed on the register buttons."))
				.column(new TableCol().reference("parent").label("Parent").visible(false).help("Category containing this category. Empty if it is not a subcategory."))
				.column(new TableCol().reference("dispOrder").label("Order").type(TABLECOL_TYPE.NUMBER).visible(false).help("Display order of the category. Orders do not have to be sequential to allow inserting new categories in between, e.g. 10, 20, 30â¦"))
				.column(new TableCol().reference("operation").label("Action").type(TABLECOL_TYPE.HTML).exportable(false).visible(true)),
			categoryTree: { null: [] },
		};
	},
	template: `<div class="category-list">
<section class="box box-medium">
  <header>
    <nav class="browser">
      <ul>
        <li><a href="?p=home">Home</a></li>
        <li><h1>Category List</h1></li>
      </ul>
    </nav>
    <nav class="navbar">
      <ul>
        <li><a class="btn btn-add" href="?p=category">Add a Category</a></li>
        <li><a class="btn btn-add" href="?p=categoryImport">Import File</a></li>
      </ul>
      <ul>
        <li>
          <label for="sort">Sort by</label>
          <select id="sort" name="sort" v-model="data.sort" v-on:change="sort">
            <option value="dispOrder">Order</option>
            <option value="label">Designation</option>
          </select>
        </li>
        <li>
          <input id="tree" type="checkbox" v-model="data.tree" v-on:change="sort" />
          <label for="tree">Tree View</label>
        </li>
      </ul>
    </nav>
  </header>
  <div class="box-body">
    <vue-table  v-bind:table="categoriesTable"></vue-table>
  </div>
</section>
</div>`,
	methods: {
		imageSrc: function(cat) {
			return srvcall_imageUrl("category", cat);
		},
		editUrl: function(cat) {
			return "?p=category&id=" + cat.id;
		},
		sortFlat: function(event) {
			let lines = [];
			for (let i = 0; i < this.data.categories.length; i++) {
				let cat = this.data.categories[i];
				let line = [
					this.imageSrc(cat),
					cat.reference, cat.label, cat.parentLabel,
					cat.dispOrder,
					"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(cat) + "\">Edit</a></div>",
				];
				lines.push(line);
			}
			switch (this.data.sort) {
				case "dispOrder":
					lines = lines.sort(tools_sort(4, 2));
					break;
				case "label":
					lines = lines.sort(tools_sort(2));
					break;
			}
			this.categoriesTable.resetContent(lines);
		},
		sortTree: function(event) {
			switch (this.data.sort) {
				case "dispOrder":
					for (let key in this.categoryTree) {
						Vue.set(this.categoryTree, key, this.categoryTree[key].sort(tools_sort("dispOrder", "label")));
					}
					break;
				case "label":
					for (let key in this.categoryTree) {
						Vue.set(this.categoryTree, key, this.categoryTree[key].sort(tools_sort("label")));
					}
					break;
			}
			let sortedLines = [];
			let thiss = this;
			let recursivePush = function(categories, depth) {
				for (let i = 0; i < categories.length; i++) {
					let cat = categories[i];
					let pad = "   ".repeat(depth);
					let line = [
						thiss.imageSrc(cat),
						pad + cat.reference, pad + cat.label, cat.parentLabel,
						cat.dispOrder,
						"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + thiss.editUrl(cat) + "\">Edit</a></div>",
					];
					sortedLines.push(line);
					if (cat.id in thiss.categoryTree) {
						recursivePush(thiss.categoryTree[cat.id], depth + 1);
					}
				}
			}
			recursivePush(this.categoryTree[0], 0);
			this.categoriesTable.resetContent();
			sortedLines.forEach(l => {
				this.categoriesTable.line(l);
			});
		},
		sort: function() {
			if (this.data.tree) {
				this.sortTree();
			} else {
				this.sortFlat();
			}
		}
	},
	mounted: function() {
		let catById = {};
		for (let i = 0; i < this.data.categories.length; i++) {
			let cat = this.data.categories[i];
			catById[cat.id] = cat;
		}
		for (let i = 0; i < this.data.categories.length; i++) {
			let cat = this.data.categories[i];
			let parentLabel = "";
			let parentId = 0;
			if (cat.parent != null) {
				cat.parentLabel = catById[cat.parent].label;
				parentId = cat.parent;
			} else {
				cat.parentLabel = "";
			}
			if (!(parentId in this.categoryTree)) {
				this.categoryTree[parentId] = [];
			}
			this.categoryTree[parentId].push(cat);
		}
		this.sort();
	}
});

Vue.component("vue-category-form", {
	props: ["data"],
	template: `<div class="category-form">
<section class="box box-medium">
  <header>
    <nav class="browser">
      <ul>
        <li><a href="?p=home">Home</a></li>
        <li><a href="?p=categories">Category List</a></li>
        <li><h1>Edit a Category</h1></li>
      </ul>
    </nav>
  </header>
  <article class="box-body">
    <form id="edit-category-form" class="form-large" onsubmit="javascript:category_saveCategory(); return false;">
      <vue-input-text label="Designation" v-model="data.category.label" v-bind:required="true" id="edit-label" />
      <vue-input-image label="Image" modelName="category" v-bind:modelId="data.modelDef.modelId(data.category)" v-model="data.image" :hadImage="data.category.hasImage" id="edit-image" />
      <vue-input-text label="Reference" v-model="data.category.reference" v-bind:required="true" id="edit-reference" />
      <div class="form-group">
        <label for="edit-parent">Parent</label>
        <select id="edit-parent" v-model="data.category.parent">
          <option :value="null">None</option>
          <option v-for="cat in data.categories" :key="cat.id" v-bind:value="cat.id">{{cat.label}}</option>
        </select>
      </div>
      <vue-input-number label="Order" v-model="data.category.dispOrder" id="edit-dispOrder" />
      <div class="form-control">
        <button class="btn btn-primary btn-send" type="submit">Save</button>
      </div>
    </form>
  </article>
</section>
</div>`
});

Vue.component("vue-category-import", {
	props: ["data"],
	data: function() {
		return {
			csv: null,
			linkedRecords: {
				category: this.data.categories,
			},
			importResult: null,
			tableColumns: [
				{ field: "reference", label: "Reference" },
				{ field: "label", label: "Designation" },
				{ field: "parent", label: "Parent", type: "record", modelName: "category" },
				{ field: "dispOrder", label: "Order", type: "number" },
			]
		};
	},
	template: `<div class="category-import">
<section class="box box-large">
  <header>
    <nav class="browser">
      <ul>
        <li><a href="?p=home">Home</a></li>
        <li><a href="?p=categories">Category List</a></li>
        <li><h1>Edit Categories via CSV File</h1></li>
      </ul>
    </nav>
    <nav class="navbar">
      <ul>
        <li>
          <label for="csv-file">File</label>
          <input ref="csvRef" type="file" accept="text/csv" id="csv-file" name="csv" @change="readCsv" />
        </li>
      </ul>
    </nav>
  </header>
  <div class="box-body">
    <vue-import-preview
      newTitle="New Categories"
      editTitle="Modified Categories"
      unchangedTitle="Unchanged Categories"
      modelsLabel="categories"
   	v-bind:modelDef="data.modelDef"
			v-bind:importResult="importResult"
			v-bind:linkedRecords="linkedRecords"
			v-bind:tableColumns="tableColumns"
			v-on:save="saveChanges" />
    
  </div>
</section>
</div>`,
	methods: {
		readCsv: function (event) {
			let fileName = event.target.files[0].name;
			let thiss = this;
			let reader = new FileReader();
			let callback = function(data) {
				thiss.importResult = data;
			}
			reader.onload = function(readerEvent) {
				let fileContent = readerEvent.target.result;
				_categories_parseCsv(fileContent, callback);
			};
			reader.readAsText(event.target.files[0]);
		},
		saveChanges: function() {
			categories_saveCategories();
		},
		reset: function() {
			this.csv = null;
			this.$refs.csvRef.value = "";
			this.importResult = null;
		},
	}
});
Vue.component("vue-product-list", {
	props: ["data"],
	data: function() {
		return {
			currentCategoryId: this.data.selectedCatId,
			sorting: this.data.sort,
			filterVisible: this.data.filterVisible,
			sortedProducts: [], // in data instead of computed because asynchronous
			productsTable: new Table().reference("product-list")
				.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).exportable(false).visible(true).help("The product button image. This field cannot be exported."))
				.column(new TableCol().reference("reference").label("Reference").searchable(true).visible(false).help("The reference must be unique for each product. It allows modification during product import."))
				.column(new TableCol().reference("label").label("Name").searchable(true).visible(true).help("The product name as displayed on POS buttons and the receipt."))
				.column(new TableCol().reference("category").label("Category").visible(false).help("The category name to which the product belongs."))
				.column(new TableCol().reference("barcode").label("Barcode").searchable(true).visible(false).help("The optional product barcode. It can be any string for manual input."))
				.column(new TableCol().reference("prepay").label("Prepaid recharge").type(TABLECOL_TYPE.BOOL).visible(false).help("Buying this product increases the customer's balance by the same amount. Prepaid products are not included in revenue and can also be used to refund customer debt."))
				.column(new TableCol().reference("scale").label("Sold by weight").type(TABLECOL_TYPE.BOOL).visible(false).help("If active, the quantity can be non-unitary and will be requested when adding to an order."))
				.column(new TableCol().reference("scaleType").label("Weight/Volume").visible(false).help("Indicates the unit of measure for content."))
				.column(new TableCol().reference("scaleValue").label("Content").type(TABLECOL_TYPE.NUMBER).visible(false).help("Indicates the quantity inside the product. For example, a 200g jar would have a content of 0.2. This allows for price-per-liter or kilogram calculations."))
				.column(new TableCol().reference("priceBuy").label("Purchase price (excl. tax)").type(TABLECOL_TYPE.NUMBER).visible(false).help("The purchase price excluding taxes. Optional field used to calculate margin. It is not versioned."))
				.column(new TableCol().reference("priceSell").label("Selling price (excl. tax)").type(TABLECOL_TYPE.NUMBER5).visible(false).help("The unit selling price excluding taxes."))
				.column(new TableCol().reference("priceSellVat").label("Selling price (incl. tax)").type(TABLECOL_TYPE.NUMBER2).visible(true).help("The unit selling price including taxes."))
				.column(new TableCol().reference("margin").label("Margin").type(TABLECOL_TYPE.NUMBER5).visible(false).help("Indicative margin excluding taxes. If the purchase price is not provided, margin equals the selling price excl. tax."))
				.column(new TableCol().reference("tax").label("VAT").visible(false).help("The associated VAT rate."))
				.column(new TableCol().reference("discountEnabled").label("Automatic discount").type(TABLECOL_TYPE.BOOL).visible(false).help("Indicates if a discount should be automatically applied when adding the product to an order."))
				.column(new TableCol().reference("discountRate").label("Discount rate").type(TABLECOL_TYPE.PERCENT).visible(false).help("The discount rate to apply automatically when automatic discount is enabled."))
				.column(new TableCol().reference("dispOrder").label("Order").type(TABLECOL_TYPE.NUMBER).visible(false).help("The display order of the product in its category. Orders donât have to be sequential, allowing easy insertion of new products (e.g., 10, 20, 30â¦)."))
				.column(new TableCol().reference("visible").label("For sale").type(TABLECOL_TYPE.BOOL).visible(false).help("Indicates whether the product is currently for sale. If not for sale, it wonât appear on POS."))
				.column(new TableCol().reference("operation").label("Operation").type(TABLECOL_TYPE.HTML).exportable(false).visible(true))
		};
	},
	template: `<div class="product-list">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Product List</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" v-bind:href="newUrl">Add Product</a></li>
				<li><a class="btn btn-add" v-bind:href="newCompoUrl">Add Composition</a></li>
				<li><a class="btn btn-add" href="?p=productImport">Import File</a></li>
			</ul>
			<ul>
				<li>
					<label for="filter-category">Category</label>
					<select id="filter-category" name="category" v-model="currentCategoryId">
						<option v-for="cat in data.categories" v-bind:value="cat.id">{{cat.label}}</option>
						<option value="">Show All</option>
					</select>
				</li>
				<li>
					<label for="filter-invisible">Status</label>
					<select id="filter-invisible" v-model="filterVisible">
						<option value="visible">For Sale</option>
						<option value="invisible">Not for Sale</option>
						<option value="all">All</option>
					</select>
				</li>
				<li>
					<label for="sort">Sort by</label>
					<select id="sort" name="sort" v-model="sorting">
						<option value="dispOrder">Order</option>
						<option value="label">Name</option>
						<option value="reference">Reference</option>
						<option value="priceBuy">Purchase Price</option>
						<option value="priceSell">Selling Price (excl. tax)</option>
						<option value="priceSellVat">Selling Price (incl. tax)</option>
						<option value="margin">Margin</option>
					</select>
				</li>
			</ul>
		</nav>
	</header>
	<div class="box-body">
		<vue-table v-bind:table="productsTable"></vue-table>
	</div>
</section>
</div>`,
methods: {
		imageSrc: function(prd) {
			return srvcall_imageUrl("product", prd);
		},
		editUrl: function(prd) {
			return "?p=product&id=" + prd.id;
		},
		sortAndAssign: function(products) {
			let lines = [];
			let cats = {};
			let taxes = {};
			for (let i = 0; i < this.data.categories.length; i++) {
				let cat = this.data.categories[i];
				cats[cat.id] = cat;
			}
			for (let i = 0; i < this.data.taxes.length; i++) {
				let tax = this.data.taxes[i];
				taxes[tax.id] = tax;
			}
			for (let i = 0; i < products.length; i++) {
				let prd = products[i];
				if ((this.filterVisible == "visible" && !prd.visible)
						|| (this.filterVisible == "invisible" && prd.visible)) {
					continue
				}
				let cat = "";
				if (prd.category in cats) {
					cat = cats[prd.category].label;
				}
				let tax = "";
				if (prd.tax in taxes) {
					tax = taxes[prd.tax].label;
				}
				let scaleType = "-";
				switch (prd.scaleType) {
					case 1:
						scaleType = "Kilogramme";
						break;
					case 2:
						scaleType = "Litre";
						break;
					case 3:
						scaleType = "Hour";
						break;
				}
				let line = [
					this.imageSrc(prd),
					prd.reference, prd.label, cat, prd.barcode,
					prd.prepay, prd.scaled,
					scaleType, prd.scaleValue,
					(prd.priceBuy != null) ? prd.priceBuy : "-",
					(prd.priceSell != null) ? prd.priceSell : "-",
					prd.taxedPrice,
					(prd.priceBuy != null && prd.priceSell != null) ? (prd.priceSell - prd.priceBuy) : "?",
					tax, prd.discountEnabled,
					prd.discountRate,
					prd.dispOrder, prd.visible,
					"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(prd) + "\">Edit</a></div>",
				];
				lines.push(line);
			}
			switch (this.sorting) {
				case "dispOrder":
					lines = lines.sort(tools_sort(16, 1));
					this.sortedProducts = products.sort(tools_sort("dispOrder", "reference"));
					break;
				case "label":
					lines = lines.sort(tools_sort(2));
					this.sortedProducts = products.sort(tools_sort("label"));
					break;
				case "reference":
					lines = lines.sort(tools_sort(1));
					this.sortedProducts = products.sort(tools_sort("reference"));
					break;
				case "priceSell":
					lines = lines.sort(tools_sort(10));
					this.sortedProducts = products.sort(tools_sort("priceSell"));
					break;
				case "priceSellVat":
					lines = lines.sort(tools_sort(11));
					this.sortedProducts = products.sort(tools_sort("priceSellVat"));
					break;
				case "priceBuy":
					lines = lines.sort(tools_sort(9));
					this.sortedProducts = products.sort(tools_sort("priceBuy"));
					break;
				case "margin":
					lines = lines.sort(tools_sort(12));
					this.sortedProducts = products.sort(tools_sort("margin"));
					break;

			}
			this.productsTable.resetContent(lines);
		},
		loadProducts: function() {
			let thiss = this;
			if (this.currentCategoryId != "") {
				storage_open(function(event) {
					storage_getProductsFromCategory(thiss.currentCategoryId, function(products) {
						thiss.sortAndAssign(products);
						storage_close();
					});
				});
			} else {
				storage_open(function(event) {
					storage_readStore("products", function(products) {
						thiss.sortAndAssign(products);
						storage_close();
					});
				});
			}
		},
	updateTableTitle: function() {
		if (this.currentCategoryId != "") {
			let category = this.data.categories.find(c => c.id == this.currentCategoryId, this);
			if (typeof category != "undefined") {
				let status;
				switch (this.filterVisible) {
					case "visible": status = " for sale"; break;
					case "invisible": status = " not for sale"; break;
					default: status = ""; break;
				}
				let prefix;
				if (this.filterVisible != "all") {
					prefix = "Products in the category \"";
				} else {
					prefix = "All products in the category \"";
				}
				this.productsTable.title(prefix + category.label + "\"" + status);
			}
		} else {
			let title = "All products";
			switch (this.filterVisible) {
				case "visible": title += " for sale"; break;
				case "invisible": title += " not for sale"; break;
				default: break;
			}
			this.productsTable.title(title);
		}
	}

},
	computed: {
		newUrl: function() {
			return "?p=product&category=" + this.currentCategoryId;
		},
		newCompoUrl: function() {
			return "?p=productCompo&category=" + this.currentCategoryId;
		},
	},
	mounted: function() {
		this.loadProducts();
		this.updateTableTitle();
	},
	watch: {
		sorting: function (newSort, oldSort) {
			this.sortAndAssign(this.sortedProducts);
		},
		currentCategoryId: function(newCatId, oldCatID) {
			this.loadProducts();
			this.updateTableTitle();
		},
		filterVisible: function(newVisible, oldVisible) {
			this.sortAndAssign(this.sortedProducts);
			this.updateTableTitle();
		}
	},
});

Vue.component("vue-product-form", {
	props: ["data"],
	data: function() {
		return {
			"backUrl": "?p=products",
		};
	},
	template: `<div class="product-form">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a v-bind:href="backUrl">Product List</a></li>
				<li><h1>Edit a Product</h1></li>
			</ul>
		</nav>
		<nav class="navbar" v-if="data.product.id">
			<ul>
				<li><a class="btn btn-add" v-bind:href="duplicateUrl">Duplicate Product</a></li>
			</ul>
		</nav>
	</header>
	<div class="box-body">
		<form class="form-large" id="edit-product-form" onsubmit="javascript:products_saveProduct(); return false;">
			<fieldset>
				<legend>Display</legend>
				<vue-input-text label="Name" v-model="data.product.label" v-bind:required="true" id="edit-label" />
				<div class="form-group">
					<label for="edit-image">Image</label>
					<img v-if="data.product.hasImage" id="product-image" class="img img-thumbnail" v-bind:src="imageSrc(data.product)" />
					<input id="edit-image" type="file" accept="image/*" />
					<button type="button" v-if="data.hadImage" class="btn btn-del" onclick="javascript:product_toggleImage();return false;" >{{data.deleteImageButton}}</button>
				</div>
				<div class="form-group">
					<label for="edit-category">Category</label>
					<select class="form-control" id="edit-category" v-model="data.product.category">
						<option v-for="cat in data.categories" :key="cat.id" v-bind:value="cat.id">{{cat.label}}</option>
					</select>
				</div>
				<vue-input-number label="Display Order" v-model.number="data.product.dispOrder" id="edit-dispOrder" />
				<vue-input-checkbox label="For Sale" v-model="data.product.visible" id="edit-visible" />
				<vue-input-checkbox label="Prepaid Recharge" v-model="data.product.prepay" id="edit-prepay" />
			</fieldset>
			<fieldset>
				<legend>Price</legend>
				<div class="form-group">
					<label for="edit-priceSell">Sale Price (excl. tax)</label>
					<input type="number" id="edit-priceSell" name="priceSell" class="form-control" v-model="data.product.priceSell" step="0.01" disabled="true">
				</div>
				<div class="form-group">
					<label for="edit-tax">VAT</label>
					<select class="form-control" id="edit-tax" v-model="data.product.tax" v-on:change="updatePrice" required>
						<option disabled value="">Select a VAT rate</option>
						<option v-for="tax in data.taxes" :key="tax.id" v-bind:value="tax.id">{{tax.label}}</option>
					</select>
				</div>
				<div class="form-group">
					<label for="edit-taxedPrice">Sale Price (incl. tax)</label>
					<input type="number" id="edit-taxedPrice" v-model.number="data.product.taxedPrice" v-on:change="updatePrice" step="0.01" />
				</div>
				<div class="form-group">
					<label for="edit-priceBuy">Purchase Price (excl. tax)</label>
					<input type="number" id="edit-priceBuy" name="priceBuy" v-model.number="data.product.priceBuy" v-on:change="updatePrice" step="0.01" />
				</div>
				<div class="form-group">
					<label for="edit-margin">Margin</label>
					<input type="text" id="edit-margin" name="margin" v-model="data.product.margin" disabled="true" />
				</div>
				<vue-input-rate label="Automatic Discount" v-model="data.product.discountRate" id="edit-discountRate" />
				<vue-input-checkbox label="Apply Automatic Discount" v-model="data.product.discountEnabled" id="edit-discountEnabled" />
			</fieldset>
			<fieldset>
				<legend>Reference</legend>
				<vue-input-text label="Reference" v-model="data.product.reference" v-bind:required="true" id="edit-reference" />
				<vue-input-text label="Barcode" v-model="data.product.barcode" id="edit-barcode" />
			</fieldset>
			<fieldset>
				<legend>Volume and Capacity</legend>
				<vue-input-checkbox label="Sold in Bulk" v-model="data.product.scaled" id="edit-scaled" />
				<div class="form-group">
					<vue-input-number label="Capacity" v-bind:step="0.001" v-model="data.product.scaleValue" v-if="data.product.scaled == false" id="edit-scaleValue" />
					<select id="edit-scaleType" v-model="data.product.scaleType">
						<option v-bind:value="0" v-bind:disabled="data.product.scaled == true">Piece</option>
						<option v-bind:value="1">Kilogram</option>
						<option v-bind:value="2">Litre</option>
						<option v-bind:value="3">Hour</option>
					</select>
				</div>
				<div class="form-group">
					<label for="edit-refPrice">Reference Price (incl. tax)</label>
					<input id="edit-refPrice" v-model="refPrice" disabled="true" />
				</div>
			</fieldset>

			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</div>
</section>
</div>` ,
	computed: {
		duplicateUrl: function() {
			return "?p=productDuplicate&id=" + this.data.product.id;
		},
		refPrice: function() {
			let price = this.data.product.taxedPrice;
			if (!this.data.product.scaled) {
				price = price / this.data.product.scaleValue;
			}
			price = price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + "€ ";
			switch (this.data.product.scaleType) {
				case 0:
					price += "per piece";
					break;
				case 1:
					price += "per kilogram";
					break;
				case 2:
					price += "per litre";
					break;
				case 3:
					price += "per hour";
					break;
			}

			return price;
		}
	},
	methods: {
		updatePrice: function() {
			product_updatePrice();
		},
		imageSrc: function(prd) {
			return srvcall_imageUrl("product", prd);
		}
	},
	mounted: function() {
		this.backUrl = "?p=products&category=" + encodeURIComponent(this.data.product.category);
	}
});

Vue.component("vue-product-composition-form", {
	props: ["data"],
	data: function() {
		return {
			"selectedGroupIndex": 0,
			"productCache": [],
			"backUrl": "?p=products"
		}
	},
	template: `<div class="composition-form">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a v-bind:href="backUrl">Product list</a></li>
				<li><h1>Edit a product</h1></li>
			</ul>
		</nav>
		<nav class="navbar" v-if="data.product.id">
			<ul>
				<li><a class="btn btn-add" v-bind:href="duplicateUrl">Duplicate product</a></li>
			</ul>
		</nav>
	</header>
	<div class="box-body">
		<form class="form-large" id="edit-product-form" onsubmit="javascript:products_saveProduct(); return false;">
			<fieldset>
				<legend>Display</legend>
				<div class="form-group">
					<label for="edit-label">Name</label>
					<input id="edit-label" type="text" v-model="data.product.label" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-image">Image</label>
					<img v-if="data.product.hasImage" id="product-image" v-bind:src="imageSrc(data.product)" />
					<input id="edit-image" type="file" accept="image/*" />
					<button type="button" v-if="data.hadImage" class="btn btn-del" onclick="javascript:product_toggleImage();" >{{data.deleteImageButton}}</button>
				</div>
				<div class="form-group">
					<label for="edit-category">Category</label>
					<select id="edit-category" v-model="data.product.category">
						<option v-for="cat in data.categories" :key="cat.id" v-bind:value="cat.id">{{cat.label}}</option>
					</select>
				</div>
				<div class="form-group">
					<label for="edit-dispOrder">Order</label>
					<input id="edit-dispOrder" type="number" v-model.number="data.product.dispOrder" />
				</div>
				<div class="form-group">
					<input class="form-control" id="edit-visible" type="checkbox" v-model="data.product.visible">
					<label for="edit-visible">For sale</label>
				</div>
			</fieldset>
			<fieldset>
				<legend>Price</legend>
				<div class="form-group">
					<label for="edit-priceSell">Sale price excl. tax</label>
					<input type="number" id="edit-priceSell" name="priceSell" v-model="data.product.priceSell" step="0.01" disabled="true">
				</div>
				<div class="form-group">
					<label for="edit-tax">VAT</label>
					<select class="form-control" id="edit-tax" v-model="data.product.tax" v-on:change="updatePrice" required>
						<option disabled value="">Select a VAT</option>
						<option v-for="tax in data.taxes" :key="tax.id" v-bind:value="tax.id">{{tax.label}}</option>
					</select>
				</div>
				<div class="form-group">
					<label for="edit-taxedPrice">Sale price incl. tax</label>
					<input type="number" id="edit-taxedPrice" v-model="data.product.taxedPrice" v-on:change="updatePrice" step="0.01" />
				</div>
				<div class="form-group">
					<label for="edit-priceBuy">Purchase price</label>
					<input type="number" id="edit-priceBuy" name="priceBuy" v-model="data.product.priceBuy" v-on:change="updatePrice" step="0.01" />
				</div>
				<div class="form-group">
					<label for="edit-margin">Margin</label>
					<input type="text" id="edit-margin" name="margin" v-model="data.product.margin" disabled="true" />
				</div>
			</fieldset>
			<fieldset>
				<legend>Referencing</legend>
				<div class="form-group">
					<label for="edit-reference">Reference</label>
					<input id="edit-reference" type="text" v-model="data.product.reference" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-barcode">Barcode</label>
					<input id="edit-barcode" type="text" name="barcode" v-model="data.product.barcode" />
				</div>
				<div class="form-group">
					<label for="edit-discountEnabled">Auto discount</label>
					<input id="edit-discountEnable" type="checkbox" v-model="data.product.discountEnabled" />
				</div>
				<div class="form-group">
					<label for="edit-discountRate">Discount rate</label>
					<input id="edit-discountRate" type="number" v-model="data.product.discountRate" step="0.01" />
				</div>
			</fieldset>

			<fieldset>
				<legend>Choice</legend>
				<vue-catalog-picker v-bind:categories="data.categories" v-bind:prdPickCallback="addProduct" v-bind:excludeCompositions="true"/>
				<button type="button" v-on:click="addGroup">Add a choice</button>
				<template v-for="(subgroup, i) in data.product.compositionGroups">
				<div class="composition-subgroup-editor" v-if="isSelected(i)">
					<dl class="dl-horizontal">
						<dt><label v-bind:for="'edit-group-label-' + i">Choice name</label></dt>
						<dd><input class="form-control" v-bind:id="'edit-group-label-' + i" type="text" v-model="subgroup.label" /></dd>

						<dt><label v-bind:for="'edit-group-dispOrder-' + i">Order</label></dt>
						<dd><input class="form-control" v-bind:id="'edit-dispOrder-' + i" type="number" v-model.number="subgroup.dispOrder" /></dd>
					</dl>
					<ul class="catalog-picker">
						<li v-for="prd in subgroup.compositionProducts">
							<button type="button" v-on:click="delPrdPickCallback(prd.product)">
								<img v-bind:src="imageSrcId(prd.product)" />
								<label>{{prdLabel(prd.product)}}</label>
							</button>
						</li>
					</ul>
				</div>
				</template>
				<table class="table table-bordered table-hover">
					<col />
					<col style="width:10%; min-width: 5em;" />
					<col style="width:10%; min-width: 15em;" />
					<thead>
						<tr>
							<th>Name</th>
							<th>Display order</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody id="group-list">
						<tr v-for="(group, i) in data.product.compositionGroups">
							<td>{{group.label}}</td>
							<td>{{group.dispOrder}}</td>
							<td>
								<div class="btn-group pull-right" role="group">
									<button type="button" class="btn btn-edit" v-bind:disabled="isSelected(i)" v-on:click="selectGroup(i)">Select</button> 
									<button type="button" class="btn btn-delete" v-bind:disabled="isSingleGroup()" v-on:click="deleteGroup(i)">Delete</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</fieldset>
			<div class="form-group">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</div>
</section>
</div>
`,

	methods: {
		updatePrice: function() {
			product_updatePrice();
		},
		imageSrc: function(prd) {
			if (prd != null) {
				return srvcall_imageUrl("product", prd);
			}
		},
		imageSrcId: function(prdId) {
			return this.imageSrc(this.productCache[prdId]);
		},
		selectGroup: function(index) {
			this.selectedGroupIndex = index;
			product_composition_switchGroup(index);
		},
		addGroup: function() {
			product_composition_addGroup("");
			this.selectGroup(this.data.product.compositionGroups.length - 1);
		},
		addProduct: function(product) {
			this.productCache[product.id] = product;
			product_composition_addProduct(product);
		},
		delPrdPickCallback: function(prdId) {
			product_composition_delProduct(prdId);
		},
		deleteGroup: function (index) {
			if (this.selectedGroupIndex >= index) {
				this.selectGroup(index--);
			}
			product_composition_deleteGroup(index);
		},
		isSelected: function(index) {
			return this.selectedGroupIndex == index;
		},
		prdLabel: function(id) {
			if (!(id in this.productCache)) {
				return "???";
			}
			return this.productCache[id].label;
		},
		isSingleGroup: function() {
			return this.data.product.compositionGroups.length == 1;
		}
	},
	computed: {
		groupProducts: function() {
			return this.data.product.compositionGroups[selectedGroupIndex].compositionProducts;
		},
		duplicateUrl: function() {
			return "?p=productDuplicate&id=" + this.data.product.id;
		},
	},
	created: function() {
		for (let id in this.data.precache) {
			let prd = this.data.precache[id];
			this.productCache[id] = prd;
		}
	},
	mounted: function() {
		this.backUrl = "?p=products&category=" + encodeURIComponent(this.data.product.category);
	}
});

Vue.component("vue-product-import", {
	props: ["data"],
	data: function() {
		return {
			csv: null,
			linkedRecords: {
				category: this.data.categories,
				tax: this.data.taxes,
			},
			importResult: null,
			tableColumns: [
				{field: "reference", label: "Reference"},
				{field: "label", label: "Name"},
				{field: "category", label: "Category", type: "record", modelName: "category"},
				{field: "barcode", label: "Barcode"},
				{field: "prepay", label: "Prepayment recharge", type: "boolean"},
				{field: "scaled", label: "Sold by weight", type: "boolean"},
				{field: "scaleType", label: "Weight/Volume", type: "scaleType"},
				{field: "scaleValue", label: "Capacity", type: "number"},
				{field: "priceBuy", label: "Purchase price excl. tax", type: "number5"},
				{field: "priceSell", label: "Sale price excl. tax", type: "number5"},
				{field: "taxedPrice", label: "Sale price incl. tax", type: "number2"},
				{field: "tax", label: "VAT", type: "record", modelName: "tax"},
				{field: "discountEnabled", label: "Automatic discount", type: "boolean"},
				{field: "discountRate", label: "Discount rate", type: "rate"},
				{field: "dispOrder", label: "Order", type: "number"},
				{field: "visible", label: "For sale", type: "boolean"},
			],

		};
	},
	template: `<div class="product-import">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=products">Product List</a></li>
				<li><h1>Modify Products via CSV File</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li>
					<label for="csv-file">File</label>
					<input ref="csvRef" type="file" accept="text/csv" id="csv-file" name="csv" v-on:change="readCsv" />
				</li>
			</ul>
		</nav>
	</header>
	<div class="box-body">
		<vue-import-preview newTitle="New Products" editTitle="Modified Products" unchangedTitle="Unchanged Products" modelsLabel="products"
			v-bind:modelDef="data.modelDef"
			v-bind:importResult="importResult"
			v-bind:linkedRecords="linkedRecords"
			v-bind:tableColumns="tableColumns"
			v-on:save="saveChanges" />
	</div>
</section>
</div>`,

	methods: {
		readCsv: function (event) {
			let fileName = event.target.files[0].name;
			let thiss = this;
			let reader = new FileReader();
			let callback = function(data) {
				thiss.importResult = data;
			}
			reader.onload = function(readerEvent) {
				let fileContent = readerEvent.target.result;
				let data = _products_parseCsv(fileContent, callback);
			};
			reader.readAsText(event.target.files[0]);
		},
		saveChanges: function() {
			products_saveProducts();
		},
		reset: function() {
			this.csv = null;
			this.$refs.csvRef.value = "";
			this.importResult = null;
		},
	}
});
Vue.component("vue-tariffarea-list", {
	props: ["data"],
	data: function() {
		return {
			areasTable: new Table().reference("tariffarea-list")
				.column(new TableCol().reference("reference").label("Reference").visible(false).searchable(true).help("The reference must be unique for each zone. It allows modification during import."))
				.column(new TableCol().reference("label").label("Name").visible(true).searchable(true).help("The name of the zone as displayed on the cash register buttons."))
				.column(new TableCol().reference("dispOrder").label("Order").type(TABLECOL_TYPE.NUMBER).visible(false).help("The display order of the category. Orders donât have to be sequential, which allows easier insertion of new categories. For example 10, 20, 30â¦"))
				.column(new TableCol().reference("tariff").label("Tariffs").type(TABLECOL_TYPE.NUMBER).visible(false).help("The number of tariffs defined in this zone."))
				.column(new TableCol().reference("operation").label("Operation").type(TABLECOL_TYPE.HTML).exportable(false).visible(true))
		};
	},
	template: `<div class="tariffarea-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>List of Tariff Zones</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=tariffarea">Add a Zone</a></li>
			</ul>
			<ul>
				<li>
					<label for="sort">Sort by</label>
					<select id="sort" name="sort" v-model="data.sort" v-on:change="sort">
						<option value="dispOrder">Order</option>
						<option value="label">Name</option>
					</select>
				</li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<vue-table v-bind:table="areasTable" v-bind:noexport="true"></vue-table>
	</article>
</section>
</div>
`,
	methods: {
		editUrl: function(cat) {
			return "?p=tariffarea&id=" + cat.id;
		},
		sort: function(event) {
			switch (this.data.sort) {
				case "dispOrder":
					this.areasTable.sort(tools_sort(2, 0));
					break;
				case "label":
					this.areasTable.sort(tools_sort(1));
					break;
			}
		},
	},
	mounted: function() {
		for (let i = 0; i < this.data.tariffareas.length; i++) {
			let area = this.data.tariffareas[i];
			let line = [
				area.reference, area.label, area.dispOrder,
				area.prices.length,
				"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(area) + "\">Edit</a></div>",
			];
			this.areasTable.line(line);
		}
		this.sort();
	}
});

Vue.component("vue-tariffarea-form", {
	props: ["data"],
	data: function() {
		return {"null": null, "productCache": []};
	},
	template: `<div class="tariffarea-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=tariffareas">List of Tariff Zones</a></li>
				<li><h1>Edit a Tariff Zone</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li>
					<button class="btn btn-add" v-on:click="exportCsv(false)">Export Zone</button>
				</li>
				<li>
					<button class="btn btn-add" v-on:click="exportCsv(true)">Export Zone (Excel)</button>
				</li>
				<li>
					<label for="csv-file">Replace with a file</label>
					<input ref="csvRef" type="file" accept="text/csv" id="csv-file" name="csv" v-on:change="readCsv" />
				</li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-category-form" class="form-large" onsubmit="javascript:tariffareas_saveArea(); return false;">
			<div class="form-group">
				<label for="edit-label">Name</label>
				<input id="edit-label" type="text" v-model="data.tariffarea.label" required="true" />
			</div>
			<div class="form-group">
				<label for="edit-reference">Reference</label>
				<input id="edit-reference" type="text" v-model="data.tariffarea.reference" required="true" />
			</div>
			<div class="form-group">
				<label for="edit-dispOrder">Order</label>
				<input id="edit-dispOrder" type="number" v-model.number="data.tariffarea.dispOrder">
			</div>

			<h2>Prices</h2>
			<vue-catalog-picker v-bind:categories="data.categories" v-bind:prdPickCallback="pickProduct" />

			<table>
				<col />
				<col style="width:10%; min-width: 5em;" />
				<col style="width:10%; min-width: 5em;" />
				<col style="width:10%; min-width: 5em;" />
				<col style="width:10%; min-width: 5em;" />
				<thead>
					<tr>
						<th>Name</th>
						<th>Original Selling Price</th>
						<th>Selling Price (excl. VAT)</th>
						<th>Selling Price (incl. VAT)</th>
						<th>VAT</th>
						<th>Operation</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="price in data.tariffarea.prices">
						<td><img class="thumbnail thumbnail-text"  v-bind:src="imageSrc(price.product)" />{{label(price.product)}}</td>
						<td>{{priceSell(price.product)}}</td>
						<td><input type="number" v-model.number="price.price" disabled="true" /></td>
						<td><input type="number" v-model.number="price.priceSellVat" step="0.01" v-on:change="updatePrice(price)" /></td>
						<td><select v-model="price.tax" v-on:change="updatePrice(price)">
							<option v-bind:value="null">Unchanged</option>
							<option v-for="tax in data.taxes" :key="tax.id" v-bind:value="tax.id">{{tax.label}}</option>
						</select></td>
						<td><button type="button" class="btn btn-delete" v-on:click="deletePrice(price.product)">X</button></td>
					</tr>
				</tbody>
			</table>

			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
		imageSrc: function(prdId) {
			if (!(prdId in this.data.productCache)) {
				return srvcall_imageUrl("product");
			}
			return srvcall_imageUrl("product", this.data.productCache[prdId]);
		},
		priceSell: function(prdId) {
			if (!(prdId in this.data.productCache)) {
				return "???";
			}
			let product = this.data.productCache[prdId];
			let taxId = product.tax;
			let tax = null;
			for (let i = 0; i < this.data.taxes.length; i++) {
				if (this.data.taxes[i].id == taxId) {
					tax = this.data.taxes[i];
					break;
				}
			}
			return Number(product.priceSell * (1.0 + tax.rate)).toFixed(2);
		},
		label: function(prdId) {
			if (!(prdId in this.data.productCache)) {
				return "???";
			}
			let product = this.data.productCache[prdId];
			return product.label;
		},
		reference: function(prdId) {
			if (!(prdId in this.data.productCache)) {
				return "???";
			}
			let product = this.data.productCache[prdId];
			return product.reference;
		},
		pickProduct: function(product) {
			tariffareas_addProduct(product);
		},
		deletePrice: function(productId) {
			tariffareas_delProduct(productId);
		},
		updatePrice: function(price) {
			tariffareas_updatePrice(price);
		},
		tax: function(taxId) {
			for (let i = 0; i < this.data.taxes.length; i++) {
				let tax = this.data.taxes[i];
				if (tax.id == taxId) {
					return tax;
				}
			}
		},
		readCsv: function (event) {
			let fileName = event.target.files[0].name;
			let thiss = this;
			let reader = new FileReader();
			let callback = function(data) {
				thiss.newCategories = data.newCategories;
				thiss.editedCategories = data.editedCategories;
				thiss.editedValues = data.editedValues;
				thiss.unchangedCategories  = data.unchangedCategories;
				thiss.unknownColumns = data.unknownColumns;
				thiss.errors = data.errors;
			}
			reader.onload = function(readerEvent) {
				let fileContent = readerEvent.target.result;
				let data = _tariffareas_parseCsv(fileContent, callback);
			};
			reader.readAsText(event.target.files[0]);
		},
		exportCsv: function(withExcelBom) {
			let csvData = [];
			csvData.push(["Reference", "Selling Price (incl. VAT)", "VAT"]);
			for (let i = 0; i < this.data.tariffarea.prices.length; i++) {
				let price = this.data.tariffarea.prices[i];
				let priceSellVat = price.priceSellVat.toLocaleString();
				let tax = "";
				if (price.tax != null) {
					tax = this.tax(price.tax).reference;
				}
				csvData.push([this.reference(price.product), priceSellVat, tax]);
			}
			// Generate csv (with some utf-8 tweak)
			let encodedData = new CSV(csvData).encode();
			encodedData = encodeURIComponent(encodedData).replace(/%([0-9A-F]{2})/g,
				function toSolidBytes(match, p1) {
					return String.fromCharCode('0x' + p1);
				});
			if (withExcelBom) {
				encodedData = String.fromCharCode(0xef, 0xbb, 0xbf) + encodedData;
			}
			// Set href for download
			let href = "data:text/csv;base64," + btoa(encodedData);
			window.open(href, "csvexport");
		}
	},
});

Vue.component("vue-customer-list", {
	props: ["data"],
	data: function () {
		return {
			taLabels: {},
			taxLabels: {},
			dpLabels: {},
			filterVisible: this.data.filterVisible,
			customers: [], // in data instead of computed because asynchronous
			stats: {
				activeCount: 0,
				inactiveCount: 0,
				expiredActiveCount: 0,
				prepaidTotal: 0.0,
				debtTotal: 0.0,
				balanceTotal: 0.0,
			},
			customersTable: new Table().reference("customer-list")
				.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).exportable(false).visible(true).help("The customer's profile picture. This field cannot be exported."))
				.column(new TableCol().reference("dispName").label("Displayed Name").visible(true).searchable(true).help("The customer's name as displayed or printed"))
				.column(new TableCol().reference("card").label("Card").visible(false).searchable(true).help("Card number or name."))
				.column(new TableCol().reference("balance").label("Balance").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(true).help("The customer's account balance. Positive when the prepaid account is loaded, negative when the account has debts."))
				.column(new TableCol().reference("prepaid").label("Prepaid").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The prepaid amount of the customer's account. Filters only positive balances."))
				.column(new TableCol().reference("debt").label("Debt").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The debt amount of the customer's account. Filters only negative balances."))
				.column(new TableCol().reference("maxDebt").label("Max Debt").type(TABLECOL_TYPE.NUMBER2).visible(false).help("The maximum allowed debt for this account."))
				.column(new TableCol().reference("notes").label("Note").visible(false).help("The customer's profile notes."))
				.column(new TableCol().reference("expireDate").label("Expiration Date").type(TABLECOL_TYPE.DATE).visible(false).help("The expiration date of the customer's account."))
				.column(new TableCol().reference("visible").label("Active").type(TABLECOL_TYPE.BOOL).visible(false).help("Indicates if the customer account can be used or not."))
				.column(new TableCol().reference("discountProfile").label("Discount Profile").visible(false).help("The automatically associated discount profile."))
				.column(new TableCol().reference("tariffArea").label("Tariff Area").visible(false).help("The automatically associated tariff area."))
				.column(new TableCol().reference("tax").label("VAT").visible(false).help("The automatically associated VAT rate."))
				.column(new TableCol().reference("firstName").label("First Name").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("lastName").label("Last Name").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("email").label("Email").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("phone1").label("Phone").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("phone2").label("Phone 2").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("fax").label("Fax").visible(false).help("Contact information."))
				.column(new TableCol().reference("addr1").label("Address").visible(false).help("Contact information."))
				.column(new TableCol().reference("addr2").label("Address 2").visible(false).help("Contact information."))
				.column(new TableCol().reference("zipCode").label("Postal Code").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("city").label("City").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("region").label("Region").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("country").label("Country").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("operation").label("Operation").type(TABLECOL_TYPE.HTML).exportable(false).visible(true)),
		};
	},
	template: `

<div class="customer-list">
	<section class="box box-medium">
		<header>
			<nav class="browser">
				<ul>
					<li><a href="?p=home">Home</a></li>
					<li><h1>Customer List</h1></li>
				</ul>
			</nav>
			<nav class="navbar">
				<ul>
					<li><a class="btn btn-add" href="?p=customer">Add a Customer</a></li>
					<li><a class="btn btn-add" href="?p=customerImport">Import a File</a></li>
				</ul>
				<ul>
					<li>
						<label for="filter-invisible">Status</label>
						<select id="filter-invisible" v-model="filterVisible">
							<option value="visible">Active</option>
							<option value="invisible">Inactive</option>
							<option value="all">All</option>
						</select>
					</li>
				</ul>
			</nav>
		</header>
		<article class="box-body">
			<vue-table v-bind:table="customersTable"></vue-table>
			<h3>Statistics</h3>
			<ul>
				<li>Active customer accounts: {{ stats.activeCount }}</li>
				<li>Inactive customer accounts: {{ stats.inactiveCount }}</li>
				<li>Expired active customer accounts: {{ stats.expiredActiveCount }}</li>
				<li>Total prepaid: {{ stats.prepaidTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</li>
				<li>Total debt: {{ stats.debtTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</li>
				<li>Total balance: {{ stats.balanceTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</li>
			</ul>
		</article>
	</section>
</div>

	`,
	methods: {
		imageSrc: function (cust) {
			if (cust.hasImage) {
				return login_getHostUrl() + "/api/image/customer/" + cust.id + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/customer/default?Token=" + login_getToken();
			}
		},
		editUrl: function (cust) {
			return "?p=customer&id=" + cust.id;
		},
		resetStats: function () {
			this.stats.activeCount = 0;
			this.stats.inactiveCount = 0;
			this.stats.expiredActiveCount = 0;
			this.stats.prepaidTotal = 0.0;
			this.stats.debtTotal = 0.0;
			this.stats.balanceTotal = 0.0;
		},
		assign: function (customers) {
			this.customers = customers;
			this.customersTable.resetContent();
			this.resetStats();
			for (let i = 0; i < this.customers.length; i++) {
				let cust = this.customers[i];
				let now = new Date();
				if (cust.visible) {
					this.stats.activeCount++;
					if (cust.expireDate && now > cust.expireDate) {
						this.stats.expiredActiveCount++;
					}
					if (cust.balance > 0.0) {
						this.stats.prepaidTotal += cust.balance;
					} else {
						this.stats.debtTotal -= cust.balance;
					}
					this.stats.balanceTotal += cust.balance;
				} else {
					this.inactiveCount++;
				}
				if (!((this.filterVisible == "all") || (this.filterVisible == "visible" && cust.visible) || (this.filterVisible == "invisible" && !cust.visible))) {
					continue;
				}
				(cust.discountProfile != null) ?
					cust.dpLabel = this.dpLabels[cust.discountProfile] :
					cust.dpLabel = "";
				(cust.tariffArea != null) ?
					cust.taLabel = this.taLabels[cust.tariffArea] :
					cust.taLabel = "";
				(cust.tax != null) ?
					cust.taxLabel = this.taxLabels[cust.tax] :
					cust.taxLabel = "";
				let line = [
					this.imageSrc(cust),
					cust.dispName, cust.card, cust.balance,
					(cust.balance > -0.005) ? cust.balance : 0.0,
					(cust.balance < 0.005) ? -cust.balance : 0.0,
					cust.maxDebt, cust.note, cust.expireDate,
					cust.visible,
					cust.dpLabel, cust.taLabel, cust.taxLabel, cust.firstName,
					cust.lastName, cust.email, cust.phone1, cust.phone2, cust.fax,
					cust.addr1, cust.addr2, cust.zipCode, cust.city, cust.region,
					cust.country,
					"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(cust) + "\">Modifier</a></div>"
				];
				this.customersTable.line(line);
			}
		},
		loadCustomers: function () {
			let thiss = this;
			gui_showLoading();
			storage_open(function (event) {
				storage_readStore("customers", function (customers) {
					storage_close();
					thiss.assign(customers.sort(tools_sort("dispName", "card")));
					gui_hideLoading();
				});
			});
		},
	},
	mounted: function () {
		for (let i = 0; i < this.data.tariffAreas.length; i++) {
			let ta = this.data.tariffAreas[i];
			this.taLabels[ta.id] = ta.label;
		}
		for (let i = 0; i < this.data.taxes.length; i++) {
			let tax = this.data.taxes[i];
			this.taxLabels[tax.id] = tax.label;
		}
		for (let i = 0; i < this.data.discountProfiles.length; i++) {
			let dp = this.data.discountProfiles[i];
			this.dpLabels[dp.id] = dp.label;
		}
		let customContactFields = this.data.contactFields;
		this.customersTable.columns().forEach(col => {
			if (col.reference() in customContactFields) {
				let custom = customContactFields[col.reference()];
				if (custom.value != "") {
					col.label(custom.value);
				}
			}
		});
		this.loadCustomers();
	},
	watch: {
		filterVisible: function (newVisible, oldVisible) {
			this.assign(this.customers);
		}
	}
});

Vue.component("vue-customer-form", {
	props: ["data"],
	data: function () {
		return {oldBalance: (this.data.customer.id != null) ? this.data.customer.balance : 0};
	},
	template: `
<div class="customer-form">
  <section class="box box-large">
    <header>
      <nav class="browser">
        <ul>
          <li><a href="?p=home">Home</a></li>
          <li><a href="?p=customers">Customer List</a></li>
          <li><h1>Edit Customer Profile</h1></li>
        </ul>
      </nav>
    </header>
    <article class="box-body">
      <form id="edit-customer-form" class="form-large" onsubmit="javascript:customers_saveCustomer(); return false;">
        <fieldset>
          <legend>Display</legend>
          <vue-input-text label="Display Name" v-model="data.customer.dispName" v-bind:required="true" id="edit-dispName" />
          <vue-input-text label="Card" v-model="data.customer.card" id="edit-card" />
          <vue-input-image label="Image" modelName="customer" v-bind:modelId="data.modelDef.modelId(data.customer)" v-model="data.image" v-bind:hadImage="data.customer.hasImage" id="edit-image" />
          <vue-input-checkbox label="Active" v-model="data.customer.visible" id="edit-visible" />
          <vue-input-textarea label="Notes" v-model="data.customer.note" id="edit-note" />
          <div class="form-group">
            <label for="edit-expireDate">Expiration Date</label>
            <vue-inputdate id="edit-expireDate" v-model="data.customer.expireDate" />
          </div>
        </fieldset>
        <fieldset>
          <legend>Prepayment and Credit</legend>
          <div class="form-group">
            <label for="show-balance">Balance</label>
            <input type="number" id="show-balance" v-model="data.customer.balance" disabled="true">
          </div>
          <vue-input-number label="Max Debt" v-model="data.customer.maxDebt" v-bind:step="0.01" v-bind:min="0.0" id="edit-maxDebt" />
        </fieldset>
        <fieldset>
          <legend>Special Pricing</legend>
          <div class="form-group">
            <label for="edit-discountProfile">Discount Profile</label>
            <select id="edit-discountProfile" v-model="data.customer.discountProfile">
              <option v-bind:value="null">No Discount Profile</option>
              <option v-for="discountProfile in data.discountProfiles" :key="discountProfile.id" v-bind:value="discountProfile.id">{{discountProfile.label}}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="edit-tariffArea">Tariff Zone</label>
            <select class="form-control" id="edit-tariffArea" v-model="data.customer.tariffArea">
              <option v-bind:value="null">No Tariff Zone</option>
              <option v-for="tariffArea in data.tariffAreas" :key="tariffArea.id" v-bind:value="tariffArea.id">{{tariffArea.label}}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="edit-tax">VAT</label>
            <select class="form-control" id="edit-tax" v-model="data.customer.tax">
              <option v-bind:value="null">No Change</option>
              <option v-for="tax in data.taxes" :key="tax.id" v-bind:value="tax.id">{{tax.label}}</option>
            </select>
          </div>
        </fieldset>
        <fieldset>
          <legend>Contact Details</legend>
          <vue-input-text v-bind:label="contactFieldLabel('firstName')" v-model="data.customer.firstName" id="edit-firstName" />
          <vue-input-text v-bind:label="contactFieldLabel('lastName')" v-model="data.customer.lastName" id="edit-lastName" />
          <vue-input-text v-bind:label="contactFieldLabel('email')" v-model="data.customer.email" id="edit-email" />
          <vue-input-text v-bind:label="contactFieldLabel('phone1')" v-model="data.customer.phone1" id="edit-phone1" />
          <vue-input-text v-bind:label="contactFieldLabel('phone2')" v-model="data.customer.phone2" id="edit-phone2" />
          <vue-input-text v-bind:label="contactFieldLabel('fax')" v-model="data.customer.fax" id="edit-fax" />
          <vue-input-text v-bind:label="contactFieldLabel('addr1')" v-model="data.customer.addr1" id="edit-addr1" />
          <vue-input-text v-bind:label="contactFieldLabel('addr2')" v-model="data.customer.addr2" id="edit-addr2" />
          <vue-input-text v-bind:label="contactFieldLabel('zipCode')" v-model="data.customer.zipCode" id="edit-zipCode" />
          <vue-input-text v-bind:label="contactFieldLabel('city')" v-model="data.customer.city" id="edit-city" />
          <vue-input-text v-bind:label="contactFieldLabel('region')" v-model="data.customer.region" id="edit-region" />
          <vue-input-text v-bind:label="contactFieldLabel('country')" v-model="data.customer.country" id="edit-country" />
        </fieldset>

			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>
 

<section className="box box-medium" v-if="data.customer.id">
	<header>
		<h2>Purchase History</h2>
		<nav class="navbar">
			<form id="customer-history-filter" onSubmit="javascript:customers_filterHistory();return false;">
				<div className="form-group">
					<label htmlFor="start">From</label>
					<vue-inputdate id="start" v-model="data.start"/>
				</div>
				<div className="form-group">
					<label htmlFor="stop">to</label>
					<vue-inputdate v-model="data.stop"/>
				</div>
				<div className="form-group">
					<input id="consolidate" type="checkbox" v-model="data.consolidate"/>
					<label htmlFor="consolidate">Consolidate over the period</label>
				</div>
				<div className="form-control">
					<button className="btn btn-primary btn-send" type="submit">Search</button>
				</div>
			</form>
		</nav>
	</header>
	<article className="box-body" id="customer-history" v-if="data.customerHistory">
		<vue-table v-bind:table="data.customerHistory"></vue-table>
	</article>
	<article className="box-body" id="customer-history-tickets"
			 style="display:flex;flex-direction:row;align-items:center;justify-content:space-around">
		<vue-tickets-table
			v-bind:tickets="data.tickets"
			v-bind:title="data.ticketsTitle"
			v-bind:cashRegisters="data.cashRegisters"
			v-bind:customers="customersProxy"
			v-bind:taxes="data.taxes"
			v-bind:paymentModes="data.paymentModes"
			v-bind:users="data.users"
		></vue-tickets-table>
	</article>
</section>
<section className="box box-tiny" v-if="data.customer.id">
	<header>
		<h2>Modify Balance</h2>
	</header>
	<article className="box-body">
		<p>
			Warning: Modifying the balance here will result in a discrepancy with the sales history.
			You must be able to justify this operation in your accounting (an invoice, a refund,
			an off-register payment, or any other document).
		</p>
		<form id="edit-customer-balance-form" className="form-tiny"
			  onSubmit="javascript:customers_saveBalance(); return false;">
			<div className="form-group">
				<label htmlFor="old-balance">Old Balance</label>
				<input type="number" id="old-balance" v-model="oldBalance" disabled="true"/>
			</div>
			<vue-input-number
				id="edit-balance"
				label="New Balance"
				v-model="data.customer.balance"
				v-bind:required.boolean="true"
				v-bind:step.number="0.01"
			/>
			<div className="form-control">
				<button className="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>

</div> `,

methods: {
	imageSrc: function (cust) {
		if (cust.hasImage) {
			return login_getHostUrl() + "/api/image/customer/" + cust.id + "?Token=" + login_getToken();
		} else {
			return login_getHostUrl() + "/api/image/customer/default?Token=" + login_getToken();
		}
	}
,
	contactFieldLabel(reference)
	{
		if (this.data.contactFields[reference].value) {
			return this.data.contactFields[reference].value;
		} else {
			return this.data.contactFields[reference].default;
		}
	}
}
,
computed: {
	customersProxy: function () {
		return [this.data.customer];
	}
}
})
;

Vue.component("vue-customer-import", {
	props: ["data"],
	data: function () {
		return {
			csv: null,
			linkedRecords: {
				discountProfile: this.data.discountProfiles,
				tariffArea: this.data.tariffAreas,
				tax: this.data.taxes,
			},
			importResult: null,
			tableColumns: [
				{field: "dispName", label: "Displayed Name"},
				{field: "card", label: "Card"},
				{field: "maxDebt", label: "Max Debt", type: "number"},
				{field: "note", label: "Note"},
				{field: "expireDate", label: "Expiration Date", type: "date"},
				{field: "visible", label: "Active", type: "boolean"},
				{field: "discountProfile", label: "Discount Profile", type: "record", modelName: "discountProfile"},
				{field: "tariffArea", label: "Tariff Zone", type: "record", modelName: "tariffArea"},
				{field: "tax", label: "VAT", type: "record", modelName: "tax"},
				{field: "firstName", label: this.contactFieldLabel("firstName")},
				{field: "lastName", label: this.contactFieldLabel("lastName")},
				{field: "email", label: this.contactFieldLabel("email")},
				{field: "phone1", label: this.contactFieldLabel("phone1")},
				{field: "phone2", label: this.contactFieldLabel("phone2")},
				{field: "fax", label: this.contactFieldLabel("fax")},
				{field: "addr1", label: this.contactFieldLabel("addr1")},
				{field: "addr2", label: this.contactFieldLabel("addr2")},
				{field: "zipCode", label: this.contactFieldLabel("zipCode")},
				{field: "city", label: this.contactFieldLabel("city")},
				{field: "region", label: this.contactFieldLabel("region")},
				{field: "country", label: this.contactFieldLabel("country")},
			]

		};
	},
	template: `<div class="customer-import">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=customers">Customer List</a></li>
				<li><h1>Edit Customer Records via CSV File</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li>
					<label for="csv-file">File</label>
					<input ref="csvRef" type="file" accept="text/csv" id="csv-file" name="csv" v-on:change="readCsv" />
				</li>
			</ul>
		</nav>
	</header>
	<div class="box-body">
		<vue-import-preview
			newTitle="New Records"
			editTitle="Modified Records"
			unchangedTitle="Unchanged Records"
			modelsLabel="Customer Records"
			v-bind:modelDef="data.modelDef"
			v-bind:importResult="importResult"
			v-bind:allRecords="data.customers"
			v-bind:linkedRecords="linkedRecords"
			v-bind:tableColumns="tableColumns"
			v-on:save="saveChanges" />
	</div>
</section>
  </div> `,
methods: {
		readCsv: function (event) {
			let fileName = event.target.files[0].name;
			let thiss = this;
			let reader = new FileReader();
			let callback = function (data) {
				thiss.importResult = data;
			}
			reader.onload = function (readerEvent) {
				let fileContent = readerEvent.target.result;
				_customers_parseCsv(fileContent, callback);
			};
			reader.readAsText(event.target.files[0]);
		},
		saveChanges: function () {
			customers_saveCustomers();
		},
		reset: function () {
			this.csv = null;
			this.$refs.csvRef.value = "";
			this.importResult = null;
		},
		contactFieldLabel(reference) {
			if (this.data.contactFields[reference].value) {
				return this.data.contactFields[reference].value;
			} else {
				return this.data.contactFields[reference].default;
			}
		}
	}
});
Vue.component("vue-zticket-list", {
	props: ["data"],
	template: `<div class="zticket-list">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>List of Z Tickets</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<form id="ztickets-filter" onsubmit="javascript:ztickets_filter();return false;">
				<div class="form-group">
					<label for="start">Opening between</label>
					<vue-inputdate id="start" v-model="data.start" />
				</div>
				<div class="form-group">
					<label for="stop">and</label>
					<vue-inputdate id="stop" v-model="data.stop" />
				</div>
				<div class="form-group">
					<input id="add-zeros" type="checkbox" v-model="data.addZeros" />
					<label for="add-zeros">Show zero amounts</label>
				</div>
				<div class="form-group">
					<input id="include-unused-payments" type="checkbox" v-model="data.includeUnusedPayments" />
					<label for="include-unused-payments">Include unused payment methods</label>
				</div>
				<div class="form-group">
					<input id="include-unused-taxes" type="checkbox" v-model="data.includeUnusedTaxes" />
					<label for="include-unused-taxes">Include unused taxes</label>
				</div>
				<div class="form-group">
					<input id="include-unused-categories" type="checkbox" v-model="data.includeUnusedCategories" />
					<label for="include-unused-categories">Include unused categories</label>
				</div>
				<div class="form-control">
					<button class="btn btn-primary btn-send" type="submit">Search</button>
				</div>
			</form>
		</nav>
	</header>
	<article class="box-body" id="report-content">
		<vue-table v-bind:table="data.table" ref="zTable"></vue-table>
	</article>
</section>
</div>
`});
Vue.component("vue-tickets-list", {
	props: ["data"],
	template: `<div class="tickets-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Tickets</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<form id="tickets-filter" onsubmit="javascript:tickets_search();return false;">
				<div class="form-group">
					<label for="start">From</label>
					<vue-inputdate id="start" v-model="data.start" />
				</div>
				<div class="form-group">
					<label for="stop">To</label>
					<vue-inputdate id="stop" v-model="data.stop" />
				</div>
				<div class="form-group">
					<label for="cashregister">Cash Register</label>
					<select id="filter-cashregister" name="cashregister" v-model="data.cashRegisterId">
						<option v-for="cr in data.cashRegisters" v-bind:value="cr.id">{{cr.label}}</option>
						<option value="">All cash registers</option>
					</select>
				</div>

				<div class="form-control">
					<button class="btn btn-primary btn-send" type="submit">Search</button>
				</div>
			</form>
		</nav>
	</header>
	<article class="box-body" id="report-content">
		<vue-tickets-table 
			v-bind:tickets="data.tickets" 
			v-bind:title="data.tableTitle" 
			v-bind:cashRegisters="data.cashRegisters" 
			v-bind:taxes="data.taxes" 
			v-bind:paymentModes="data.paymentModes" 
			v-bind:customers="data.customers" 
			v-bind:users="data.users">
		</vue-tickets-table>
	</article>
</section>
</div>
`,
});

Vue.component("vue-tickets-table", {
	props: ["cashRegisters", "customers", "taxes", "tickets", "paymentModes", "users", "title"],
	data: function() {
		let table = new Table().reference("ticket-list")
			.column(new TableCol().reference("cashRegister").label("Cash Register").visible(false).help("The name of the cash register."))
			.column(new TableCol().reference("sequence").label("Sequence").type(TABLECOL_TYPE.NUMBER).visible(false).help("The session number of the cash register. The sequence number increases at each cash register closing."))
			.column(new TableCol().reference("number").label("Number").type(TABLECOL_TYPE.NUMBER).visible(true).help("The ticket number from the cash register."))
			.column(new TableCol().reference("date").label("Date").type(TABLECOL_TYPE.DATETIME).visible(true).help("The date of the sale."))
			.column(new TableCol().reference("customer").label("Customer").footerType(TABLECOL_FOOTER.CUSTOM, "Total").visible(false).help("The customer account associated with the ticket."))
			.column(new TableCol().reference("custBalance").label("Customer Balance").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The total variation of the customer's account balance. Positive for prepaid recharges or refunds, negative for expenses or debts."))
			.column(new TableCol().reference("finalPrice").label("Amount excl. tax").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(true).help("The ticket amount excluding tax after discount."))
			.column(new TableCol().reference("finalTaxedPrice").label("Amount incl. tax").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(true).help("The ticket amount including tax after discount."))
			.column(new TableCol().reference("discountRate").label("Discount").type(TABLECOL_TYPE.PERCENT).visible(false).help("The discount applied on the entire ticket (included in TTC, HT and VAT amounts)."))
			.column(new TableCol().reference("discountAmount").label("Discount Amount excl. tax").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The discount value excluding tax."))
			.column(new TableCol().reference("discountTaxedAmount").label("Discount Amount incl. tax").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The discount value including tax."))
			.column(new TableCol().reference("paymentModes").label("Payments").visible(true).help("The payment methods used for the payment."))
			.column(new TableCol().reference("overPerceived").label("Overpaid").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The amount overpaid for payment methods without change given."));

		this.paymentModes.forEach(pm => {
			table.column(new TableCol().reference("pm-" + pm.reference).label(pm.label).type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).class("z-oddcol").help("The amount paid with this payment method during the session."));
		});

		this.taxes.forEach(tax => {
			table.column(new TableCol().reference("tax-" + tax.id + "-base").label(tax.label + " base").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The amount of turnover excluding tax associated with the VAT rate."));
			table.column(new TableCol().reference("tax-" + tax.id + "-amount").label(tax.label + " VAT").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The amount of VAT collected associated with the VAT rate."));
		});

		table
			.column(new TableCol().reference("user").label("Operator").visible(false).help("The user account name who performed the sale."))
			.column(new TableCol().reference("operation").label("Operation").type(TABLECOL_TYPE.HTML).visible(true).exportable(false).help("Select the ticket. This field is never exported."));

		return {
			"selectedTicket": null,
			"table": table,
			"tableRef": "table" + String(Math.random()).replace("0.", "").valueOf(),
		};
	},
	template: `<div>
		<vue-table v-bind:table="table" v-bind:ref="tableRef"></vue-table>
		<div v-if="selectedTicket" class="modal-container" v-on:click="closeModal">
			<div style="display: flex; flex-direction: column; align-items: end; gap: 1rem; overflow: hidden;">
				<button type="button" class="btn btn-misc" v-on:click="closeModal">Close</button>
				<vue-tickets-content v-if="selectedTicket" v-bind:ticket="selectedTicket"
					v-bind:cashRegisters="cashRegisters" v-bind:customers="customers" v-bind:taxes="taxes" v-bind:paymentModes="paymentModes" v-bind:users="users"></vue-tickets-content>
			</div>
		</div>
	</div>`,
	methods: {
		closeModal: function(event) {
			if (event.target == event.currentTarget) {
				this.selectedTicket = null;
			}
		},
		selectTicket: function(index) {
			this.selectedTicket = this.tickets[index];
		}
	},
	watch: {
		tickets: function(newTickets, _oldTickets) {
			let lines = [];
			for (let i = 0; i < newTickets.length; i++) {
				let tkt = newTickets[i];
				let crLbl = "Unknown";
				let cr = this.cashRegisters.find(e => e.id == tkt.cashRegister);
				if (typeof cr != "undefined") {
					crLbl = cr.label;
				}
				let date = new Date(tkt.date * 1000);
				let customerName = "";
				if (tkt.customer != null) {
					let cust = this.customers.find(e => e.id == tkt.customer);
					if (typeof cust != "undefined") {
						customerName = cust.dispName;
					}
				}
				let pmTotal = 0.0;
				let pmModes = [];
				let taxes = [];
				let actualPrice = 0.0; // total of tax bases, to compute the discount amount until it is stored in the ticket
				this.paymentModes.forEach(pm => {
					pmModes.push({id: pm.id, amount: 0.0, label: pm.label});
				});
				this.taxes.forEach(tax => {
					taxes.push({id: tax.id, base: 0.0, amount: 0.0});
				});
				tkt.payments.forEach(payment => {
					pmTotal += payment.amount;
					let pm = pmModes.find((p) => p.id == payment.paymentMode);
					pm.amount += payment.amount;
				});
				tkt.taxes.forEach(tktTax => {
					let tax = taxes.find((t) => t.id == tktTax.tax);
					tax.base += tktTax.base;
					tax.amount += tktTax.amount;
					actualPrice += tax.base;
				});
				// Compute missing data from the raw ticket
				/* Assume B2C mode is used (taxedPrice is set, price is not reliable). */
				let overPerceived = pmTotal - tkt.finalTaxedPrice;
				let discountAmount = actualPrice / (1.0 - tkt.discountRate) - actualPrice;
				discountAmount = Number.parseFloat(discountAmount.toFixed(2));
				let discountTaxedAmount = tkt.taxedPrice - tkt.finalTaxedPrice;
				// List payment modes
				let pmModesStr = "";
				pmModes.forEach(pm => {
					if (pm.amount == 0.0) {
						return;
					}
					pmModesStr += ", " + pm.label;
				});
				pmModesStr = pmModesStr.substring(2);
				// Retrieve username
				let userName = "";
				let user = this.users.find(e => e.id == tkt.user);
				if (typeof user != "undefined") {
					userName = user.name;
				}
				// Fill the table
				line = [crLbl, tkt.sequence, tkt.number, date, customerName, tkt.custBalance, tkt.finalPrice, tkt.finalTaxedPrice, tkt.discountRate, discountAmount, discountTaxedAmount, pmModesStr, overPerceived];
				pmModes.forEach(pm => {
					line.push(pm.amount);
				});
				taxes.forEach(tax => {
					line.push(tax.base);
					line.push(tax.amount);
				});
				line.push(userName);
				// dirty hack with access to the current table in the root element (see mounted/unmounted)
				line.push("<div class=\"btn-group pull-right\" role=\"group\"><button type=\"button\" class=\"btn btn-edit\" onclick=\"javascript:vue['" + this.tableRef + "'].selectTicket(" + i + ");\">Show</button></div>");
				lines.push(line);
			}
			this.table.resetContent(lines);
			this.selectedTicket = null;
		},
		title: function(newTitle, oldTitle) {
			this.table.title(newTitle);
		}
	},
	mounted: function() {
		// Register a link to the table in the root component for dynamic javascript
		let root = this;
		while (("$parent" in root) && (typeof root.$parent != "undefined")) {
			root = root.$parent;
		}
		root[this.tableRef] = this;
	},
	unmounted: function() {
		// Unregister the table from the root component
		let root = this;
		while ("$parent" in root) {
			root = root.$parent;
		}
		delete root[this.tableRef];
	},
});

Vue.component("vue-tickets-content", {
	props: ["cashRegisters", "customers", "taxes", "paymentModes", "users", "ticket"],
	template: `<div class="ticket">
<pre v-if="ticket">
Ticket:    {{ticketView.cashRegister}} - {{ticketView.number}}
Date:      {{ticketView.date}}
Served by: {{ticketView.user}}
<template v-if="ticketView.customer">Customer:  {{ticketView.customer}}</template>

Item       Unit Price  Qty  Total/Tax
------------------------------------
<template v-for="line in ticketView.lines">
{{line.label}}
{{padBefore(line.price, 16)}}{{padBefore("x" + line.quantity, 6)}}{{padBefore(line.taxedPrice, 8)}} {{getTaxCode(line)}}<template v-if="line.discountRate">
* Discount {{padBefore(line.discountRate, 5)}} {{padBefore(line.discountAmount, 17)}}</template></template>
<template v-if="ticketView.discountRate">--------------------------------
Total before discount {{padBefore(ticketView.taxedPrice,13)}}
Discount {{ticketView.discountRate}} {{padBefore(ticketView.discountAmount, 21)}}</template>

VAT                Base      Amount
<template v-for="tax,i in ticketView.taxes">{{padAfter(taxToCode(i) + ". " + tax.label, 12)}}{{padBefore(tax.base, 10)}}{{padBefore(tax.amount,10)}}
</template>
Subtotal {{padBefore(ticketView.finalPrice, 21)}}
VAT      {{padBefore(ticketView.taxSum, 21)}}

<div style="font-weight: bold; transform: scale(1.0, 2.0);">Total    {{padBefore(ticketView.finalTaxedPrice, 21)}}</div>

<template v-for="pm in ticketView.payments"><template v-if="pm.label.length > 20">{{pm.label}}
{{padBefore(pm.amount, 32)}}</template><template v-else>{{padAfter(pm.label, 20)}}{{padBefore(pm.amount, 12)}}
</template>
</template>
</pre>
</div>
`,
	methods: {
		padBefore: function(txt, size) {
			let pad = "";
			for (let i = 0; i < size - txt.length; i++) {
				pad += " ";
			}
			return pad + txt;
		},
		padAfter: function(txt, size) {
			let pad = "";
			for (let i = 0; i < size - txt.length; i++) {
				pad += " ";
			}
			return txt + pad;
		},
		taxToCode: function(i) {
			const codes = "abcdefghijklmnopqrstuvwxyz";
			return i >= 0 && i < codes.length ? codes[i] : "?";
		},
		getTaxCode: function(line) {
			let taxId = line.tax;
			for (let i = 0; i < this.ticketView.taxes.length; i++) {
				if (this.ticketView.taxes[i].tax == taxId) {
					return this.taxToCode(i);
				}
			}
			return "?";
		},
	},
	computed: {
		"ticketView": function() {
			// Get cash register label
			let crLbl = "";
			let cr = this.cashRegisters.find(e => e.id == this.ticket.cashRegister);
			if (typeof cr != "undefined") {
				crLbl = cr.label;
			}
			// Get user's name
			let userName = "";
			let user = this.users.find(e => e.id == this.ticket.user);
			if (typeof user != "undefined") {
				userName = user.name;
			}
			// Get customer's name
			let customerName = null;
			if (this.ticket.customer != null) {
				let cust = this.customers.find(e => e.id == this.ticket.customer);
				if (typeof cust != "undefined") {
					customerName = cust.dispName;
				}
			}
			// Build ticket view object
			let tkt = {
				cashRegister: crLbl,
				number: this.ticket.number,
				date: tools_dateTimeToString(new Date(this.ticket.date * 1000)),
				user: userName,
				customer: customerName,
				lines: [],
				payments: [],
				taxes: [],
				discountRate: (this.ticket.discountRate == 0.0) ? null : ((this.ticket.discountRate*100).toLocaleString() + "%"),
				discountAmount: (this.ticket.finalTaxedPrice - this.ticket.taxedPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }),
				taxedPrice: this.ticket.taxedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }),
				finalPrice: this.ticket.finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }),
				finalTaxedPrice: this.ticket.finalTaxedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }),
				taxSum: (this.ticket.finalTaxedPrice - this.ticket.finalPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }),
			}
			for (let i = 0; i < this.ticket.lines.length; i++) {
				let tktline = this.ticket.lines[i];
				let line = {};
				line.label = tktline.productLabel;
				line.price = tktline.taxedUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 });
				line.quantity = tktline.quantity.toLocaleString();
				line.discountRate = (tktline.discountRate == 0.0) ? null : ((tktline.discountRate*100).toLocaleString() + "%");
				line.discountAmount = (tktline.finalTaxedPrice - tktline.taxedPrice).toLocaleString(undefined, { minimumFractionDigits: 2 });
				line.taxedPrice = tktline.taxedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 });
				line.finalTaxedPrice = tktline.finalTaxedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 });
				tkt.lines.push(line);
			}
			for (let i = 0; i < this.ticket.taxes.length; i++) {
				let tkttax = this.ticket.taxes[i];
				let taxLabel = "";
				let tax = this.taxes.find(e => e.id == tkttax.tax);
				if (typeof tax != "undefined") {
					taxLabel = tax.label;
				}
				let taxView = {
					label: taxLabel,
					base: tkttax.base.toLocaleString(undefined, { minimumFractionDigits: 2 }),
					amount: tkttax.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
				};
				tkt.taxes.push(taxView);
			}
			for (let i = 0; i < this.ticket.payments.length; i++) {
				let tktpm = this.ticket.payments[i];
				let pmLabel = "";
				let pmMode = this.paymentModes.find(e => e.id == tktpm.paymentMode);
				if (typeof pmMode != "undefined") {
					pmLabel = (tktpm.amount >= 0) ? pmMode.label : pmMode.backLabel;
				}
				let pm = {
					label: pmLabel,
					amount: tktpm.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
				};
				tkt.payments.push(pm);
			}
			return tkt;
		},
	},
});
Vue.component("vue-salesbyproduct", {
	props: ["data"],
	template: `<div class="salesbyproduct">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Sales by Product</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
		<form id="tickets-filter" onsubmit="javascript:salesbyproduct_filter();return false;">
			<div class="form-group">
				<label for="start">From</label>
				<vue-inputdate id="start" v-model="data.start" />
			</div>
			<div class="form-group">
				<label for="stop">To</label>
				<vue-inputdate id="stop" v-model="data.stop" />
			</div>
			<div class="form-group">
				<input id="include-archives" type="checkbox" v-model="data.includeArchives" />
				<label for="include-archives">Include products out of catalog</label>
			</div>
			<div class="form-group">
				<input id="include-zero" type="checkbox" v-model="data.includeZero" />
				<label for="include-zero">Include products without sales</label>
			</div>
			<div class="form-group">
				<input id="separate-by-cr" type="checkbox" v-model="data.separateCashRegisters" />
				<label for="separate-by-cr">Detail by cash register</label>
			</div>
			<div class="form-group">
				<input id="separate-by-tax" type="checkbox" v-model="data.separateTaxes" />
				<label for="separate-by-tax">Detail by VAT rate</label>
			</div>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Search</button>
			</div>
		</form>
	</nav>
	</header>
	<article class="box-body" id="report-content">
		<vue-table v-bind:table="data.table" ref="salesTable"></vue-table>
	</article>
</section>
</div>`
});
Vue.component("vue-salesbycategory", {
	props: ["data"],
	template: `<div class="salesbycategory">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Sales by Category</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
		<form id="tickets-filter" onsubmit="javascript:salesbycategory_filter();return false;">
			<div class="form-group">
				<label for="start">From</label>
				<vue-inputdate id="start" v-model="data.start" />
			</div>
			<div class="form-group">
				<label for="stop">To</label>
				<vue-inputdate id="stop" v-model="data.stop" />
			</div>
			<div class="form-group">
				<input id="include-archives" type="checkbox" v-model="data.includeArchives" />
				<label for="include-archives">Include categories out of catalog</label>
			</div>
			<div class="form-group">
				<input id="include-zero" type="checkbox" v-model="data.includeZero" />
				<label for="include-zero">Include categories without sales</label>
			</div>
			<div class="form-group">
				<input id="separate-by-cr" type="checkbox" v-model="data.separateCashRegisters" />
				<label for="separate-by-cr">Detail by cash register</label>
			</div>
			<div class="form-group">
				<input id="separate-by-tax" type="checkbox" v-model="data.separateTaxes" />
				<label for="separate-by-tax">Detail by VAT rate</label>
			</div>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Search</button>
			</div>
		</form>
	</nav>
	</header>
	<article class="box-body" id="report-content">
		<vue-table v-bind:table="data.table"></vue-table>
	</article>
</section>
</div>`
});
Vue.component("vue-salesdetails", {
	props: ["data"],
	template: `<div class="salesdetails">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Sales Details</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<form id="tickets-filter" onsubmit="javascript:salesdetails_filter();return false;">
				<div class="form-group">
					<label for="start">From</label>
					<vue-inputdate id="start" v-model="data.start" />
				</div>
				<div class="form-group">
					<label for="stop">To</label>
					<vue-inputdate id="stop" v-model="data.stop" />
				</div>
				<div class="form-control">
					<button class="btn btn-primary btn-send" type="submit">Search</button>
				</div>
			</form>
		</nav>
	</header>
	<article class="box-body" id="report-content">
		<p class="notice"><strong>Note:</strong> The purchase price and category correspond to the current information on the product record, not those at the time of sale.</p>
		<vue-table v-bind:table="data.table"></vue-table>
	</article>
</section>
</div>`
});
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

Vue.component("vue-paymentmode-list", {
	props: ["data"],
	data: function() {
		return {
			paymentModesTable: new Table().reference("paymentmode-list")
				.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).exportable(false).visible(true).help("The image for the payment mode button. This field cannot be exported."))
				.column(new TableCol().reference("reference").label("Reference").visible(false).help("The reference must be unique for each payment mode."))
				.column(new TableCol().reference("label").label("Name").visible(true).help("The name of the payment mode as shown on the register buttons."))
				.column(new TableCol().reference("visible").label("Active").type(TABLECOL_TYPE.BOOL).visible(true).help("Whether the payment mode can be used for payments."))
				.column(new TableCol().reference("roles").label("Roles").visible(true).help("Roles allowed to use this payment mode."))
				.column(new TableCol().reference("dispOrder").label("Order").type(TABLECOL_TYPE.NUMBER).visible(false).help("Display order."))
				.column(new TableCol().reference("operation").label("Operation").type(TABLECOL_TYPE.HTML).exportable(false).visible(true))
		};
	},
	template: `<div class="paymentmode-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Payment Modes List</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=paymentmode">Add a payment mode</a></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<p class="warning" v-if="data.cashWarning"><strong>Warning:</strong> For the cash drawer opening/closing amounts to work, the payment mode for cash must have the reference <em>cash</em></p>
		<vue-table v-bind:table="paymentModesTable"></vue-table>
	</article>
</section>
</div>`,
	methods: {
		imageSrc: function(pm) {
			if (pm.hasImage) {
				return login_getHostUrl() + "/api/image/paymentmode/" + pm.id + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/paymentmode/default?Token=" + login_getToken();
			}
		},
		editUrl: function(pm) {
			return "?p=paymentmode&id=" + pm.id;
		},
	},
	mounted: function() {
		let thiss = this;
		this.data.paymentModes.forEach(pm => {
			let line = [
				thiss.imageSrc(pm),
				pm.reference, pm.label,
				pm.visible,
				pm.roles.join(", "), pm.dispOrder,
				"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(pm) + "\">Edit</a></div>",
			];
			this.paymentModesTable.line(line);
		});
	},
});

Vue.component("vue-paymentmode-form", {
	props: ["data"],
	template: `<div class="paymentmode-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=paymentmodes">Payment Modes List</a></li>
				<li><h1>Edit a Payment Mode</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-paymentmode-form" class="form-large" onsubmit="javascript:paymentmodes_savePaymentMode(); return false;">
			<fieldset>
				<legend>Payment Mode</legend>
				<div class="form-group">
					<label for="edit-label">Label for payment</label>
					<input id="edit-label" type="text" v-model="data.paymentMode.label" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-backlabel">Label for return</label>
					<input id="edit-backlabel" type="text" v-model="data.paymentMode.backLabel" />
				</div>
				<div class="form-group">
					<label for="edit-image">Image</label>
					<img v-if="data.paymentMode.hasImage" id="paymentmode-image" class="img img-thumbnail" v-bind:src="imageSrc(data.paymentMode)" />
					<input id="edit-image" type="file" accept="image/*" />
					<a v-if="data.hadImage" class="btn btn-del" onclick="javascript:paymentmodes_toggleImage();return false;" >{{data.deleteImageButton}}</a>
				</div>
				<div class="form-group">
					<label for="edit-reference">Reference</label>
					<input id="edit-reference" type="text" v-model="data.paymentMode.reference" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-dispOrder">Order</label>
					<input id="edit-dispOrder" type="number" v-model.number="data.paymentMode.dispOrder">
				</div>
				<div class="form-group">
					<label for="edit-type">Type</label>
					<select id="edit-type" v-model="data.paymentMode.type">
						<option value="0">Standard</option>
						<option value="1">Requires assignment to a registered customer</option>
						<option value="3">Registers a customer debt</option>
						<option value="5">Uses pre-paid balance</option>
					</select>
				</div>
				<div class="form-group">
					<input id="edit-visible" type="checkbox" name="visible" v-model="data.paymentMode.visible">
					<label for="edit-visible">Active</label>
				</div>
			</fieldset>
			<fieldset>
				<legend>Denominations</legend>
				<table>
					<thead>
						<tr><th></th><th>Value</th><th></th></tr>
					</thead>
					<tbody>
						<tr v-for="(value, index) in data.paymentMode.values">
							<td>
								<img v-if="value.hasImage" v-bind:id="'value-image-' + index" class="thumbnail thumbnail-text" v-bind:src="imageValueSrc(data.paymentMode, value)" />
								<input v-bind:id="'edit-value-image-' + value.value" type="file" accept="image/*" />
								<a v-if="data.hadValueImage[value.value]" class="btn btn-del" v-on:click="toggleValueImage(value);return false;" >{{data.deleteValueImageButton[value.value]}}</a>
							</td>
							<td><input type="number" v-model="value.value" step="0.01" /></td>
							<td><button type="button" class="btn btn-delete" v-on:click="deleteValue(index)">X</button></td>
						</tr>
					</tbody>
				</table>
				<div class="form-control">
					<nav><button class="btn btn-add" type="button" v-on:click="addValue">Add a value</button></nav>
				</div>
			</fieldset>
			<fieldset>
				<legend>Change Returns</legend>
				<table>
					<thead>
						<tr><th>Min. excess</th><th>Return mode</th><th></th></tr>
					</thead>
					<tbody>
						<tr v-for="(ret, index) in data.paymentMode.returns">
							<td><input type="number" v-model="ret.minAmount" step="0.01" /></td>
							<td><select v-model="ret.returnMode" required="true">
								<option disabled value="">Select</option>
								<!-- if payment mode doesn't exist yet -->
								<option v-if="!data.paymentMode.id" v-bind:value.int="-1">{{currentModeLabel()}}</option>
								<option v-for="pm in data.paymentModes" :key="pm.id" v-bind:value="pm.id">{{pm.label}}</option>
							</select></td>
							<td><button type="button" class="btn btn-delete" v-on:click="deleteReturn(index)">X</button></td>
						</tr>
					</tbody>
				</table>
				<div class="form-control">
					<nav><button class="btn btn-add" type="button" v-on:click="addReturn">Add a return</button></nav>
				</div>
			</fieldset>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
		imageSrc: function(pm) {
			return srvcall_imageUrl("paymentmode", pm);
		},
		imageValueSrc: function(pm, pmValue) {
			if (pmValue.hasImage) {
				return login_getHostUrl() + "/api/image/paymentmodevalue/" + pm.id + "-" + pmValue.value + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/paymentmodevalue/default?Token=" + login_getToken();
			}
		},
		toggleValueImage: function(value) {
			paymentmodes_toggleValueImage(value);
			return false;
		},
		addValue(event) {
			let val = PaymentModeValue_default(this.data.paymentMode);
			this.data.paymentMode.values.push(val);
		},
		addReturn(event) {
			let ret = PaymentModeReturn_default(this.data.paymentMode);
			this.data.paymentMode.returns.push(ret);
		},
		deleteValue: function(index) {
			paymentmodes_removeValue(index);
		},
		deleteReturn: function(index) {
			paymentmodes_removeReturn(index);
		},
		currentModeLabel: function() {
			if (this.data.paymentMode.label) {
				return this.data.paymentMode.label;
			} else {
				return "Same payment mode";
			}
		}
	}
});
Vue.component("vue-user-list", {
	props: ["data"],
	data: function() {
		return {
			userTable: new Table().reference("user-list")
				.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).exportable(false))
				.column(new TableCol().reference("name").label("Name"))
				.column(new TableCol().reference("role").label("Role"))
				.column(new TableCol().reference("card").label("Card"))
				.column(new TableCol().reference("operation").label("Operation").type(TABLECOL_TYPE.HTML).exportable(false))
		};
	},
	template: `<div class="user-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>User List</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=user">Add a User</a></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<vue-table v-bind:table="userTable"></vue-table>
	</article>
</section>
</div>`,
	methods: {
		imageSrc: function(user) {
			return srvcall_imageUrl("user", user);
		},
		editUrl: function(user) {
			return "?p=user&id=" + user.id;
		},
	},
	mounted: function() {
		this.data.users.forEach(u => {
			this.userTable.line([
				this.imageSrc(u), u.name, this.data.roles[u.role].name, u.card,
				`<nav><a class="btn btn-edit" href="${this.editUrl(u)}">Edit</a></nav>`
			]);
		});
	}
});

Vue.component("vue-user-form", {
	props: ["data"],
	data: function() { return {"passwordFieldType": "password"}; },
	template: `<div class="user-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=users">User List</a></li>
				<li><h1>Edit a User</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-category-form" class="form-large" onsubmit="javascript:user_saveUser(); return false;">
			<div class="form-group">
				<label for="edit-name">Name</label>
				<input id="edit-name" type="text" v-model="data.user.name" required="true" />
			</div>
			<div class="form-group">
				<label for="edit-image">Image</label>
				<img v-if="data.user.hasImage" id="user-image" class="img img-thumbnail" v-bind:src="imageSrc(data.user)" />
				<input id="edit-image" type="file" accept="image/*" />
				<a v-if="data.hadImage" class="btn btn-del" onclick="javascript:user_toggleImage();return false;" >{{data.deleteImageButton}}</a>
			</div>
			<div class="form-group">
				<label for="edit-role">Role</label>
				<select id="edit-role" v-model="data.user.role">
					<option disabled value="">Select</option>
					<option v-for="role in data.roles" :key="role.id" v-bind:value="role.id">{{role.name}}</option>
				</select>
			</div>
			<div class="form-group">
				<label for="edit-card">Card</label>
				<input id="edit-card" type="text" v-model="data.user.card" />
			</div>
			<div class="form-group" v-if="!data.user.id">
				<label for="edit-password">Password</label>
				<input id="edit-password" :type="passwordFieldType" v-model="data.user.password" />
				<button class="btn" type="button" v-on:click="togglePasswordVisibility">Show/Hide</button>
			</div>
			<div class="form-group">
				<input class="form-control" id="edit-active" type="checkbox" v-model="data.user.active">
				<label for="edit-dispOrder">Active</label>
			</div>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>

<section class="box box-tiny" v-if="data.user.id">
	<header>
		<h2>Reset Password</h2>
	</header>
	<article class="box-body">
		<form id="edit-reset-user-password" class="form-tiny" onsubmit="javascript:users_updatePassword(); return false;">
			<div class="form-group">
				<label for="edit-reset-password">New Password</label>
				<input :type="passwordFieldType" id="edit-reset-password" />
				<button class="btn" type="button" v-on:click="togglePasswordVisibility">Show/Hide</button>
			</div>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
		imageSrc: function(user) {
			if (user.hasImage) {
				return login_getHostUrl() + "/api/image/user/" + user.id + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/user/default?Token=" + login_getToken();
			}
		},
		togglePasswordVisibility() {
			this.passwordFieldType = (this.passwordFieldType === "password") ? "text" : "password";
			return false;
		},
	}
});
Vue.component("vue-role-list", {
	props: ["data"],
	data: function() {
		return {
			rolesTable: new Table().reference("role-list")
				.column(new TableCol().reference("name").label("Name"))
				.column(new TableCol().reference("operation").label("Action").type(TABLECOL_TYPE.HTML).exportable(false))
		};
	},
	template: `<div class="role-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Role List</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<a class="btn btn-add" href="?p=role">Add a Role</a>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<vue-table v-bind:table="rolesTable"></vue-table>
	</article>
</section>
</div>`,
	methods: {
		editUrl: function(role) {
			return "?p=role&id=" + role.id;
		},
	},
	mounted: function() {
		this.data.roles.forEach(r => {
			this.rolesTable.line([r.name, `<a class="btn btn-edit" href="${this.editUrl(r)}">Edit</a>`]);
		});
	}
});

Vue.component("vue-role-form", {
	props: ["data"],
	template: `<div class="role-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=roles">Role List</a></li>
				<li><h1>Edit a Role</h1></li>
			</ul>
		</nav>
	</header>	
	<article class="box-body">
		<form id="edit-category-form" class="form-large form-mosaic" onsubmit="javascript:role_saveRole(); return false;">
			<fieldset class="form-tiny">
				<legend>Display</legend>
				<div class="form-group">
					<label for="edit-label">Name</label>
					<input id="edit-name" type="text" v-model="data.role.name" required="true" />
				</div>
			</fieldset>
			<fieldset class="form-tiny">
				<legend>Cash Sessions</legend>
				<div class="form-group" v-for="sessPerm in data.permissions.session">
					<input v-bind:id="'edit-session-' + sessPerm.value" type="checkbox" v-bind:value="sessPerm.value" v-model="data.role.permissions" />
					<label v-bind:for="'edit-session-' + sessPerm.value">{{sessPerm.name}}</label>
				</div>
			</fieldset>
			<fieldset class="form-tiny">
				<legend>Sales</legend>
				<div class="form-group" v-for="ticketsPerm in data.permissions.tickets">
					<input v-bind:id="'edit-ticket-' + ticketsPerm.value" type="checkbox" v-bind:value="ticketsPerm.value" v-model="data.role.permissions" />
					<label v-bind:for="'edit-ticket-' + ticketsPerm.value">{{ticketsPerm.name}}</label>
				</div>
			</fieldset>
			<fieldset class="form-tiny">
				<legend>Payment Methods</legend>
				<div class="form-group" v-for="pm in data.paymentModes">
					<input v-bind:id="'edit-pm-' + pm.reference" type="checkbox" v-bind:value="'payment.' + pm.reference" v-model="data.role.permissions" />
					<label v-bind:for="'edit-pm-' + pm.reference">{{pm.label}}</label>
				</div>
			</fieldset>
			<fieldset class="form-tiny">
				<legend>Miscellaneous</legend>
				<div class="form-group" v-for="miscPerm in data.permissions.misc">
					<input v-bind:id="'edit-ticket-' + miscPerm.value" type="checkbox" v-bind:value="miscPerm.value" v-model="data.role.permissions" />
					<label v-bind:for="'edit-ticket-' + miscPerm.value">{{miscPerm.name}}</label>
				</div>
			</fieldset>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
	}
});
Vue.component("vue-cashregister-list", {
	props: ["data"],
	data: function () {
		return {
			crTable: new Table().reference("cashregisters-list")
				.column(new TableCol().reference("reference").label("Reference"))
				.column(new TableCol().reference("label").label("Label"))
				.column(new TableCol().exportable(false).label("Action").type(TABLECOL_TYPE.HTML))
		};
	},
	template: `<div class="cashregister-list">
<section class="box box-medium">
  <header>
    <nav class="browser">
      <ul>
        <li><a href="?p=home">Home</a></li>
        <li><h1>Cash Register List</h1></li>
      </ul>
    </nav>
    <nav class="navbar">
      <ul>
        <li><a class="btn btn-add" href="?p=cashregister">Add a Cash Register</a></li>
      </ul>
    </nav>
  </header>
  <article class="box-body">
    <vue-table v-bind:table="crTable" />
  </article>
</section>
</div>`,
	methods: {
		editUrl: function (cr) {
			return "?p=cashregister&id=" + cr.id;
		},
	},
	mounted: function () {
		for (let i = 0; i < this.data.cashRegisters.length; i++) {
			let cr = this.data.cashRegisters[i];
			this.crTable.line([
				cr.reference,
				cr.label,
				`<div class="btn-group pull-right" role="group"><a class="btn btn-edit" href="${this.editUrl(cr)}">Edit</a></div>`
			]);
		}
	}
});

Vue.component("vue-cashregister-form", {
	props: ["data"],
	template: `<div class="cashregister-form">
<section class="box box-medium">
  <header>
    <nav class="browser">
      <ul>
        <li><a href="?p=home">Home</a></li>
        <li><a href="?p=cashregisters">Cash Register List</a></li>
        <li><h1>Edit a Cash Register</h1></li>
      </ul>
    </nav>
  </header>
  <article class="box-body">
    <form id="edit-category-form" class="form-large" onsubmit="javascript:cashregister_saveCashRegister(); return false;">
      <vue-input-text label="Reference" v-model="data.cashRegister.reference" :required="true" id="edit-reference" />
      <vue-input-text label="Label" v-model="data.cashRegister.label" :required="true" id="edit-label" />
      <div class="form-control">
        <button class="btn btn-primary btn-send" type="submit">Save</button>
      </div>
    </form>
  </article>
</section>
</div>`,
	methods: {}
});
Vue.component("vue-resources-list", {
	props: ["data"],
	template: `<div class="resource-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Customization</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<table>
			<col />
			<col style="width:10%; min-width: 5em;" />
			<thead>
				<tr>
					<th>Name</th>
					<th>Action</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="resource in data.resources">
					<td>{{resource.dispName}}</td>
					<td><nav><a class="btn btn-edit" v-bind:href="editUrl(resource)">Edit</a></nav></td>
				</tr>
				<tr>
					<td>Customer Contact Details</td>
					<td><nav><a class="btn btn-edit" href="?p=resource&label=option.customer.customFields">Edit</a></nav></td>
				</tr>
			</tbody>
		</table>
		<p>To allow your receipts to serve as invoices, the following information must be added in the header or footer of the receipt: (see <a href="https://www.service-public.fr/professionnels-entreprises/vosdroits/F31808" target="_blank">service-public.fr</a>)</p>
		<ul>
			<li>Company name and Siren or Siret number, RCS or RM registration number (if available), legal form and capital amount,</li>
			<li>Registered office address and establishment name,</li>
			<li>Also remember to assign a customer account for identification;</li>
		</ul>
	</article>
</section>
</div>`,
	methods: {
		editUrl: function(res) {
			return "?p=resource&label=" + res.label;
		},
	}
});

Vue.component("vue-resource-form", {
	props: ["data"],
	template: `<div class="resource-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=resources">Customization</a></li>
				<li><h1>{{data.resource.dispName}}</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-resource-form" class="form-tiny" onsubmit="javascript:resources_saveResource(); return false;">
			<div class="form-group">
				<label for="edit-reference" style="display:none">Value</label>
				<textarea v-if="data.resource.type == data.resTypes.Resource_TYPE_TEXT" style="font-family:monospace; width:auto !important" id="edit-textarea" v-bind:cols="data.resource.textWidth" rows="7" v-model="data.resource.content"></textarea>
				<template v-else>
					<img v-if="data.hasImage" id="resource-image" class="img img-thumbnail" v-bind:src="imageData(data.resource)" />
					<input id="edit-image" type="file" accept="image/*" />
					<a v-if="data.hadImage" class="btn btn-del" onclick="javascript:resources_toggleImage();return false;">{{data.deleteContentButton}}</a>
				</template>
			</div>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
		imageData: function(res) {
			if (res.content != null) {
				return "data:;base64," + res.content;
			} else {
				return "";
			}
		}
	}
});

Vue.component("vue-customercontact", {
	props: ["data"],
	data: function() {
		return {
			fields: []
		};
	},
	template: `<div class="preferences">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=resources">Customization</a></li>
				<li><h1>Customer Account Contact Details</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-preferences-form" class="form-large" v-on:submit.prevent="save()">
			<p>Customize the labels of customer contact fields to reuse them for other purposes.</p>
			<div class="form-group" v-for="f in fields">
				<vue-input-text v-bind:id="f.label" v-bind:label="f.default" v-model="f.value" v-bind:placeholder="f.default"></vue-input-text>
			</div>

			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
		save: function() {
			let customFields = {};
			this.fields.forEach(f => {
				if (f.value != "" && f.value != f.default) {
					customFields[f.label] = f.value;
				}
			});
			let newOption = new Option(OPTION_CUSTOMER_FIELDS, JSON.stringify(customFields));
			resources_saveCustomFields(newOption);
		}
	},
	mounted: function() {
		let thiss = this;
		this.data.contactFields.forEach(f => {
			thiss.fields.push(f);
		});
	},
});
Vue.component("vue-discountprofile-list", {
	props: ["data"],
	data: function() {
		return {
			dpTable: new Table().reference("discountProfile-list")
				.column(new TableCol().reference("label").label("Name").visible(true).searchable(true).help("The name of the discount profile as shown on the POS buttons."))
				.column(new TableCol().reference("rate").label("Discount").type(TABLECOL_TYPE.PERCENT).visible(true).help("The discount applied."))
				.column(new TableCol().reference("operation").label("Operation").type(TABLECOL_TYPE.HTML).exportable(false).visible(true))
		};
	},
	template: `
<div class="discountprofile-list">
	<section class="box box-medium">
		<header>
			<nav class="browser">
				<ul>
					<li><a href="?p=home">Home</a></li>
					<li><h1>Discount Profile List</h1></li>
				</ul>
			</nav>
			<nav class="navbar">
				<ul>
					<li><a class="btn btn-add" href="?p=discountprofile">Add a Discount Profile</a></li>
					<li><a class="btn btn-add" href="?p=discountprofileImport">Import a File</a></li>
				</ul>
			</nav>
		</header>
		<article class="box-body">
			<vue-table v-bind:table="dpTable"></vue-table>
		</article>
	</section>
</div> `,

methods: {
		editUrl: function(profile) {
			return "?p=discountprofile&id=" + profile.id;
		},
	},
	mounted: function() {
		let thiss = this;
		this.data.discountProfiles.forEach(function(dp) {
			let line = [
				dp.label, dp.rate,
				"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + thiss.editUrl(dp) + "\">Edit</a></div>"
			];
			thiss.dpTable.line(line);
		})
	},
});

Vue.component("vue-discountprofile-form", {
	props: ["data"],
	template: `<div class="discountprofile-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=discountprofiles">Discount Profile List</a></li>
				<li><h1>Edit a Discount Profile</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-discountprofile-form" class="form-large" onsubmit="javascript:discountprofile_saveProfile(); return false;">
			<vue-input-text label="Label" v-model="data.discountProfile.label" v-bind:required="true" id="edit-label" />
			<vue-input-rate label="Discount" v-model.number="data.discountProfile.rate" id="edit-rate" />
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>
</div>`
});

Vue.component("vue-discountprofile-import", {
	props: ["data"],
	data: function() {
		return {
			csv: null,
			linkedRecords: { },
			importResult: null,
			tableColumns: [
				{field: "label", label: "Label"},
				{field: "rate", label: "Discount", type: "rate"},
			]
		};
	},
	template: `<div class="discountprofile-import">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=discountprofiles">Profile List</a></li>
				<li><h1>Edit Discount Profiles via CSV File</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li>
					<label for="csv-file">File</label>
					<input ref="csvRef" type="file" accept="text/csv" id="csv-file" name="csv" v-on:change="readCsv" />
				</li>
			</ul>
		</nav>
	</header>
	<div class="box-body">
		<vue-import-preview newTitle="New Profiles" editTitle="Modified Profiles" unchangedTitle="Unchanged Profiles" modelsLabel="profiles"
			v-bind:modelDef="data.modelDef"
			v-bind:importResult="importResult"
			v-bind:linkedRecords="linkedRecords"
			v-bind:tableColumns="tableColumns"
			v-on:save="saveChanges" />
	</div>
</section>
</div>`,
	methods: {
		readCsv: function (event) {
			let fileName = event.target.files[0].name;
			let thiss = this;
			let reader = new FileReader();
			let callback = function(data) {
				thiss.importResult = data;
			}
			reader.onload = function(readerEvent) {
				let fileContent = readerEvent.target.result;
				_discountprofiles_parseCsv(fileContent, callback);
			};
			reader.readAsText(event.target.files[0]);
		},
		saveChanges: function() {
			discountprofiles_saveDiscountProfiles();
		},
		reset: function() {
			this.csv = null;
			this.$refs.csvRef.value = "";
			this.importResult = null;
		},
	}
});
Vue.component("vue-currency-list", {
	props: ["data"],
	data: function() {
		return {
			currenciesTable: new Table().reference("currency-list")
				.column(new TableCol().reference("reference").label("Reference").visible(false).searchable(true).help("The reference must be unique for each currency. It allows editing during import."))
				.column(new TableCol().reference("label").label("Name").visible(true).searchable(true).help("The currency name as displayed on the POS buttons."))
				.column(new TableCol().reference("main").label("Main").type(TABLECOL_TYPE.BOOL).visible(false).help("If this currency is the default currency, reference currency for amounts."))
				.column(new TableCol().reference("rate").label("Rate").type(TABLECOL_TYPE.NUMBER).visible(true).help("Exchange rate to the main currency."))
				.column(new TableCol().reference("symbol").label("Symbol").visible(false).searchable(true).help("The currency symbol."))
				.column(new TableCol().reference("decimalSeparator").label("Decimal Sep.").visible(false).help("The separator between whole numbers and decimals (often , or .)"))
				.column(new TableCol().reference("thousandsSeparator").label("Thousands Sep.").visible(false).help("The separator between thousands (often empty or space)."))
				.column(new TableCol().reference("format").label("Format").visible(false).help("The display format for values."))
				.column(new TableCol().reference("visible").label("Active").type(TABLECOL_TYPE.BOOL).visible(true).help("Whether the currency is usable or not."))
				.column(new TableCol().reference("operation").label("Operation").type(TABLECOL_TYPE.HTML).exportable(false).visible(true))
		};
	},
	template: `<div class="currency-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Currency List</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=currency">Add a Currency</a></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<vue-table v-bind:table="currenciesTable"></vue-table>
	</article>
</section>
</div>`,
	methods: {
		editUrl: function(curr) {
			return "?p=currency&id=" + curr.id;
		},
	},
	mounted: function() {
		for (let i = 0; i < this.data.currencies.length; i++) {
			let curr = this.data.currencies[i];
			let line = [
				curr.reference, curr.label,
				curr.main, curr.rate,
				curr.symbol, curr.decimalSeparator, curr.thousandsSeparator,
				curr.format, curr.visible,
				"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(curr) + "\">Edit</a></div>",
			];
			this.currenciesTable.line(line);
		}
	}
});

Vue.component("vue-currency-form", {
	props: ["data"],
	data: function() {
		return {mainCurrencyLbl: "", sample: ""};
	},
	template: `<div class="currency-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=currencies">Currency List</a></li>
				<li><h1>Edit a Currency</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-currency-form" class="form-large" onsubmit="javascript:currency_saveCurrency(); return false;">
			<fieldset>
				<legend>Description</legend>
				<div class="form-group">
					<label for="edit-label">Name</label>
					<input id="edit-label" type="text" v-model="data.currency.label" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-reference">Reference</label>
					<input id="edit-reference" type="text" v-model="data.currency.reference" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-dispOrder">Exchange Rate</label>
					<span>1 {{data.currency.label}} = </span>
					<input id="edit-dispOrder" type="number" v-model.number="data.currency.rate" min="0.00" step="0.01">
					<span> {{mainCurrencyLbl}}</span>
				</div>
				<div class="form-group">
					<input id="edit-main" type="checkbox" name="main" v-model="data.currency.main" v-bind:disabled="data.wasMain" />
					<label for="edit-main">Main Currency</label>
				</div>
				<div class="form-group">
					<input id="edit-visible" type="checkbox" name="main" v-model="data.currency.visible">
					<label for="edit-visible">Active</label>
				</div>
			</fieldset>
			<fieldset>
				<legend>Format</legend>
				<div class="form-group">
					<label for="edit-symbole">Currency Symbol</label>
					<input id="edit-symbol" type="text" v-model="data.currency.symbol" />
				</div>
				<div class="form-group">
					<label for="edit-decimal">Decimal Separator</label>
					<input id="edit-decimal" type="text" v-model="data.currency.decimalSeparator" />
				</div>
				<div class="form-group">
					<label for="edit-thousand">Thousands Separator</label>
					<input id="edit-thousand" type="text" v-model="data.currency.thousandsSeparator" />
				</div>
				<div class="form-group">
					<label for="edit-format">Format</label>
					<input id="edit-format" type="text" v-model="data.currency.format" />
				</div>
				<div>The format is a technical field. The current format is #,##0.00$ (2 decimals, currency symbol at the end, digits grouped by 3).
				</div>
			</fieldset>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
		imageSrc: function(cat) {
			if (cat.hasImage) {
				return login_getHostUrl() + "/api/image/category/" + cat.id + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/category/default?Token=" + login_getToken();
			}
		}
	},
	mounted: function() {
		for (let i = 0; i < this.data.currencies.length; i++) {
			if (this.data.currencies[i].main) {
				this.mainCurrencyLbl = this.data.currencies[i].label;
				break;
			}
		}
	}
});
Vue.component("vue-producttags-form", {
	props: ["data"],
	data: function() {
		return {"null": null, "productCache": []};
	},
	template: `<div class="tariffarea-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Editing a Label Sheet</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-category-form" class="form-large" onsubmit="javascript:producttags_generatePdf(); return false;">
			<div class="form-group">
				<label for="edit-format">Paper Format</label>
				<select v-model="data.format">
					<option v-for="format, index in data.formats" :key="format.dispName" v-bind:value="index">{{format.dispName}}</option>
				</select>
			</div>
			<div class="form-group">
				<label for="edit-label">Start at Label</label>
				<input id="edit-label" type="number" v-model="data.startFrom" required="true" min="1" step="1" />
			</div>
			<div class="form-group">
				<label for="edit-reference">Vertical Margin</label>
				<input id="edit-reference" type="number" v-model="data.marginV" />
			</div>
			<div class="form-group">
				<label for="edit-dispOrder">Horizontal Margin</label>
				<input id="edit-dispOrder" type="number" v-model.number="data.marginH">
			</div>

			<h2>Products</h2>
			<vue-catalog-picker v-bind:categories="data.categories" v-bind:prdPickCallback="pickProduct" />

			<table>
				<col />
				<col style="width:10%; min-width: 5em;" />
				<col style="width:10%; min-width: 5em;" />
				<thead>
					<tr>
						<th>Label</th>
						<th>Quantity</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="tag in data.tags">
						<td><img class="thumbnail thumbnail-text" v-bind:src="imageSrc(tag.product)" />{{tag.product.label}}</td>
						<td><input type="number" v-model.number="tag.quantity" min="1" step="1" /></td>
						<td><button type="button" class="btn btn-delete" v-on:click="deleteTag(tag.product.id)">X</button></td>
					</tr>
				</tbody>
			</table>

			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Generate Sheet</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
		imageSrc: function(prd) {
			return srvcall_imageUrl("product", prd);
		},
		pickProduct: function(product) {
			producttags_addTag(product);
		},
		deleteTag: function(productId) {
			producttags_delTag(productId);
		}
	},
});
Vue.component("vue-tax-list", {
	props: ["data"],
	data: function() {
		return {
			taxesTable: new Table().reference("tax-list")
				.column(new TableCol().reference("label").label("Name").visible(true).help("The name of the tax."))
				.column(new TableCol().reference("rate").label("Rate").type(TABLECOL_TYPE.PERCENT).visible(false).help("The applied rate."))
				.column(new TableCol().reference("operation").label("Operation").type(TABLECOL_TYPE.HTML).exportable(false).visible(true))
		};
	},
	template: `<div class="tax-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>List of VAT Rates</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=tax">Add a Rate</a></li>
			</ul>
		</nav>
	</header>
	<div class="box-body">
		<vue-table v-bind:table="taxesTable"></vue-table>
	</div>
</section>
</div>`,
	methods: {
		editUrl: function(tax) {
			return "?p=tax&id=" + tax.id;
		},
	},
	mounted: function() {
		for (let i = 0; i < this.data.taxes.length; i++) {
			let tax = this.data.taxes[i];
			let line = [
				tax.label,
				tax.rate,
				"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(tax) + "\">Edit</a></div>"
			];
			this.taxesTable.line(line);
		}
	}
});

Vue.component("vue-tax-form", {
	props: ["data"],
	template: `<div class="tax-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=taxes">List of Taxes</a></li>
				<li><h1>Edit a Tax</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-category-form" class="form-large" onsubmit="javascript:taxes_saveTax(); return false;">
			<vue-input-text label="Name" v-model="data.tax.label" v-bind:required="true" id="edit-label" />
			<vue-input-rate label="Rate" v-model.number="data.tax.rate" id="edit-rate" />
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>
</div>`
});
Vue.component("vue-preferences", {
	props: ["data"],
	template: `<div class="preferences">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Preferences</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-preferences-form" class="form-large" onsubmit="javascript:preferences_save(); return false;">
			<fieldset>
				<legend>Font</legend>
				<div class="form-group">
					<input id="font-system" type="radio" name="font" value="system" v-model="data.font" v-on:change="updateFont()" />
					<label for="font-system" class="no-font">Disable font</label>
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
				<label for="tablePageSize">Number of rows per table page</label>
				<select v-model.number="data.tablePageSize" id="tablePageSize">
					<option value="50">50</option>
					<option value="100">100</option>
					<option value="250">250</option>
					<option value="500">500</option>
					<option value="-1">All</option>
				</select>
			</div>

			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
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
Vue.component("vue-accounting-z", {
	props: ["data"],
	template: `<div class="accounting-z">
<section class="box box-medium">
  <header>
    <nav class="browser">
      <ul>
        <li><a href="?p=home">Home</a></li>
        <li><h1>Accounting Entries for Z Tickets</h1></li>
      </ul>
    </nav>
    <nav class="navbar">
      <form id="ztickets-filter" onsubmit="javascript:accounting_ztickets_filter();return false;">
        <div class="form-group">
          <label for="start">Open between</label>
          <vue-inputdate id="start" v-model="data.start" />
        </div>
        <div class="form-group">
          <label for="stop">and</label>
          <vue-inputdate id="stop" v-model="data.stop" />
        </div>
        <div class="form-control">
          <button class="btn btn-primary btn-send" type="submit">Search</button>
        </div>
      </form>
    </nav>
  </header>
  <article class="box-body">
    <p class="warning">This screen allows you to export your Z tickets as accounting entries to simplify import into third-party accounting software. This table cannot directly replace a cash journal.</p>
    <template v-if="hasMissing()">
      <p>The account number for the following lines is not configured:</p>
      <ul v-for="miss in missingList" :key="miss">
        <li>{{ miss }}</li>
      </ul>
    </template>
    <vue-table v-bind:table="data.table" ref="table"></vue-table>
  </article>
</section>
</div>
`,
	computed: {
		missingList: function () {
			let missList = [];
			let self = this;
			Object.keys(this.data.missing.sales).forEach(function (miss) {
				missList.push("Sales " + self.data.missing.sales[miss]);
			});
			Object.keys(this.data.missing.taxes).forEach(function (miss) {
				missList.push("Collected VAT " + self.data.missing.taxes[miss]);
			});
			Object.keys(this.data.missing.paymentModes).forEach(function (miss) {
				missList.push("Receipts " + self.data.missing.paymentModes[miss]);
			});
			Object.keys(this.data.missing.customers).forEach(function (miss) {
				missList.push("Customer balance " + self.data.missing.customers[miss]);
			});
			Object.keys(this.data.missing.extra).forEach(function (miss) {
				missList.push(self.data.missing.extra[miss]);
			});
			return missList;
		},
	},
	methods: {
		hasMissing: function () {
			return this.missingList.length > 0;
		},
	},
});

Vue.component("vue-accounting-config", {
	props: ["data"],
	template: `<div class="accounting-config">
<section class="box box-large">
  <header>
    <nav class="browser">
      <ul>
        <li><a href="?p=home">Home</a></li>
        <li><h1>Accounting Configuration</h1></li>
      </ul>
    </nav>
  </header>
  <article class="box-body">
    <form id="edit-accounting-form" class="form-large" onsubmit="javascript:accounting_saveConfig(); return false;">
      <fieldset>
        <legend>Sales</legend>
        <template v-for="t in data.taxes" :key="t.id">
          <vue-input-text :label="sales_label(t)" v-model="data.values.sales[t.id]" :id="'edit-sales-' + t.id" placeholder="70XXX" />
        </template>
        <vue-input-text label="Exceptional income" v-model="data.values.extra.extraCredit" id="extraCredit" placeholder="7788X" />
        <vue-input-text label="Exceptional loss" v-model="data.values.extra.extraDebit" id="extraDebit" placeholder="6788X" />
      </fieldset>
      <fieldset>
        <legend>Collected VAT</legend>
        <template v-for="t in data.taxes" :key="t.id">
          <vue-input-text :label="taxes_label(t)" v-model="data.values.taxes[t.id]" :id="'edit-tax-' + t.id" placeholder="44571XX" />
        </template>
      </fieldset>
      <fieldset>
        <legend>Receipts</legend>
        <template v-for="p in data.paymentModes" :key="p.id">
          <vue-input-text :label="pm_label(p)" v-model="data.values.paymentModes[p.id]" :id="'edit-pm-' + p.id" placeholder="5XXXXX" />
        </template>
      </fieldset>
      <fieldset>
        <legend>Customer balance</legend>
        <template v-for="c in data.customers" :key="c.id">
          <vue-input-text :label="cust_label(c)" v-model="data.values.customers[c.id]" :id="'edit-cust-' + c.id" placeholder="4111XXX" />
        </template>
      </fieldset>
      <div class="form-control">
        <button class="btn btn-primary btn-send" type="submit">Save</button>
      </div>
    </form>
  </article>
</section>
</div>`,
	methods: {
		sales_label: function (tax) {
			return "Sales " + tax.label;
		},
		taxes_label: function (tax) {
			return "Collected VAT " + tax.label;
		},
		pm_label: function (pm) {
			return "Receipts " + pm.label;
		},
		cust_label: function (cust) {
			return "Customer balance " + cust.dispName;
		},
	},
});
