Startup and routing
===================

The startup routine is set in `boot()` in `main.js`, which will setup Vue and the local storage.

Routing is done from the `GET` parameter `p`, which is passed to `route(screen)` in the same file. Routing consists in calling the according screen initialization method. When the route is not defined, the home screen is displayed.
