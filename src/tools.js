
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

/** Convert a Date object to a DD/MM/YYYY string. */
var tools_dateToString = function(dateTime) {
	let day = dateTime.getDate();
	let month = dateTime.getMonth() + 1;
	let year = dateTime.getFullYear();
	if (day < 10) {
		day = "0" + day;
	}
	if (month < 10) {
		month = "0" + month;
	}
	return day + "/" + month + "/" + year;
}
var tools_dateToDataString = function(dateTime) {
	return dateTime.getFullYear() + "-" + (dateTime.getMonth() + 1) + "-" + dateTime.getDate();
}
/** Convert a Date object to a HH:mm string. */
var tools_timeToString = function(dateTime) {
	let hours = dateTime.getHours();
	let minutes = dateTime.getMinutes();
	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	return hours + ":" + minutes;
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
