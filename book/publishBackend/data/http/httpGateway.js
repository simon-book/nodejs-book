var http = require('http')
var https = require('https')

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
                "Content-Type": "text/html; charset=utf-8"
            },
            timeout: 60000
        }, function(res) {
            var _data = '';
            res.on('data', function(chunk) {
                _data += chunk;
            });
            res.on('end', function() {
                if (res.statusCode == 200) resolve(_data);
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