var https = require('https');
var _ = require('lodash');
var cryptogram = require("../../util/cryptogram.js");
var Platserver = require('../../service/platServer.js');

exports.payStartReq = function(body, action) {
    return new Promise(function(resolve, reject) {
        var server = new Platserver({
            protocol: __plat__.reader_api.protocol,
            host: __plat__.reader_api.host,
            port: __plat__.reader_api.port,
            path: "/api/reader/" + action,
            timeout: 30000
        });
        try {
            server.request(body);
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