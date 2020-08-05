var http = require('http')
var https = require('https')

exports.htmlStartReq = function(uri) {
    var _http = http;
    if (/^(https)/.test(uri)) _http = https;
    return new Promise(function(resolve, reject) {
        _http.get(uri, (res) => {
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                resolve(rawData);
            });
        }).on('error', (e) => {
            reject(e);
        });
    })
}