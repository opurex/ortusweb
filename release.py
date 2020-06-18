import os
import sys
import shutil

path = os.path.dirname(os.path.realpath(__file__))

version = "v" + sys.argv[1]

css = [
	"res/css/structure.css",
	"res/css/style.css",
]
js = [
	"src/tools.js",
	"src/models/category.js",
	"src/models/product.js",
	"src/models/tariffarea.js",
	"src/models/customer.js",
	"src/models/floor.js",
	"src/models/paymentmode.js",
	"src/models/user.js",
	"src/models/role.js",
	"src/models/cashregister.js",
	"src/models/resource.js",
	"src/models/discountprofile.js",
	"src/models/currency.js",
	"src/srvcall.js",
	"src/login.js",
	"src/storage.js",
	"src/gui.js",
	"src/main.js",
	"src/screens/home.js",
	"src/screens/categories.js",
	"src/screens/products.js",
	"src/screens/tariffareas.js",
	"src/screens/customers.js",
	"src/screens/ztickets.js",
	"src/screens/tickets.js",
	"src/screens/salesbyproduct.js",
	"src/screens/salesdetails.js",
	"src/screens/floors.js",
	"src/screens/paymentmodes.js",
	"src/screens/users.js",
	"src/screens/roles.js",
	"src/screens/cashregisters.js",
	"src/screens/resources.js",
	"src/screens/discountprofiles.js",
	"src/screens/currencies.js",
	"src/views/loading.js",
	"src/views/home.js",
	"src/views/login.js",
	"src/views/message.js",
	"src/views/inputdate.js",
	"src/views/catalogpicker.js",
	"src/views/menu.js",
	"src/views/categories.js",
	"src/views/products.js",
	"src/views/tariffareas.js",
	"src/views/customers.js",
	"src/views/ztickets.js",
	"src/views/tickets.js",
	"src/views/salesbyproduct.js",
	"src/views/salesdetails.js",
	"src/views/floors.js",
	"src/views/table.js",
	"src/views/paymentmodes.js",
	"src/views/users.js",
	"src/views/roles.js",
	"src/views/cashregisters.js",
	"src/views/resources.js",
	"src/views/discountprofiles.js",
	"src/views/currencies.js"
]

css_packed = ""
for c in css:
	file = open(path + "/" + c, "r")
	css_packed = css_packed + file.read()
	file.close()
css_name = path + "/dist/res/css/css-" + version + ".css"
if os.path.isfile(css_name):
	os.remove(css_name)
css_dist = open(css_name, "w")
css_dist.write(css_packed)
css_dist.close()

js_packed = ""
for j in js:
	file = open(path + "/" + j, "r")
	js_packed = js_packed + file.read()
	file.close()
js_name = path + "/dist/js-" + version + ".js"
if os.path.isfile(js_name):
	os.remove(js_name)
js_dist = open(js_name, "w")
js_dist.write(js_packed)
js_dist.close()

shutil.rmtree(path + "/dist/res/fonts", True)
shutil.rmtree(path + "/dist/res/img", True)
shutil.rmtree(path + "/dist/libs", True)
shutil.copytree(path + "/res/fonts", path + "/dist/res/fonts")
shutil.copytree(path + "/res/img", path + "/dist/res/img")
shutil.copytree(path + "/libs", path + "/dist/libs")
#os.remove(path + "/dist/libs/vue-dev.js")
index_file = open(path + "/index_dist.html", "r")
index = index_file.read()
index_file.close()
index = index.replace("css-x.css", "css-" + version + ".css")
index = index.replace("js-x.js", "js-" + version + ".js")
index_file = open(path + "/dist/index.html", "w")
index_file.write(index)
index_file.close()
