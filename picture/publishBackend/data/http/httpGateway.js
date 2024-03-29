var http = require('http')
var https = require('https')
var zlib = require('zlib');
var iconv = require('iconv-lite')
var Platserver = require('../../service/platServer.js');

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
                    // console.log("status error", path, _data);
                    reject("status error: " + res.statusCode);
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

exports.htmlFragmentStartReq = function(host, path, charset, body) {
    var _http = http;
    if (/^(https)/.test(host)) _http = https;
    host = host.replace(/https:\/\/|http:\/\//, "");
    return new Promise(function(resolve, reject) {
        var req = _http.request({
            host: host,
            // port: "80",
            path: path,
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            timeout: 10000
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
                    // console.log("status error", path, _data);
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
        req.write(body ? body : "");
        req.end();
    })
}

exports.submitUrlsToBaiduStartReq = function(site, token, body) {
    return new Promise(function(resolve, reject) {
        var server = new Platserver({
            protocol: "http:",
            host: "data.zz.baidu.com",
            port: "80",
            method: "POST",
            path: "/urls?site=" + site + "&token=" + token,
            timeout: 60000
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