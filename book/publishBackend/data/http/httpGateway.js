var http = require('http')
var https = require('https')
var iconv = require('iconv-lite')

exports.htmlStartReq = function(host, path) {
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
                "Content-Type": "text/html"
            },
            timeout: 60000
        }, function(res) {
            var _data = '';
            res.on('data', function(chunk) {
                _data += chunk;
            });
            res.on('end', function() {
                if (res.statusCode == 200) resolve(_data, );
                else {
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

exports.gbkHtmlStartReq = function(host, path) {
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
                // "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Mobile Safari/537.36",
                // "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "Content-Type": "text/html"
            },
            timeout: 60000
        }, function(res) {
            // var _data = '';
            var _data = [];
            res.on('data', function(chunk) {
                // _data += chunk;
                _data.push(chunk);
            });
            res.on('end', function() {
                if (res.statusCode == 200) resolve(iconv.decode(Buffer.concat(_data), 'GBK'));
                else {
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