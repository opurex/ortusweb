import os
import sys
import shutil
import re
from pathlib import Path

def print_help():
    print("Usage:")
    print("  python3 release.py <version>")
    print("Example:")
    print("  python3 release.py 5.9.2025")
    print("\nThis will:")
    print(" - Pack CSS and JS files listed in index.html")
    print(" - Replace placeholders in index_dist.html")
    print(" - Output to dist/ folder as versioned files (e.g., css-v5.9.2025.css)")
    print(" - Copy necessary static assets to dist/")
    sys.exit(1)

# Check for version argument
if len(sys.argv) != 2 or sys.argv[1] in ["-h", "--help"]:
    print_help()

version = "v" + sys.argv[1]
path = os.path.dirname(os.path.realpath(__file__))

# Compile regex to find CSS and JS files in index.html
css_regex = re.compile('<link rel="stylesheet" type="text/css" href="res/css/(.+)">')
src_regex = re.compile('<script type="text/javascript" src="src/(.+)"></script>')

# Read index.html
with open(os.path.join(path, "index.html"), "r") as index_file:
    index = index_file.read()

css = css_regex.findall(index)
js = src_regex.findall(index)

# Generate packed CSS
css_packed = ""
for c in css:
    with open(os.path.join(path, "res/css", c), "r") as file:
        css_packed += file.read()

css_name = os.path.join(path, "dist/res/css", f"css-{version}.css")
os.makedirs(os.path.dirname(css_name), exist_ok=True)
if os.path.isfile(css_name):
    os.remove(css_name)

with open(css_name, "w") as css_dist:
    css_dist.write(css_packed)

# Generate packed JS
js_packed = ""
for j in js:
    with open(os.path.join(path, "src", j), "r") as file:
        js_packed += file.read()

js_name = os.path.join(path, "dist", f"js-{version}.js")
os.makedirs(os.path.dirname(js_name), exist_ok=True)
if os.path.isfile(js_name):
    os.remove(js_name)

with open(js_name, "w") as js_dist:
    js_dist.write(js_packed)

# Clean and copy assets
shutil.rmtree(os.path.join(path, "dist/res/fonts"), ignore_errors=True)
shutil.rmtree(os.path.join(path, "dist/res/img"), ignore_errors=True)
shutil.rmtree(os.path.join(path, "dist/libs"), ignore_errors=True)

shutil.copytree(os.path.join(path, "res/fonts"), os.path.join(path, "dist/res/fonts"))
shutil.copytree(os.path.join(path, "res/img"), os.path.join(path, "dist/res/img"))
shutil.copytree(os.path.join(path, "libs"), os.path.join(path, "dist/libs"))

# Remove dev versions of Vue
for p in Path(os.path.join(path, "dist/libs")).glob("vue-*.*.*-dev.js"):
    p.unlink()

# Create final index.html
with open(os.path.join(path, "index_dist.html"), "r") as index_file:
    index = index_file.read()

index = index.replace("css-x.css", f"css-{version}.css")
index = index.replace("js-x.js", f"js-{version}.js")

with open(os.path.join(path, "dist/index.html"), "w") as index_file:
    index_file.write(index)
