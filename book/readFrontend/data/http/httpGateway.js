var https = require('https');
var _ = require('lodash');
var cryptogram = require("../../util/cryptogram.js");
var Platserver = require('../../service/platServer.js');
var request = require('request')
var http = require('http')
var https = require('https')
var zlib = require('zlib')
var iconv = require('iconv-lite')

exports.readerStartReq = function(branchId, action) {
    return new Promise(function(resolve, reject) {
        var server = new Platserver({
            protocol: __plat__.reader_api.protocol,
            host: __plat__.reader_api.host,
            port: __plat__.reader_api.port,
            method: "GET",
            path: "/api/reader/" + branchId + "/" + action,
            timeout: 30000
        });
        try {
            server.request("");
            server.completed(function(result) {
                if (result.rtnCode && result.rtnCode == 10000) {
                    resolve(result.data);
                } else {
                    reject(result);
                }
            });
            server.error(function(e) {
                reject(e);
            });
        } catch (err) {
            reject(err)
        }
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
                "Content-Type": "text/html;"
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
                    console.log("status error", path, _data);
                    reject("status error");
                }


            });
        });
        req.on('error', function(e) {
            console.log("error", path, e);
            reject(e);
        });
        req.on('timeout', function(e) {
            req.abort();
            console.log("timeout", path, e);
            reject("timeout");
        });
        req.write("");
        req.end();
    })
}