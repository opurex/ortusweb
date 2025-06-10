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

