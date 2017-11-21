/**
 * Created by jjohnson on 12/9/13.
 */

var https = require("https");
var url = require("url");
var request = require("request");


class NetworkAbstraction {

    constructor(key, clientId, clientSecret, domain, preview, auth, connAPI) {
        this.hostname = domain;
        this.hostname += ".";
        this.hostname += (!preview ? "okta.com" : "oktapreview.com");
        this.apiVersion = "v1";
        let apiKey = key;
        let clientAuth = new Buffer(clientId + ":" + clientSecret).toString('base64')
        this.connectAPI = connAPI || 'api'

        switch (auth) {
            case "Basic":
                this.authorization = "Basic " + clientAuth
                break;
            case "Bearer":
                this.authorization = "Bearer " + apiKey
                break;
            default:
                this.authorization = "SSWS " + apiKey
                break;
        }
    }

    get(what, query, followLink, callback) {
        this.sendHttpReqNoBody("GET", this.constructURL(what), query, followLink, callback);
    }

    post(where, what, query, callback) {
        this.sendHttpReq("POST", this.constructURL(where), what, query, callback);
    }

    postForm(where, what, query, callback) {
        this.sendHttpReqForm("POST", this.constructURL(where), what, query, callback);
    }

    put(where, what, query, callback) {
        this.sendHttpReq("PUT", this.constructURL(where), what, query, callback);
    }

    delete(where, query, callback) {
        this.sendHttpReqNoBody("DELETE", this.constructURL(where), query, callback);
    }

    handleResponse(error, followLink, clientResp, resp, callback) {
        //console.log(require('util').inspect(clientResp, {depth:null}));
        if (callback == undefined) return;
        if (error) {
            callback({error: error, success: false});
        } else {
            var jsonResp;
            if (clientResp.statusCode == 200) {
                try {
                    jsonResp = JSON.parse(resp);
                } catch (err) {
                    callback({success: false, paged: false, error: "Returned JSON is invalid", resp: resp});
                }
                var outObj = {success: true, paged: false};
                if (jsonResp.obj != undefined) outObj.resp = jsonResp.obj;
                else outObj.resp = jsonResp;
                if (clientResp.headers.link != undefined) {
                    // Follow Pagination links
                    outObj.paged = true;
                    outObj.pageEnd = true;
                    var links = clientResp.headers.link.split(",");
                    var hasNext = false;
                    for (i in links) {
                        var link = links[i];
                        var bits = link.split(";");
                        if (bits[1] == " rel=\"next\"") {
                            var finalLink = bits[0].substr(2, bits[0].length - 3);
                            outObj.pageEnd = false;
                            if (!followLink) {
                                outObj.next = finalLink;
                                break;
                            }
                            else
                                this.sendHttpReqNoBody("GET", finalLink, null, callback);
                        }
                    }
                }
                callback(outObj);
            } else if (clientResp.statusCode == 204) {
                callback({success: true, paged: false});
            } else if (clientResp.statusCode == 401) {
                try {
                    resp = JSON.parse(resp);
                } catch (err) {
                    // no-op
                }
                callback({success: false, paged: false, error: "Unauthorized", resp: resp});
            } else {
                callback({
                    success: false,
                    paged: false,
                    error: "Received HTTP Status code: " + clientResp.statusCode,
                    resp: resp
                })
            }
        }
    }

    // POST and PUT requests are mostly identical.
    sendHttpReqForm(method, where, what, query, callback) {
        var opts = {};

        opts.form = what
        opts.headers = {};
        opts.headers['Content-Type'] = "application/x-www-form-urlencoded";
        opts.headers['Accept'] = "application/json";
        opts.headers['Authorization'] = this.authorization
        opts.method = method;
        opts.uri = url.parse(where);
        if (query != null) opts.qs = query;
        request(opts, (error, clientResp, resp) => {
            this.handleResponse(error, false, clientResp, resp, callback)
    })
    }

    // POST and PUT requests are mostly identical.
    sendHttpReq(method, where, what, query, callback) {
        var opts = {};
        if (what == undefined) opts.body = "";
        else opts.body = what;
        opts.headers = {};
        // opts.headers['Content-Length'] = opts.body.length;
        // opts.headers['Content-Type'] = "application/json";
        opts.headers['Accept'] = "application/json";
        opts.headers['Authorization'] = this.authorization
        opts.method = method;
        opts.json = true;
        opts.encoding = 'utf-8';
        opts.uri = url.parse(where);
        if (query != null) opts.qs = query;
        request(opts, (error, clientResp, resp) => {
            this.handleResponse(error, false, clientResp, JSON.stringify(resp || {}), callback)
    });
    }

    /*
     *   Old version did not have followLink flag, so to support backwards compatibility
     *   we check if followLink is a function
     *   if so, the caller is expecting the old version of this function,
     *   if followLink is a boolean, caller is expecting new version
     *
     *   *NOTE* all this is only relevant to Listing functions, nothing else uses filters
     */
    sendHttpReqNoBody(method, where, query, followLink, callback) {
        var opts = {};
        //check if followLink is a function, if so do backwards compatable support
        //if not, proceed normally
        if (typeof followLink == 'function') {
            //set nonexistant callback to followLink
            callback = followLink;
            //default followLink flag to true
            followLink = true;
        }
        if (query != null) opts.qs = query;
        opts.headers = {};
        opts.headers['Authorization'] = this.authorization;
        opts.headers['Accept'] = 'application/json';
        opts.method = method;
        opts.uri = url.parse(where);
        request(opts, (error, clientResp, resp) => {
            this.handleResponse(error, followLink, clientResp, resp, callback)
    });
    }



    constructURL(what) {
        return "https://" + this.hostname + "/" + this.connectAPI + "/" + this.apiVersion + "/" + what;
    }
}

module.exports = NetworkAbstraction;