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
        "table": {
            "reference": "salesByCategory-list",
            "title": null,
            "columns": [
                {reference: "image", label: "Image", visible: true, export: false, help: "L'image de la catégorie. Ce champ ne peut être exporté."},
                {reference: "cashRegister", label: "Caisse", visible: false, help: "La caisse pour laquelle les vente sont comptabilisées. Si l'option Détailler par caisse n'est pas cochée, ce champ est vide."},
                {reference: "label", label: "Catégorie", visible: true, help: "Le nom de la catégorie."},
                {reference: "reference", label: "Reference", visible: false, help: "La référence de la catégorie."},
                {reference: "quantity", label: "Quantité", export_as_number: true, visible: true, help: "La quantité de produits vendus sur la période."},
                {reference: "priceSell", label: "Total ventes HT", export_as_number: true, visible: false, help: "Le montant de chiffre d'affaire hors taxes réalisé par les produits de la catégorie sur la période concernée."                },
                {reference: "priceBuy", label: "Total achats HT", export_as_number: true, visible: false, help: "Le prix d'achat hors taxes actuel. Ce montant n'a pas d'historique et ne correspond pas forcément au prix d'achat au moment de la vente."                },
                {reference: "margin", label: "Marge", export_as_number: true, visible: false, help: "La marge réalisée sur les ventes des produits sur la période. Cette marge est calculée en fonction du prix d'achat actuel et non du prix d'achat au moment de la vente."                },
                {reference: "priceSellVat", label: "Ventes TTC", export_as_number: true, visible: false, help: "Le montant de chiffre d'affaire TTC réalisé par les produits de la catégorie sur la période concernée."                },
            ],
        },
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
        "products": {},
        "customProducts": {}
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
    srvcall_get("api/ticket/search?limit=100&dateStart=" + _salesbycategory_data.start + "&dateStop=" + _salesbycategory_data.stop, _salesbycategory_filterCallback);
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
            if (line.product != null) {
                if (!(line.product in _salesbycategory_data.products)) {
                    if (_salesbycategory_data.separateByCR) {
                        _salesbycategory_data.products[line.product] = {};
                    } else {
                        _salesbycategory_data.products[line.product] = {qty: 0, price: 0.0, priceTax: 0.0};
                    }
                }
                if (_salesbycategory_data.separateByCR) {
                    if (!(ticket.cashRegister in _salesbycategory_data.products[line.product])) {
                        _salesbycategory_data.products[line.product][ticket.cashRegister] = {
                            qty: 0,
                            price: 0.0,
                            priceTax: 0.0
                        };
                    }
                    _salesbycategory_data.products[line.product][ticket.cashRegister].qty += line.quantity;
                    _salesbycategory_data.products[line.product][ticket.cashRegister].priceTax += line.finalTaxedPrice
                    _salesbycategory_data.products[line.product][ticket.cashRegister].price += (line.finalTaxedPrice / (1.0 + line.taxRate))
                } else {
                    _salesbycategory_data.products[line.product].qty += line.quantity;
                    _salesbycategory_data.products[line.product].priceTax += line.finalTaxedPrice
                    _salesbycategory_data.products[line.product].price += (line.finalTaxedPrice / (1.0 + line.taxRate))
                }
            } else {
                if (!(line.productLabel in _salesbycategory_data.customProducts)) {
                    if (_salesbycategory_data.separateByCR) {
                        _salesbycategory_data.customProducts[line.productLabel] = {};
                    } else {
                        _salesbycategory_data.customProducts[line.productLabel] = {qty: 0, price: 0.0, priceTax: 0.0};
                    }
                }
                if (_salesbycategory_data.separateByCR) {
                    if (!(ticket.cashRegister in _salesbycategory_data.customProducts[line.productLabel])) {
                        _salesbycategory_data.customProducts[line.productLabel][ticket.cashRegister] = {
                            qty: 0,
                            price: 0.0,
                            priceTax: 0.0
                        };
                    }
                    _salesbycategory_data.customProducts[line.productLabel][ticket.cashRegister].qty += line.quantity;
                    _salesbycategory_data.customProducts[line.productLabel][ticket.cashRegister].priceTax += line.finalTaxedPrice
                    _salesbycategory_data.customProducts[line.productLabel][ticket.cashRegister].price += (line.finalTaxedPrice / (1.0 + line.taxRate))

                } else {
                    _salesbycategory_data.customProducts[line.productLabel].qty += line.quantity;
                    _salesbycategory_data.customProducts[line.productLabel].priceTax += line.finalTaxedPrice
                    _salesbycategory_data.customProducts[line.productLabel].price += (line.finalTaxedPrice / (1.0 + line.taxRate))

                }
            }
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
        storage_readStores(["categories", "products", "cashRegisters"], function (data) {
            if (vue.screen.data.separateCashRegisters) {
                _salesbycategory_render(data["cashRegisters"], data["categories"], data["products"]);
            } else {
                _salesbycategory_render(null, data["categories"], data["products"]);
            }
            storage_close();
        });
    });
}

function _salesbycategory_render(cashRegisters, categories, products) {
    // Sort for display
    let separateByCR = cashRegisters != null;
    if (cashRegisters != null) {
        cashRegisters = cashRegisters.sort(tools_sort("reference"));
    }
    if (separateByCR && vue.screen.data.includeZero) {
        // Initialize all missing 0 in separated cash registers
        for (let i = 0; i < products.length; i++) {
            let prd = products[i];
            if (prd.visible || vue.screen.data.includeArchives) {
                if (!(prd.id in _salesbycategory_data.products)) {
                    _salesbycategory_data.products[prd.id] = {qty: 0, price: 0.0, priceTax: 0.0};
                }
                for (let j = 0; j < cashRegisters.length; j++) {
                    let cashRegister = cashRegisters[j];
                    if (!(cashRegister.id in _salesbycategory_data.products[prd.id])) {
                        _salesbycategory_data.products[prd.id][cashRegister.id] = {qty: 0, price: 0.0, priceTax: 0.0};
                        ;
                    }
                }
            }
        }
        for (let prdLabel in _salesbycategory_data.customProducts) {
            for (let j = 0; j < cashRegisters.length; j++) {
                let cashRegister = cashRegisters[j];
                if (!(cashRegister.id in _salesbycategory_data.customProducts[prdLabel])) {
                    _salesbycategory_data.customProducts[prdLabel][cashRegister.id] = {
                        qty: 0,
                        price: 0.0,
                        priceTax: 0.0
                    };
                    ;
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
            if (!(prd.id in _salesbycategory_data.products) && vue.screen.data.includeZero && !separateByCR) {
                _salesbycategory_data.products[prd.id] = {qty: 0, price: 0.0, priceTax: 0.0};
            }
            if (prd.id in _salesbycategory_data.products) {
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
    let customProductLabels = Object.keys(_salesbycategory_data.customProducts).sort()
    // Prepare rendering
    let lines = [];
    for (let i = 0; i < stats.length; i++) {
        let cat = stats[i];

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
        if (!separateByCR) {
            let qty = 0.0;
            let price = 0.0;
            let priceVAT = 0.0;
            let priceBuy = 0.0;
            let margin = 0.0;

            for (let j = 0; j < stats[i].products.length; j++) {
                let prd = stats[i].products[j];

                qty += _salesbycategory_data.products[prd.id].qty;
                price += _salesbycategory_data.products[prd.id].price;
                priceVAT += _salesbycategory_data.products[prd.id].priceTax;
                priceBuy += _salesbycategory_data.products[prd.id].qty * prd.priceBuy
            }
            margin = price - priceBuy

            lines.push([
                img,
                "",
                cat.label,
                cat.reference,
                qty,
                price.toLocaleString(),
                priceBuy.toLocaleString(),
                margin.toLocaleString(),
                priceVAT.toLocaleString()]);

            cat.reference        } else {
            for (let k = 0 ; k < cashRegisters.length; k++) {
                let cr = cashRegisters[k];

                let qty = 0.0;
                let price = 0.0;
                let priceVAT = 0.0;
                let priceBuy = 0.0;
                let margin = 0.0;

                for (let j = 0; j < stats[i].products.length; j++) {
                    let prd = stats[i].products[j];

                    if (cr.id in _salesbycategory_data.products[prd.id]) {
                        qty += _salesbycategory_data.products[prd.id][cr.id].qty;
                        price += _salesbycategory_data.products[prd.id][cr.id].price;
                        priceVAT += _salesbycategory_data.products[prd.id][cr.id].priceTax;
                        priceBuy += _salesbycategory_data.products[prd.id][cr.id].qty * prd.priceBuy
                    }
                }

                margin = price - priceBuy

                lines.push([
                    img,
                    cr.label,
                    cat.label,
                    cat.reference,
                    qty,
                    price.toLocaleString(),
                    priceBuy.toLocaleString(),
                    margin.toLocaleString(),
                    priceVAT.toLocaleString()]);
            }
        }
    }

    // TODO : A category with custom product
    // for (let i = 0; i < customProductLabels.length; i++) {
    //     let productLabel = customProductLabels[i];
    //     if (!separateByCR) {
    //         let qty = _salesbyproduct_data.customProducts[productLabel].qty.toLocaleString();
    //         let price = _salesbyproduct_data.customProducts[productLabel].price.toLocaleString();
    //         let priceTax = _salesbyproduct_data.customProducts[productLabel].priceTax.toLocaleString();
    //         lines.push(["", "", "", "", productLabel, qty, price, "", "", priceTax]);
    //     } else {
    //         for (let k = 0; k < cashRegisters.length; k++) {
    //             let cr = cashRegisters[k];
    //             if (cr.id in _salesbyproduct_data.customProducts[productLabel]) {
    //                 let qty = _salesbyproduct_data.customProducts[productLabel][cr.id].qty;
    //                 let price = _salesbyproduct_data.customProducts[productLabel][cr.id].price.toLocaleString();
    //                 let priceTax = _salesbyproduct_data.customProducts[productLabel][cr.id].priceTax.toLocaleString();
    //                 lines.push(["", cr.label, "" ,"", productLabel, qty, price, "", "", priceTax]);
    //             }
    //         }
    //     }
    // }

    vue.screen.data.table.title = "Ventes par catégorie du "
        + tools_dateToString(vue.screen.data.start)
        + " au "
        + tools_dateToString(vue.screen.data.stop);
    Vue.set(vue.screen.data.table, "lines", lines);

    gui_hideLoading();
}

