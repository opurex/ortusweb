# Pasteque JSAdmin

JSAdmin is a lightweight full-javascript back-office for Pasteque. It can connect to any API provided the remote API granted the access. The aim on this back-office is to provide the common features from a super-easy to maintain and shared instance. It does not and will never allow to register sales.

## Installation

JSAdmin works without any particular installation or configuration. Just put the files on your web server and that's it. It can run locally as well without any web server but this has a drawback because of CORS.

### Development/test installation

To install JSAdmin on a server, just put the files into a directory readable by the HTTP server and run index.html to start.

It will use the development version of VueJS and all files directly from `src`. There is no project management tool.

### Release

A release version can be "compiled" with *release.py*. This script concatenates all javascript and css files into two files named with the version number, as well as using the release version of VueJS. It allows long-term caching (except for index.html for upgrades) and slightly enhances performances. To prepare a release, just run `python release.py <version number>`. Then upload the content of the `dist` directory to your server.

You may keep the javascript and css files from the previous versions in case index.html is still served from cache for a little time.

### Allowing access from the API

When JSAdmin is served from an other domain from the API, it requires the API to allow the requests (because of CORS). In the configuration file of the API, add the domain from where JSAdmin is served into `allowed_hosts`. To accept calls from local files (that is, with file:// from your browser), the API must accept everything (`allowed_hosts = *`), which is not a recommended setting.

When JSAdmin is installed on the same domain as the API, there is nothing more to configure.

## Troubleshoting

### Cannot access to the local database

JSAdmin uses the IndexedDB of the client's browser. This feature is not available in private navigation or when the security policies are very strict.

Make sure you are not using the private navigation mode and that local data can be stored.

To erase the local data, just disconnect on the home page before closing the tab/browser.

### Cannot connect to the server

The CORS restriction are applied on the client's browser. When this is the case, the request is not even sent to the API and there may be no error message except in the console of the browser.

Make sure the domain is accepted by the targeted API by checking the `allowed_hosts` in the configuration file. To check if the error comes from CORS restriction, you may temporarily set it to `*`. If it works, you can accept more precise sources. If it doesn't change anything, this is not related to CORS.

When the API accpets only HTTPS, make sure the secure connection checkbox is checked (it is by default).

## Caching/How to use

JSAdmin uses the cache from the browser to speed up things. After the first connection, this cache is empty. Press the reload data button on the home page to fill this cache and access to the menu. Reload the cache frequently to avoid data mismatch, especially when the back-office is accessed from different computers.

This also allows to browse the pages without connecting to the API for a long time. When a request is sent to the API (like when saving something), it will be asked to reconnect then send the request when required. When the session is timed-out, the images will display as broken links.
