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
