var _salesbyprodandvat_data = {};

function salesbyprodandvat_show() {
    let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
    let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
    vue.screen.data = {
        "start": start,
        "stop": stop,
        "includeZeros": false,
        "includeArchives": true,
        "table": {reference: "salesByProdAndVat-list", columns: []}
    }
    vue.screen.component = "vue-salesbyprodandvat";
}

function salesbyprodandvat_filter() {
    let start = vue.screen.data.start;
    let stop = vue.screen.data.stop;

    _salesbyprodandvat_data = {
        "start": start.getTime() / 1000,
        "stop": stop.getTime() / 1000,
        "pages": 0,
        "currentPage": 0,
        "separateByCR": vue.screen.data.separateCashRegisters,
        "products": {},
        "categories": {},
        "customProducts": {}
    };

    srvcall_get("api/ticket/search?count=1&dateStart=" + _salesbyprodandvat_data.start + "&dateStop=" + _salesbyprodandvat_data.stop, _salesbyprodandvat_countCallback);
    gui_showLoading();
}

function _salesbyprodandvat_countCallback(request, status, response) {
    if (srvcall_callbackCatch(request, status, response, salesbyprodandvat_filter)) {
        return;
    }
    let count = parseInt(response);
    let pages = parseInt(count / 100);
    if (count % 100 > 0) {
        pages++;
    }
    _salesbyprodandvat_data.pages = pages;
    gui_showProgress(0, pages);
    srvcall_get("api/ticket/search?limit=100&dateStart=" + _salesbyprodandvat_data.start + "&dateStop=" + _salesbyprodandvat_data.stop, _salesbyprodandvat_filterCallback);
}

function _salesbyprodandvat_filterCallback(request, status, response) {
    if (srvcall_callbackCatch(request, status, response, salesbyprodandvat_filter)) {
        return;
    }
    let tickets = JSON.parse(response);
    for (let i = 0; i < tickets.length; i++) {
        let ticket = tickets[i];
        for (let j = 0; j < ticket.lines.length; j++) {
            let line = ticket.lines[j];
            if (line.product != null) {
                console.log(line)
                if (line.productLabel == "") {
                    console.log(line)
                }
                 if (!(line.product in _salesbyprodandvat_data.products)) {
                    if (_salesbyprodandvat_data.separateByCR) {
                        _salesbyprodandvat_data.products[line.product] = {};
                    } else {
                        _salesbyprodandvat_data.products[line.product] = {qty: 0, price: 0.0, priceTax: 0.0};
                    }
                }
                if (_salesbyprodandvat_data.separateByCR) {
                    if (!(ticket.cashRegister in _salesbyprodandvat_data.products[line.product])) {
                        _salesbyprodandvat_data.products[line.product][ticket.cashRegister] = {
                            qty: 0,
                            price: 0.0,
                            priceTax: 0.0
                        };
                    }
                    _salesbyprodandvat_data.products[line.product][ticket.cashRegister].qty += line.quantity;
                    _salesbyprodandvat_data.products[line.product][ticket.cashRegister].priceTax += line.finalTaxedPrice
                    _salesbyprodandvat_data.products[line.product][ticket.cashRegister].price += (line.finalTaxedPrice / (1.0 + line.taxRate))
                } else {
                    _salesbyprodandvat_data.products[line.product].qty += line.quantity;
                    _salesbyprodandvat_data.products[line.product].priceTax += line.finalTaxedPrice
                    _salesbyprodandvat_data.products[line.product].price += (line.finalTaxedPrice / (1.0 + line.taxRate))
                }
            } else {
                if (!(line.productLabel in _salesbyprodandvat_data.customProducts)) {
                    _salesbyprodandvat_data.customProducts[line.productLabel] = []
                }

                if (!(line.tax in _salesbyprodandvat_data.customProducts[line.productLabel])) {
                    if (_salesbyprodandvat_data.separateByCR) {
                        _salesbyprodandvat_data.customProducts[line.productLabel][line.tax] = {}
                    } else {
                        _salesbyprodandvat_data.customProducts[line.productLabel][line.tax] = {
                            qty: 0,
                            price: 0.0,
                            priceTax: 0.0
                        }
                    }
                }


                if (_salesbyprodandvat_data.separateByCR) {
                    if (!(ticket.cashRegister in _salesbyprodandvat_data.customProducts[line.productLabel][line.tax])) {
                        _salesbyprodandvat_data.customProducts[line.productLabel][line.tax][ticket.cashRegister] = {
                            qty: 0,
                            price: 0.0,
                            priceTax: 0.0
                        };
                    }
                    _salesbyprodandvat_data.customProducts[line.productLabel][line.tax][ticket.cashRegister].qty += line.quantity;
                    _salesbyprodandvat_data.customProducts[line.productLabel][line.tax][ticket.cashRegister].priceTax += line.finalTaxedPrice
                    _salesbyprodandvat_data.customProducts[line.productLabel][line.tax][ticket.cashRegister].price += (line.finalTaxedPrice / (1.0 + line.taxRate))

                } else {
                    _salesbyprodandvat_data.customProducts[line.productLabel][line.tax].qty += line.quantity;
                    _salesbyprodandvat_data.customProducts[line.productLabel][line.tax].priceTax += line.finalTaxedPrice
                    _salesbyprodandvat_data.customProducts[line.productLabel][line.tax].price += (line.finalTaxedPrice / (1.0 + line.taxRate))
                }
            }
        }
    }
    _salesbyprodandvat_data.currentPage++;

    if (_salesbyprodandvat_data.currentPage < _salesbyprodandvat_data.pages) {
        gui_showProgress(_salesbyprodandvat_data.currentPage, _salesbyprodandvat_data.pages);
        srvcall_get("api/ticket/search?limit=100&offset=" + (100 * _salesbyprodandvat_data.currentPage) + "&dateStart=" + _salesbyprodandvat_data.start + "&dateStop=" + _salesbyprodandvat_data.stop, _salesbyprodandvat_filterCallback);
    } else {
        _salesbyprodandvat_dataRetreived();
    }
}

function _salesbyprodandvat_dataRetreived() {
    gui_showLoading();
    storage_open(function (event) {
        storage_readStores(["categories", "products", "cashRegisters", "taxes"], function (data) {
            if (vue.screen.data.separateCashRegisters) {
                _salesbyprodandvat_render(data["cashRegisters"], data["categories"], data["products"], data["taxes"]);
            } else {
                _salesbyprodandvat_render(null, data["categories"], data["products"], data["taxes"]);
            }
            storage_close();
        });
    });
}

function _salesbyprodandvat_render(cashRegisters, categories, products, taxes) {
    let separateByCR = cashRegisters != null;
    if (separateByCR) {
        cashRegisters = cashRegisters.sort(tools_sort("reference"));
    }

    // Initialize all missing 0 in separated cash registers
    if (separateByCR && vue.screen.data.includeZero) {
        for (let i = 0; i < products.length; i++) {
            let prd = products[i];
            if (prd.visible || vue.screen.data.includeArchives) {
                if (!(prd.id in _salesbyprodandvat_data.products)) {
                    _salesbyprodandvat_data.products[prd.id] = {qty: 0, price: 0.0, priceTax: 0.0};
                }
                for (let j = 0; j < cashRegisters.length; j++) {
                    let cashRegister = cashRegisters[j];
                    if (!(cashRegister.id in _salesbyprodandvat_data.products[prd.id])) {
                        _salesbyprodandvat_data.products[prd.id][cashRegister.id] = {qty: 0, price: 0.0, priceTax: 0.0};
                        ;
                    }
                }
            }
        }
        for (let prdLabel in _salesbyprodandvat_data.customProducts) {
            for (let j = 0; j < taxes.length; j++) {
                let tax = taxes[j];
                if (!(tax.id in _salesbyprodandvat_data.customProducts[prdLabel])) {
                    _salesbyprodandvat_data.customProducts[prdLabel][tax.id] = []
                }
                for (let k = 0; k < cashRegisters; k++) {
                    let cr = cashRegisters[k];
                    if (!(cr.id in _salesbyprodandvat_data.customProducts[prdLabel][tax.id])) {
                        _salesbyprodandvat_data.customProducts[prdLabel][tax.id][cr.id] = {
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
            if (!(prd.id in _salesbyprodandvat_data.products) && vue.screen.data.includeZero && !separateByCR) {
                _salesbyprodandvat_data.products[prd.id] = {qty: 0, price: 0.0, priceTax: 0.0};
            }
            if (prd.id in _salesbyprodandvat_data.products) {
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
        if (!separateByCR && (stats[i].products.length > 0 || vue.screen.data.includeZero)) {

            for (let j = 0; j < stats[i].products.length; j++) {

                let prd = stats[i].products[j];

                let img = null;
                if (prd.hasImage) {
                    img = {"type": "thumbnail", "src": login_getHostUrl() + "/api/image/product/" + prd.id + "?Token=" + login_getToken()};
                } else {
                    img = {"type": "thumbnail", "src": login_getHostUrl() + "/api/image/product/default?Token=" + login_getToken()};
                }

                line = [
                    img,
                    "",
                    cat.label,
                    prd.reference,
                    prd.label
                ]

                for (let j = 0; j < taxes.length; j++) {
                    if (prd.tax == taxes[j].id) {
                        if (_salesbyprodandvat_data.products[prd.id].price != 0) {
                            line.push(_salesbyprodandvat_data.products[prd.id].price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 5
                            }))
                        } else {
                            line.push("")
                        }
                        if (_salesbyprodandvat_data.products[prd.id].priceTax != 0) {
                            line.push(_salesbyprodandvat_data.products[prd.id].priceTax.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 5
                            }))
                        } else {
                            line.push("")
                        }
                        if (_salesbyprodandvat_data.products[prd.id].price != 0 || _salesbyprodandvat_data.products[prd.id].priceTax != 0) {
                            line.push((_salesbyprodandvat_data.products[prd.id].priceTax - _salesbyprodandvat_data.products[prd.id].price).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 5
                            }))
                        } else {
                            line.push("")
                        }
                    } else {
                        line.push("");
                        line.push("");
                        line.push("");
                    }

                }

                lines.push(line);


            }

        } else {
            for (let k = 0; k < cashRegisters.length; k++) {
                let cr = cashRegisters[k];

                for (let j = 0; j < stats[i].products.length; j++) {

                    let prd = stats[i].products[j];

                    if (cr.id in _salesbyprodandvat_data.products[prd.id] || vue.screen.data.includeZero) {

                        let img = null;
                        if (prd.hasImage) {
                            img = {"type": "thumbnail", "src": login_getHostUrl() + "/api/image/product/" + prd.id + "?Token=" + login_getToken()};
                        } else {
                            img = {"type": "thumbnail", "src": login_getHostUrl() + "/api/image/product/default?Token=" + login_getToken()};
                        }

                        line = [
                            img,
                            cr.label,
                            cat.label,
                            prd.reference,
                            prd.label
                        ]

                        for (let j = 0; j < taxes.length; j++) {
                            if (prd.tax == taxes[j].id) {
                                if (_salesbyprodandvat_data.products[prd.id][cr.id].price != 0) {
                                    line.push(_salesbyprodandvat_data.products[prd.id][cr.id].price.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 5
                                    }))
                                } else {
                                    line.push("")
                                }
                                if (_salesbyprodandvat_data.products[prd.id][cr.id].priceTax != 0) {
                                    line.push(_salesbyprodandvat_data.products[prd.id][cr.id].priceTax.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 5
                                    }))
                                } else {
                                    line.push("")
                                }
                                if (_salesbyprodandvat_data.products[prd.id][cr.id].price != 0 || _salesbyprodandvat_data.products[prd.id][cr.id].priceTax != 0) {
                                    line.push((_salesbyprodandvat_data.products[prd.id][cr.id].priceTax - _salesbyprodandvat_data.products[prd.id][cr.id].price).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 5
                                    }))
                                } else {
                                    line.push("")
                                }
                            } else {
                                line.push("");
                                line.push("");
                                line.push("");
                            }

                        }

                        lines.push(line)
                    }
                }
            }
        }
    }

    lines = lines.sort(tools_sort(3))

    let customProductLabels = Object.keys(_salesbyprodandvat_data.customProducts).sort()
    if (!separateByCR) {

        for (let i = 0; i < customProductLabels.length; i++) {


            let productLabel = customProductLabels[i]

            line = [
                "",
                "",
                "",
                "",
                productLabel
            ]

            for (let j = 0; j < taxes.length; j++) {
                let tax = taxes[j];
                if (tax.id in _salesbyprodandvat_data.customProducts[productLabel]) {
                    if (_salesbyprodandvat_data.customProducts[productLabel][tax.id].price != 0) {
                        line.push(_salesbyprodandvat_data.customProducts[productLabel][tax.id].price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 5
                        }))
                    } else {
                        line.push("")
                    }
                    if (_salesbyprodandvat_data.customProducts[productLabel][tax.id].priceTax != 0) {
                        line.push(_salesbyprodandvat_data.customProducts[productLabel][tax.id].priceTax.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 5
                        }))
                    } else {
                        line.push("")
                    }

                    if (_salesbyprodandvat_data.customProducts[productLabel][tax.id].priceTax != 0 || _salesbyprodandvat_data.customProducts[productLabel][tax.id].priceTax != 0) {
                        line.push((_salesbyprodandvat_data.customProducts[productLabel][tax.id].priceTax - _salesbyprodandvat_data.customProducts[productLabel][tax.id].price).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 5
                        }))
                    } else {
                        line.push("")
                    }

                } else {
                    line.push("");
                    line.push("");
                    line.push("");
                }

            }
            lines.push(line)
        }
    } else {
        for (let i = 0; i < cashRegisters.length; i++) {
            let cr = cashRegisters[i]

            for (let i = 0; i < customProductLabels.length; i++) {


                let productLabel = customProductLabels[i]
                let hasBeenSoldAtLeastOnce = false;

                line = [
                    "",
                    cr.label,
                    "",
                    "",
                    productLabel
                ]

                for (let j = 0; j < taxes.length; j++) {
                    let tax = taxes[j];
                    if (tax.id in _salesbyprodandvat_data.customProducts[productLabel] && cr.id in _salesbyprodandvat_data.customProducts[productLabel][tax.id]) {
                        if (_salesbyprodandvat_data.customProducts[productLabel][tax.id][cr.id].price != 0) {
                            line.push(_salesbyprodandvat_data.customProducts[productLabel][tax.id][cr.id].price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 5
                            }))
                            hasBeenSoldAtLeastOnce = true;
                        } else {
                            line.push("")
                        }
                        if (_salesbyprodandvat_data.customProducts[productLabel][tax.id][cr.id].priceTax != 0) {
                            line.push(_salesbyprodandvat_data.customProducts[productLabel][tax.id][cr.id].priceTax.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 5
                            }))
                            hasBeenSoldAtLeastOnce = true;
                        } else {
                            line.push("")
                        }

                        if (_salesbyprodandvat_data.customProducts[productLabel][tax.id][cr.id].priceTax != 0 || _salesbyprodandvat_data.customProducts[productLabel][tax.id][cr.id].priceTax != 0) {
                            line.push((_salesbyprodandvat_data.customProducts[productLabel][tax.id][cr.id].priceTax - _salesbyprodandvat_data.customProducts[productLabel][tax.id][cr.id].price).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 5
                            }))
                            hasBeenSoldAtLeastOnce = true;
                        } else {
                            line.push("")
                        }

                    } else {
                        line.push("");
                        line.push("");
                        line.push("");
                    }

                }

                if ( hasBeenSoldAtLeastOnce || _salesbyprodandvat_data.includeZeros) {
                    lines.push(line)
                }
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
            reference: "category",
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
            reference: "label",
            label: "Désignation",
            visible: true,
            help: "Le nom du produit tel qu'affiché sur les boutons de la caisse et le ticket."
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
    //     // vue.screen.data.table.footer.push(total.taxTotal[i].base);
    //     // vue.screen.data.table.footer.push(total.taxTotal[i].amount);
    }
    vue.screen.data.table.title = "Ventes par TVA du "
        + tools_dateToString(vue.screen.data.start)
        + " au "
        + tools_dateToString(vue.screen.data.stop);

    Vue.set(vue.screen.data.table, "lines", lines);

    gui_hideLoading();
}