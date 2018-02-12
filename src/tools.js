
/** Get a sorting function to pass to Array.sort to sort by fields.
 * String fields are converted to lowercase for comparison.
 * @param field1 The name of the first field to compare.
 * @param field2 The name of the second field to compare. */
var tools_sort = function(field1, field2) {
	return function(a, b) {
		let a1 = a[field1];
		let b1 = b[field1];
		if (typeof  a1 == "string") {
			a1 = a1.toLowerCase();
			b1 = b1.toLowerCase();
		}
		if (a1 == b1) {
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

