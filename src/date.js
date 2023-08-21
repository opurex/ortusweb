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
