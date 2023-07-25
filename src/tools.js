
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
