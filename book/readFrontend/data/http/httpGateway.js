var https = require('https');
var _ = require('lodash');
var cryptogram = require("../../util/cryptogram.js");
var Platserver = require('../../service/platServer.js');
var request = require('request')
var http = require('http')
var https = require('https')
var zlib = require('zlib')
var iconv = require('iconv-lite')

var branchUpdateUrl = {
    "1": {
        protocol: "http:",
        host: __plat__.mossServer.host,
        port: "3801",
        path: "biquge"
    },
    "2": {
        protocol: "http:",
        host: __plat__.mossServer.host,
        port: "3802",
        path: "dashen"
    },
    "3": {
        protocol: "http:",
        host: __plat__.mossServer.host,
        port: "3803",
        path: "ibs"
    }
}

exports.publishUpdateStartReq = function(branchId, action, body) {
    return new Promise(function(resolve, reject) {
        var server = new Platserver({
            protocol: branchUpdateUrl[branchId].protocol,
            host: branchUpdateUrl[branchId].host,
            port: branchUpdateUrl[branchId].port,
            method: "POST",
            path: "/api/publisher/" + branchUpdateUrl[branchId].path + "/" + action,
            timeout: 5000
        });
        try {
            server.request(body);
            server.completed(function(result) {
                resolve(result);
            });
            server.error(function(e) {
                reject(e);
            });
        } catch (err) {
            reject(err)
        }
    })
}

exports.mossServerStartReq = function(method, path, body) {
    var _http = http;
    return new Promise(function(resolve, reject) {
        var req = _http.request({
            host: __plat__.mossServer.host,
            port: __plat__.mossServer.port,
            method: method,
            path: path,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            timeout: 60000
        }, function(res) {
            var _data = "";
            res.on('data', function(chunk) {
                _data += chunk;
            });
            res.on('end', function() {
                if (res.statusCode == 200) {
                    resolve(_data);
                } else {
                    resolve(false);
                }
            });
        });
        req.on('error', function(e) {
            console.log("error", e);
            resolve(false);
        });
        req.on('timeout', function(e) {
            req.abort();
            console.log("timeout", e);
            resolve(false);
        });
        req.write(body ? JSON.stringify(body) : "");
        req.end();
    })
}

exports.htmlStartReq = function(host, path, charset) {
    var _http = http;
    if (/^(https)/.test(host)) _http = https;
    host = host.replace(/https:\/\/|http:\/\//, "");
    return new Promise(function(resolve, reject) {
        var req = _http.request({
            host: host,
            // port: "80",
            path: path,
            method: 'GET',
            headers: {
                "Content-Type": "text/html;",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.109 Safari/537.36"
            },
            timeout: 60000
        }, function(res) {
            var contentEncoding = res.headers['content-encoding'];
            var _data = [];
            res.on('data', function(chunk) {
                _data.push(chunk);
            });
            res.on('end', function() {
                if (res.statusCode == 200) {
                    try {
                        var body = Buffer.concat(_data);
                        if (charset && charset != "utf-8" && charset != "UTF-8") {
                            resolve(iconv.decode(body, charset));
                        } else {
                            if (contentEncoding && contentEncoding == "gzip") {
                                body = zlib.gunzipSync(body)
                            }
                            resolve(body);
                        }
                    } catch (err) {
                        console.log(path, err);
                        reject(err);
                    }
                } else {
                    console.log("status error", host + path);
                    reject("status error");
                }


            });
        });
        req.on('error', function(e) {
            console.log("error", path);
            reject(e);
        });
        req.on('timeout', function(e) {
            req.abort();
            console.log("timeout", path);
            reject("timeout");
        });
        req.write("");
        req.end();
    })
}