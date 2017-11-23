/* Pasteque JSLib
 *
 * This file is part of Pasteque JSLib
 *
 * Pasteque JSLib is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pasteque JSLib is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// Connection to Pasteque

var Pasteque = (function(mod, status) {

    /** Create a request
     * @param target {string} API name.
     * @param paramkey1 {string} Optional parameter name.
     * @param paramval1 {mixed} Optional parameter value.
     * @param ... Next param arguments. */
    mod.Request = function(target) {
        var params = [];
        var paramCount = (arguments.length - 1) / 2;
        for (var i = 0; i < paramCount; i++) {
            params.push({"key": arguments[i * 2 + 1],
                    "value": arguments[i * 2 + 2]});
        }
        return {"target": target, "params": params};
    }

    var preformatUrl = function(url) {
        var ret = url;
        if (url.substring(0, 4) != 'http') {
            ret = 'http://' + url;
        }
        if (url.substring(url.length - 1) != '/') {
            ret += '/';
        }
        return ret;
    }
    /** Build a GET request URL from connection and request.
     * @param conn {Connection} Connection object.
     * @param req {Request} Request object.
     * @return The url for the request. */
    var getUrlString = function(conn, req) {
        var ret = conn.host + encodeURI(req.target);
        if (req.params.length > 0) { ret += '?'; }
        for (var i = 0; i < req.params.length; i++) {
            var key = req.params[i]['key'];
            var value = req.params[i]['value'];
            if (i > 0) { ret += '&'; }
            ret += encodeURI(key) + '=' + encodeURI(value);
        }
        return ret;
    }
    /** Build a POST request URL from connection and request. */
    var postUrlString = function(conn, req) {
        return conn.host + encodeURI(req.target);
    }
    /** Build a POST body string from connection and request. */
    var postData = function(conn, req) {
        var enc = function(data) {
            var str = (typeof data == 'object') ? JSON.stringify(data) : data;
            return encodeURI(str).replace('%20', '+');
        }
        var dataStr = "";
        for (var i = 0; i < req.params.length; i++) {
            var key = req.params[i]['key'];
            var value = req.params[i]['value'];
            if (i > 0) { dataStr += '&'; }
            dataStr += enc(key) + '=' + enc(value);
        }
        return dataStr;
    }
    /** Get the last valid token or request a new one.
     * continueCallback gets one parameter: the token which is null on failure. */
    var getToken = function(conn, continueCallback, errorCallback) {
        var token = conn['lastToken'];
        if (token == null) {
            // Try to login.
            var req = mod.Request('api/login',
                    'user', conn.user, 'password', conn.password);
            var closureDone = function(conn, callback) {
                return function (request, status, response) {
                    if (status == 200) {
                        var token = request.getResponseHeader('Token');
                        callback(token);
                    }
                }
            }
            ajaxJSON(conn, req, 'POST', closureDone(conn, continueCallback), errorCallback);
         } else {
            continueCallback(token);
        }
    }
    /** Make an low level ajax call to get JSON data.
     * @param conn {Connection} Connection object
     * @param req {Request} The request.
     * @param mode {string} GET or POST..
     * @param callback The callback(req, status, response) */
    var ajaxJSON = function(conn, req, mode, callback) {
        var request = new XMLHttpRequest();
        // Set request callback.
        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE) {
                // Update the token.
                var token = request.getResponseHeader('Token');
                if (token != null) {
                    conn.lastToken = token;
                }
                // Notify callback
                callback(request, request.status, request.responseText);
            }
        };
        // Set other headers and data and send the request.
        var strData = null;
        switch (mode) {
        case 'post':
        case 'POST':
            strData = postData(conn, req);
            request.open('POST', postUrlString(conn, req));
            request.setRequestHeader('Content-type', "application/x-www-form-urlencoded");
            break;
        case 'GET':
        default:
            request.open('GET', getUrlString(conn, req));
            break;
        }
        if (conn.lastToken != null) {
            request.setRequestHeader('Token', conn.lastToken);
        }
        try {
            request.send(strData);
        } catch (error) {
            callback(request, request.status, error);
        }
    }
    /** Initialize server a connection to pass to srv_* functions. */
    mod.Connection = function(host, user, password) {
        return {'host': preformatUrl(host),
                'user': user,
                'password': password,
                'lastToken': null,
               };
    }
    /** Factorisation function for srv_*. */
    var srv_readCall = function(conn, req, mode, success, error) {
        // Closure to pass a valid token to and run the actual call
        var tokenClosure = function(cconn, creq, cmode, csuccess, cerror) {
            return function(token) {
                // The token is null: there wasn't any and login was rejected.
                // The token is not null: it is either an unchecked old one or a fresh new one
                if (token == null) {
                    // Login failed.
                    cerror("Cannot get token");
                } else {
                    // Closure for when the request succeeds to check login and retry
                    // if token has expired.
                    var callbackClosure = function(scconn, screq, scmode, scsuccess, scerror) {
                        return function(req, status, response) {
                            if (status == 403) {
                                // Not logged
                                if (scconn.lastToken != null) {
                                    // The previous token was rejected. Revoke and retry.
                                    scconn.lastToken = null;
                                    getToken(scconn, tokenClosure(scconn, screq, scmode,
                                            scsuccess, scerror), scerror);
                                } else {
                                    // Failed to login.
                                    scerror(req, status, response);
                                }
                            } else if (status == 200) {
                                // Send response.
                                var data = response;
                                try {
                                    data = JSON.parse(data);
                                } catch (e) {
                                    // not json
                                }
                                scsuccess(data);
                            } else {
                                scerror(req, status, response);
                            }
                        }
                    }
                    // Try with the current token
                    ajaxJSON(cconn, creq, cmode,
                            callbackClosure(cconn, creq, cmode, csuccess, cerror));
                }
            }
        }
        // Get the current token or request a fresh one and pass it to tokenClosure.
        getToken(conn, tokenClosure(conn, req, mode, success, error), error);
    }
    /** Read data from server.
     * @param conn {Connection} A server connection object.
     * @param req {Request} A request object.
     * @param success {function} Success callback with JSON data as parameter.
     * @param error {function} Error callback(request, status, response). */
    mod.srv_read = function(conn, req, success, error) {
        srv_readCall(conn, req, 'GET', success, error);
    }
    mod.srv_write = function(conn, req, success, error) {
        srv_readCall(conn, req, 'POST', success, error);
    }
    return mod;
}(Pasteque || {}));
