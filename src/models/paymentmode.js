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
