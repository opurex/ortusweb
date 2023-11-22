import os
import sys
import shutil
import re
from pathlib import Path

path = os.path.dirname(os.path.realpath(__file__))

version = "v" + sys.argv[1]

# List css and javascript source files from index.html
css_regex = re.compile('<link rel="stylesheet" type="text/css" href="res/css/(.+)">')
src_regex = re.compile('<script type="text/javascript" src="src/(.+)"></script>')

index_file = open(path + "/index.html", "r")
index = index_file.read()
index_file.close()

css = css_regex.findall(index)
js = src_regex.findall(index)

# Generate packed css and javascript files
css_packed = ""
for c in css:
	file = open(path + "/res/css/" + c, "r")
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
	file = open(path + "/src/" + j, "r")
	js_packed = js_packed + file.read()
	file.close()
js_name = path + "/dist/js-" + version + ".js"
if os.path.isfile(js_name):
	os.remove(js_name)
js_dist = open(js_name, "w")
js_dist.write(js_packed)
js_dist.close()

# Clear dist libs and update them
shutil.rmtree(path + "/dist/res/fonts", True)
shutil.rmtree(path + "/dist/res/img", True)
shutil.rmtree(path + "/dist/libs", True)
shutil.copytree(path + "/res/fonts", path + "/dist/res/fonts")
shutil.copytree(path + "/res/img", path + "/dist/res/img")
shutil.copytree(path + "/libs", path + "/dist/libs")
for p in Path(path + "/dist/libs").glob("vue-*.*.*-dev.js"):
	p.unlink()

# Create index.html from index_dist.html and packed files
index_file = open(path + "/index_dist.html", "r")
index = index_file.read()
index_file.close()
index = index.replace("css-x.css", "css-" + version + ".css")
index = index.replace("js-x.js", "js-" + version + ".js")
index_file = open(path + "/dist/index.html", "w")
index_file.write(index)
index_file.close()
