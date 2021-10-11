var _salesbyvat_data = {};

function salesbyvat_show() {
    let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
    let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
    vue.screen.data = {
        "start": start,
        "stop": stop,
        "includeZeros": false,
        "table": {reference: "salesByVat-list", columns: []}
    }
    vue.screen.component = "vue-salesbyvat";
}

function salesbyvat_filter() {
    let start = vue.screen.data.start;
    let stop = vue.screen.data.stop;

    _salesbyvat_data = {
        "start": start.getTime() / 1000,
        "stop": stop.getTime() / 1000,
        "pages": 0,
        "currentPage": 0,
        "separateByCR": vue.screen.data.separateCashRegisters,
        "products": {},
        "categories": {},
        "customProducts": {}
    };

    srvcall_get("api/ticket/search?count=1&dateStart=" + _salesbyvat_data.start + "&dateStop=" + _salesbyvat_data.stop, _salesbyvat_countCallback);
    gui_showLoading();
}

function _salesbyvat_countCallback(request, status, response) {
    if (srvcall_callbackCatch(request, status, response, salesbyvat_filter)) {
        return;
    }
    let count = parseInt(response);
    let pages = parseInt(count / 100);
    if (count % 100 > 0) {
        pages++;
    }
    _salesbyvat_data.pages = pages;
    gui_showProgress(0, pages);
    srvcall_get("api/ticket/search?limit=100&dateStart=" + _salesbyvat_data.start + "&dateStop=" + _salesbyvat_data.stop, _salesbyvat_filterCallback);
}

function _salesbyvat_filterCallback(request, status, response) {
    if (srvcall_callbackCatch(request, status, response, salesbyvat_filter)) {
        return;
    }
    let tickets = JSON.parse(response);
    for (let i = 0; i < tickets.length; i++) {
        let ticket = tickets[i];
        for (let j = 0; j < ticket.lines.length; j++) {
            let line = ticket.lines[j];
            if (line.product != null) {
                if (!(line.product in _salesbyvat_data.products)) {
                    if (_salesbyvat_data.separateByCR) {
                        _salesbyvat_data.products[line.product] = {};
                    } else {
                        _salesbyvat_data.products[line.product] = {qty: 0, price: 0.0, priceTax: 0.0};
                    }
                }
                if (_salesbyvat_data.separateByCR) {
                    if (!(ticket.cashRegister in _salesbyvat_data.products[line.product])) {
                        _salesbyvat_data.products[line.product][ticket.cashRegister] = {
                            qty: 0,
                            price: 0.0,
                            priceTax: 0.0
                        };
                    }
                    _salesbyvat_data.products[line.product][ticket.cashRegister].qty += line.quantity;
                    _salesbyvat_data.products[line.product][ticket.cashRegister].priceTax += line.finalTaxedPrice
                    _salesbyvat_data.products[line.product][ticket.cashRegister].price += (line.finalTaxedPrice / (1.0 + line.taxRate))
                } else {
                    _salesbyvat_data.products[line.product].qty += line.quantity;
                    _salesbyvat_data.products[line.product].priceTax += line.finalTaxedPrice
                    _salesbyvat_data.products[line.product].price += (line.finalTaxedPrice / (1.0 + line.taxRate))
                }
            } else {
                if (!(line.productLabel in _salesbyvat_data.customProducts)) {
                    _salesbyvat_data.customProducts[line.productLabel] = []
                }

                if (!(line.tax in _salesbyvat_data.customProducts[line.productLabel])) {
                    if (_salesbyvat_data.separateByCR) {
                        _salesbyvat_data.customProducts[line.productLabel][line.tax] = {}
                    } else {
                        _salesbyvat_data.customProducts[line.productLabel][line.tax] = {
                            qty: 0,
                            price: 0.0,
                            priceTax: 0.0
                        }
                    }
                }


                if (_salesbyvat_data.separateByCR) {
                    if (!(ticket.cashRegister in _salesbyvat_data.customProducts[line.productLabel][line.tax])) {
                        _salesbyvat_data.customProducts[line.productLabel][line.tax][ticket.cashRegister] = {
                            qty: 0,
                            price: 0.0,
                            priceTax: 0.0
                        };
                    }
                    _salesbyvat_data.customProducts[line.productLabel][line.tax][ticket.cashRegister].qty += line.quantity;
                    _salesbyvat_data.customProducts[line.productLabel][line.tax][ticket.cashRegister].priceTax += line.finalTaxedPrice
                    _salesbyvat_data.customProducts[line.productLabel][line.tax][ticket.cashRegister].price += (line.finalTaxedPrice / (1.0 + line.taxRate))

                } else {
                    _salesbyvat_data.customProducts[line.productLabel][line.tax].qty += line.quantity;
                    _salesbyvat_data.customProducts[line.productLabel][line.tax].priceTax += line.finalTaxedPrice
                    _salesbyvat_data.customProducts[line.productLabel][line.tax].price += (line.finalTaxedPrice / (1.0 + line.taxRate))
                }
            }
        }
    }
    _salesbyvat_data.currentPage++;

    if (_salesbyvat_data.currentPage < _salesbyvat_data.pages) {
        gui_showProgress(_salesbyvat_data.currentPage, _salesbyvat_data.pages);
        srvcall_get("api/ticket/search?limit=100&offset=" + (100 * _salesbyvat_data.currentPage) + "&dateStart=" + _salesbyvat_data.start + "&dateStop=" + _salesbyvat_data.stop, _salesbyvat_filterCallback);
    } else {
        _salesbyvat_dataRetreived();
    }
}

function _salesbyvat_dataRetreived() {
    gui_showLoading();
    storage_open(function (event) {
        storage_readStores(["categories", "products", "cashRegisters", "taxes"], function (data) {
            if (vue.screen.data.separateCashRegisters) {
                _salesbyvat_render(data["cashRegisters"], data["categories"], data["products"], data["taxes"]);
            } else {
                _salesbyvat_render(null, data["categories"], data["products"], data["taxes"]);
            }
            storage_close();
        });
    });
}

function _salesbyvat_render(cashRegisters, categories, products, taxes) {
    let separateByCR = cashRegisters != null;
    if (separateByCR) {
        cashRegisters = cashRegisters.sort(tools_sort("reference"));
    }

    // Initialize all missing 0 in separated cash registers
    if (separateByCR && vue.screen.data.includeZero) {
        for (let i = 0; i < products.length; i++) {
            let prd = products[i];
            if (prd.visible || vue.screen.data.includeArchives) {
                if (!(prd.id in _salesbyvat_data.products)) {
                    _salesbyvat_data.products[prd.id] = {qty: 0, price: 0.0, priceTax: 0.0};
                }
                for (let j = 0; j < cashRegisters.length; j++) {
                    let cashRegister = cashRegisters[j];
                    if (!(cashRegister.id in _salesbyvat_data.products[prd.id])) {
                        _salesbyvat_data.products[prd.id][cashRegister.id] = {qty: 0, price: 0.0, priceTax: 0.0};
                        ;
                    }
                }
            }
        }
        for (let prdLabel in _salesbyvat_data.customProducts) {
            for (let j = 0; j < taxes.length; j++) {
                let tax = taxes[j];
                if (!(tax.id in _salesbyvat_data.customProducts[prdLabel])) {
                    _salesbyvat_data.customProducts[prdLabel][tax.id] = []
                }
                for (let k = 0; k < cashRegisters; k++) {
                    let cr = cashRegisters[k];
                    if (!(cr.id in _salesbyvat_data.customProducts[prdLabel][tax.id])) {
                        _salesbyvat_data.customProducts[prdLabel][tax.id][cr.id] = {
                            qty: 0,
                            price: 0.0,
                            priceTax: 0.0
                        }
                    }
                }
            }
        }
    }

    let catById = []
    for (let i = 0; i < categories.length; i++) {
        catById[categories[i].id] = categories[i];
        catById[categories[i].id].products = [];
    }

    let prdById = []
    for (let i = 0; i < products.length; i++) {
        prdById[products[i].id] = products[i];
    }

    let taxById = []
    for (let i = 0; i < taxes.length; i++) {
        taxById[taxes[i].id] = taxes[i]
    }

    for (let i = 0; i < products.length; i++) {
        let prd = products[i]
        if (prd.visible || vue.screen.data.includeArchives) {
            if (!(prd.id in _salesbyvat_data.products) && vue.screen.data.includeZero && !separateByCR) {
                _salesbyvat_data.products[prd.id] = {qty: 0, price: 0.0, priceTax: 0.0};
            }
            if (prd.id in _salesbyvat_data.products) {
                catById[prd.category].products.push(prd);
            }
        }
    }

    let stats = []
    for (let id in catById) {
        if (catById[id].products.length > 0) {
            // Sort products in category product list
            catById[id].products = catById[id].products.sort(tools_sort("dispOrder", "reference"));
            // Push category in stats
            stats.push(catById[id])
        }
    }


    let lines = []
    for (let i = 0; i < stats.length; i++) {
        let cat = stats[i]
        let img = null;
        if (cat.hasImage) {
            img = {
                "type": "thumbnail",
                "src": login_getHostUrl() + "/api/image/category/" + cat.id + "?Token=" + login_getToken()
            };
        } else {
            img = {
                "type": "thumbnail",
                "src": login_getHostUrl() + "/api/image/category/default?Token=" + login_getToken()
            };
        }
        if (!separateByCR && (stats[i].products.length > 0 || vue.screen.data.includeZero)) {
            let totalPrice = 0.0;
            let totalPriceVAT = 0.0;

            let vatValues = []
            for (let j = 0; j < taxes.length; j++) {
                vatValues[taxes[j].id] = {price: 0.0, priceVat: 0.0}
            }

            for (let j = 0; j < stats[i].products.length; j++) {

                let prd = stats[i].products[j];
                vatValues[prdById[prd.id].tax].price += _salesbyvat_data.products[prd.id].price;
                vatValues[prdById[prd.id].tax].priceVat += _salesbyvat_data.products[prd.id].priceTax;
                totalPrice += _salesbyvat_data.products[prd.id].price;
                totalPriceVAT += _salesbyvat_data.products[prd.id].priceTax;
            }

            line = [
                img,
                "",
                cat.label,
                cat.reference,
                totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}),
                totalPriceVAT.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}),
                (totalPriceVAT - totalPrice).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 5
                })
            ]

            for (let j = 0; j < taxes.length; j++) {
                if (vatValues[taxes[j].id].price != 0) {
                    line.push(vatValues[taxes[j].id].price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 5
                    }))
                } else {
                    line.push("")
                }
                if (vatValues[taxes[j].id].priceVat != 0) {
                    line.push(vatValues[taxes[j].id].priceVat.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 5
                    }))
                } else {
                    line.push("")
                }

                if (vatValues[taxes[j].id].price != 0 || vatValues[taxes[j].id].priceVat != 0) {
                    line.push((vatValues[taxes[j].id].priceVat - vatValues[taxes[j].id].price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 5
                    }))
                } else {
                    line.push("")
                }

            }

            lines.push(line)
        } else {
            for (let k = 0; k < cashRegisters.length; k++) {
                let cr = cashRegisters[k];

                let display = false;
                let totalPrice = 0.0;
                let totalPriceVAT = 0.0;

                let vatValues = []
                for (let j = 0; j < taxes.length; j++) {
                    vatValues[taxes[j].id] = {price: 0.0, priceVat: 0.0}
                }


                for (let j = 0; j < stats[i].products.length; j++) {
                    let prd = stats[i].products[j];
                    if (cr.id in _salesbyvat_data.products[prd.id]) {
                        display = true
                        vatValues[prdById[prd.id].tax].price += _salesbyvat_data.products[prd.id][cr.id].price;
                        vatValues[prdById[prd.id].tax].priceVat += _salesbyvat_data.products[prd.id][cr.id].priceTax;
                        totalPrice += _salesbyvat_data.products[prd.id][cr.id].price;
                        totalPriceVAT += _salesbyvat_data.products[prd.id][cr.id].priceTax;
                    }
                }

                if (display || vue.screen.data.includeZero) {

                    line = [
                        img,
                        cr.label,
                        cat.label,
                        cat.reference,
                        totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}),
                        totalPriceVAT.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}),
                        (totalPriceVAT - totalPrice).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 5
                        })
                    ]

                    for (let j = 0; j < taxes.length; j++) {
                        if (vatValues[taxes[j].id].price != 0) {
                            line.push(vatValues[taxes[j].id].price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 5
                            }))
                        } else {
                            line.push("")
                        }
                        if (vatValues[taxes[j].id].priceVat != 0) {
                            line.push(vatValues[taxes[j].id].priceVat.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 5
                            }))
                        } else {
                            line.push("")
                        }
                        if (vatValues[taxes[j].id].priceVat != 0 || vatValues[taxes[j].id].priceVat != 0) {
                            line.push((vatValues[taxes[j].id].priceVat - vatValues[taxes[j].id].price).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 5
                            }))
                        } else {
                            line.push("")
                        }
                    }

                    lines.push(line)
                }
            }
        }
    }

    lines = lines.sort(tools_sort(3))

    let customProductLabels = Object.keys(_salesbyvat_data.customProducts).sort()
    if (!separateByCR) {
        let displayCustomProductLine = false;
        let customProductTotalPrice = 0.0;
        let customProductTotalPriceTax = 0.0;

        let vatValues = []
        for (let j = 0; j < taxes.length; j++) {
            vatValues[taxes[j].id] = {price: 0.0, priceVat: 0.0}
        }

        for (let i = 0; i < customProductLabels.length; i++) {


            let productLabel = customProductLabels[i]
            for (j = 0; j < taxes.length; j++) {
                let tax = taxes[j]
                if (tax.id in _salesbyvat_data.customProducts[productLabel]) {
                    vatValues[tax.id].price += _salesbyvat_data.customProducts[productLabel][tax.id].price
                    vatValues[tax.id].priceVat += _salesbyvat_data.customProducts[productLabel][tax.id].priceTax
                    customProductTotalPrice += _salesbyvat_data.customProducts[productLabel][tax.id].price
                    customProductTotalPriceTax += _salesbyvat_data.customProducts[productLabel][tax.id].priceTax
                }
            }
            // }
            displayCustomProductLine = true
        }

        if (displayCustomProductLine) {
            line = [
                "",
                "",
                "",
                "",
                customProductTotalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}),
                customProductTotalPriceTax.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 5
                }),
                (customProductTotalPriceTax - customProductTotalPrice).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 5
                })
            ]

            for (let j = 0; j < taxes.length; j++) {
                if (vatValues[taxes[j].id].price != 0) {
                    line.push(vatValues[taxes[j].id].price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 5
                    }))
                } else {
                    line.push("")
                }
                if (vatValues[taxes[j].id].priceVat != 0) {
                    line.push(vatValues[taxes[j].id].priceVat.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 5
                    }))
                } else {
                    line.push("")
                }

                if (vatValues[taxes[j].id].priceVat != 0 || vatValues[taxes[j].id].priceVat != 0) {
                    line.push((vatValues[taxes[j].id].priceVat - vatValues[taxes[j].id].price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 5
                    }))
                } else {
                    line.push("")
                }

            }

            lines.push(line)
        }
    } else {
        for (let i = 0; i < cashRegisters.length; i++) {
            let cr = cashRegisters[i]
            let displayCustomProductLine = false;
            let totalPrice = 0.0
            let totalPriceTax = 0.0

            let vatValues = []
            for (let j = 0; j < taxes.length; j++) {
                vatValues[taxes[j].id] = {price: 0.0, priceVat: 0.0}
            }

            for (let j = 0; j < customProductLabels.length; j++) {
                let productLabel = customProductLabels[j]

                for (let k = 0; k < taxes.length; k++) {
                    let tax = taxes[k]
                    if (tax.id in _salesbyvat_data.customProducts[productLabel]) {
                        if (cr.id in _salesbyvat_data.customProducts[productLabel][tax.id]) {
                            vatValues[tax.id].price += _salesbyvat_data.customProducts[productLabel][tax.id][cr.id].price
                            vatValues[tax.id].priceVat += _salesbyvat_data.customProducts[productLabel][tax.id][cr.id].priceTax
                            totalPrice += _salesbyvat_data.customProducts[productLabel][tax.id][cr.id].price
                            totalPriceTax += _salesbyvat_data.customProducts[productLabel][tax.id][cr.id].priceTax
                            displayCustomProductLine = true
                        }
                    }
                }
            }

            if (displayCustomProductLine || vue.screen.data.includeZero) {
                line = [
                    "",
                    cr.label,
                    "",
                    "",
                    totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}),
                    totalPriceTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}),
                    (totalPriceTax - totalPrice).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 5
                    })
                ]


                for (let j = 0; j < taxes.length; j++) {
                        if (vatValues[taxes[j].id].price != 0) {
                            line.push(vatValues[taxes[j].id].price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 5
                            }))
                        } else {
                            line.push("")
                        }
                        if (vatValues[taxes[j].id].priceVat != 0) {
                            line.push(vatValues[taxes[j].id].priceVat.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 5
                            }))
                        } else {
                            line.push("")
                        }
                        if (vatValues[taxes[j].id].priceVat != 0 || vatValues[taxes[j].id].priceVat != 0) {
                            line.push((vatValues[taxes[j].id].priceVat - vatValues[taxes[j].id].price).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 5
                            }))
                        } else {
                            line.push("")
                        }
                }


                lines.push(line)
            }
        }
    }

    let oldColumns = vue.screen.data.table.columns;
    let oldColumnVisible = function (label, old, default_val) {
        for (let i = 0; i < old.length; i++) {
            if (old[i].label == label) {
                return old[i].visible;
            }
        }
        return default_val;
    };

    vue.screen.data.table.columns = [
        {
            reference: "image",
            label: "Image",
            visible: oldColumnVisible("Image", oldColumns, true),
            export: false,
            help: "L'image de la catégorie. Ce champ ne peut être exporté."
        },
        {
            reference: "cashRegister",
            label: "Caisse",
            visible: oldColumnVisible("Caisse", oldColumns, (separateByCR)),
            help: "La caisse pour laquelle les vente sont comptabilisées. Si l'option Détailler par caisse n'est pas cochée, ce champ est vide."
        },
        {
            reference: "label",
            label: "Catégorie",
            visible: oldColumnVisible("Catégorie", oldColumns, true),
            help: "Le nom de la catégorie."
        },
        {
            reference: "reference",
            label: "Reference",
            visible: oldColumnVisible("Reference", oldColumns, false),
            help: "La référence de la catégorie."
        },
        {
            reference: "priceSell",
            label: "Total ventes HT",
            export_as_number: true,
            visible: oldColumnVisible("Total ventes HT", oldColumns, true),
            class: "z-oddcol",
            help: "Le montant de chiffre d'affaire hors taxes réalisé par les produits de la catégorie sur la période concernée."
        },
        {
            reference: "priceSellVat",
            label: "Total Ventes TTC",
            export_as_number: true,
            visible: oldColumnVisible("Total Ventes TTC", oldColumns, true),
            class: "z-oddcol",
            help: "Le montant de chiffre d'affaire TTC réalisé par les produits de la catégorie sur la période concernée."
        },
        {
            reference: "vat",
            label: "Total TVA",
            export_as_number: true,
            visible: oldColumnVisible("Total TVA", oldColumns, true),
            class: "z-oddcol",
            help: "Le montant de la TVA collectée sur les produits de la catégorie sur la période concernée."
        },
    ];

    for (let i = 0; i < taxes.length; i++) {
        let tax = taxes[i];
        vue.screen.data.table.columns.push({
            reference: "tax-" + i + "-base",
            export_as_number: true,
            label: tax.label + " base",
            visible: oldColumnVisible(tax.label + " base", oldColumns, false),
            class: (i % 2 == 1 ? "z-oddcol" : ""),
            help: "Le montant de chiffre d'affaire hors taxe associé au taux de TVA."
        });
        vue.screen.data.table.columns.push({
            reference: "tax-" + i + "-vat",
            export_as_number: true,
            label: tax.label + " TTC",
            visible: oldColumnVisible(tax.label + " TTC", oldColumns, false),
            class: (i % 2 == 1 ? "z-oddcol" : ""),
            help: "Le montant de chiffre d'affaire toute taxe associé au taux de TVA."
        });
        vue.screen.data.table.columns.push({
            reference: "tax-" + i + "-amount",
            export_as_number: true,
            label: tax.label + " TVA",
            visible: oldColumnVisible(tax.label + " TVA", oldColumns, false),
            class: (i % 2 == 1 ? "z-oddcol" : ""),
            help: "Le montant de TVA collectée associé au taux de TVA."
        });
        // vue.screen.data.table.footer.push(total.taxTotal[i].base);
        // vue.screen.data.table.footer.push(total.taxTotal[i].amount);
    }


    vue.screen.data.table.title = "Ventes par TVA du "
        + tools_dateToString(vue.screen.data.start)
        + " au "
        + tools_dateToString(vue.screen.data.stop);
    Vue.set(vue.screen.data.table, "lines", lines);

    gui_hideLoading();
}