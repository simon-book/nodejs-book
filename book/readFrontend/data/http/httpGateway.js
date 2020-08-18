var https = require('https');
var _ = require('lodash');
var cryptogram = require("../../util/cryptogram.js");
var Platserver = require('../../service/platServer.js');

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