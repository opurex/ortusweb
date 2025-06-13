Vue.component("vue-menu", {
	props: ["menu", "user"],
	data: function() {
		return {
			openedMenu: null,
		};
	},
	template: `<nav id="menu" class="navbar">
	<input type="checkbox" id="menu-collapser" aria-expanded="false" v-show="menu.visible">
	<label for="menu-collapser">Menu</label>
	<a class="navbar-brand" href="?p=home">
		<img alt="Opurex Pos Logo" class="img-responsive img-thumbnail" src="res/img/logo.png">
	</a>
	<ul id="main-menu" v-show="menu.visible">
		<li class="dropdown" v-bind:class="{expanded: (openedMenu == index)}" v-for="section, index in menu.sections">
			<button v-on:click="expandMenu(index)" aria-haspopup="true" v-bind:aria-expanded="isExpanded(index)">{{section.name}}</button>
			<ul class="dropdown-menu" v-if="openedMenu == index">
				<li v-for="item in section.items">
					<template v-if="item.target">
						<a v-bind:style="item.icon" v-bind:href="item.target">{{item.name}}</a>
					</template>
					<template v-else>
						<a v-bind:style="item.icon" v-on:click="item.action();return false;" href="#">{{item.name}}</a>
					</template>
				</li>
			</ul>
		</li>
	</ul>
	<ul id="user-menu">
		<li class="dropdown" v-bind:class="{expanded: (openedMenu == menu.sections.length)}">
			<button v-on:click="expandMenu(menu.sections.length)" aria-haspopup="true" v-bind:aria-expanded="isExpanded(menu.sections.length)">{{user}}</button>
			<ul class="dropdown-menu" v-if="openedMenu == menu.sections.length">
				<li v-for="item in menu.user">
					<template v-if="item.target">
						<a v-bind:style="item.icon" v-bind:href="item.target">{{item.name}}</a>
					</template>
					<template v-else>
						<a v-bind:style="item.icon" v-on:click="item.action();return false;" href="#">{{item.name}}</a>
					</template>
				</li>
			</ul>
		</li>
	</ul>
</nav>
`,
	methods: {
		expandMenu: function(index) {
			this.openedMenu = (this.openedMenu === index) ? null : index;
		},
		isExpanded: function(index) {
			return this.openedMenu === index ? "true" : "false";
		}
	}
});


// TODO: this section should be moved in the controller
function _menu_getTargetUrl(target) {
	return "?p=" + target;
}

function _menu_getIcon(icon) {
	let style = "background-repeat: no-repeat; background-position: 2px 50%; padding-left: 25px;";
	if (icon) {
		return style + " background-image:url('res/img/" + icon + "');";
	} else {
		return style + " background-image:url('res/img/menu_default.png');";
	}
}

function menu_init() {
	return {
		"sections": [
			{
				"name": "Catalog",
				"items": [
					{"target": _menu_getTargetUrl("categories"), "name": "Categories", "icon": _menu_getIcon("menu_category.png")},
					{"target": _menu_getTargetUrl("products"), "name": "Products", "icon": _menu_getIcon("menu_product.png")},
					{"target": _menu_getTargetUrl("tariffareas"), "name": "Tariff Zones", "icon": _menu_getIcon("menu_tariffarea.png")},
					{"target": _menu_getTargetUrl("customers"), "name": "Customers", "icon": _menu_getIcon("menu_customer.png")},
					{"target": _menu_getTargetUrl("discountprofiles"), "name": "Discount Profiles", "icon": _menu_getIcon("menu_discountprofile.png")},
					{"target": _menu_getTargetUrl("producttags"), "name": "Tags", "icon": _menu_getIcon("menu_producttags.png")},
				]
			},
			{
				"name": "Sales",
				"items": [
					{"target": _menu_getTargetUrl("sales_z"), "name": "Final Tickets", "icon": _menu_getIcon(null)},
					{"target": _menu_getTargetUrl("sales_tickets"), "name": "Tickets", "icon": _menu_getIcon(null)},
					{"target": _menu_getTargetUrl("salesbyproduct"), "name": "By Product", "icon": _menu_getIcon(null)},
					{"target": _menu_getTargetUrl("salesbycategory"), "name": "By Category", "icon": _menu_getIcon(null)},
					{"target": _menu_getTargetUrl("salesdetails"), "name": "Details", "icon": _menu_getIcon(null)},
				]
			},
			{
				"name": "Accounting",
				"items": [
					{"target": _menu_getTargetUrl("accounting_z"), "name": "Final Records", "icon": _menu_getIcon(null)},
					{"target": _menu_getTargetUrl("accounting_config"), "name": "Settings", "icon": _menu_getIcon(null)},
				]
			},
			{
				"name": "Settings",
				"items": [
					{"target": _menu_getTargetUrl("floors"), "name": "Table Plan", "icon": _menu_getIcon("menu_floors.png")},
					{"target": _menu_getTargetUrl("cashregisters"), "name": "Cash Registers", "icon": _menu_getIcon("menu_cashregister.png")},
					{"target": _menu_getTargetUrl("paymentmodes"), "name": "Payment Methods", "icon": _menu_getIcon("menu_paymentmode.png")},
					{"target": _menu_getTargetUrl("currencies"), "name": "Currencies", "icon": _menu_getIcon("menu_currencies.png")},
					{"target": _menu_getTargetUrl("taxes"), "name": "VAT", "icon": _menu_getIcon("menu_tax.png")},
					{"target": _menu_getTargetUrl("users"), "name": "Users", "icon": _menu_getIcon("menu_user.png")},
					{"target": _menu_getTargetUrl("roles"), "name": "Permissions", "icon": _menu_getIcon("menu_role.png")},
					{"target": _menu_getTargetUrl("resources"), "name": "Customization", "icon": _menu_getIcon("menu_resources.png")},
				]
			}
		],
		"user": [
			{"target": _menu_getTargetUrl("preferences"), "name": "Preferences", "icon": _menu_getIcon("menu_preferences.png")},
			{"action": login_logout, "name": "Log Out", "icon": _menu_getIcon("menu_logout.png")},
		],
		"visible": true
	}
}
