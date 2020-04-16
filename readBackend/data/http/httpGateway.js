var https = require('https');
var _ = require('lodash');
var cryptogram = require("../../util/cryptogram.js");
var Platserver = require('../../service/platServer.js');

exports.payStartReq = function (body, action) {
    return new Promise(function (resolve, reject) {
        var server = new Platserver({
            host: __plat__.api_qianhub.host,
            port: __plat__.api_qianhub.port,
            path: "/pay/gateway?method=" + action + "&id=3303",
            timeout: 30000
        });
        var signContent = cryptogram.hmacEncrypt(JSON.stringify(body), "1000");
        server.insertHeader("X-QianHub-App", "1000");
        server.insertHeader("X-QianHub-Sign", signContent);
        try {
            server.request(body);
            server.completed(function (result) {
                if (!result.error_code && result.payInfo) {
                    resolve(result.payInfo);
                } else {
                    reject(result);
                }
            });
            server.error(function (e) {
                reject(e);
            });
        } catch (err) {
            reject(err)
        }
    })
}

exports.memberServiceStartReq = function (body, action) {
    return new Promise(function (resolve, reject) {
        var server = new Platserver({
            host: __plat__.sk.host,
            port: __plat__.sk.port,
            path: "/shunke/memberOpen/member-service?method=VipService." + action,
            timeout: 30000
        });
        try {
            server.request(body);
            server.completed(function (result) {
                if (!result.error_code) {
                    resolve(result);
                } else {
                    reject(result);
                }
            });
            server.error(function (e) {
                reject(e);
            });
        } catch (err) {
            reject(err)
        }
    })
}

exports.refundOrderReq = function (body) {
    return new Promise(function (resolve, reject) {
        var server = new Platserver({
            protocol: __plat__.api_qianhub.protocol,
            host: __plat__.api_qianhub.host,
            port: __plat__.api_qianhub.port,
            path: "/pay/gateway?method=" + "PayService.RefundOrder" + "&id=123",
            timeout: 30000
        });
        var signContent = cryptogram.hmacEncrypt(JSON.stringify(body), "1000");
        server.insertHeader("X-QianHub-App", "1000");
        server.insertHeader("X-QianHub-Sign", signContent);
        try {
            server.request(body);
            server.completed(function (result) {
                if (!result.error_code) {
                    resolve(result);
                } else {
                    reject(result);
                }
            });
            server.error(function (e) {
                reject(e);
            });
        } catch (err) {
            reject(err)
        }
    })
}

exports.amapServiceReq = function (origin, destination) {
    return new Promise(function (resolve, reject) {
        var server = new Platserver({
            host: "restapi.amap.com",
            port: "80",
            method: "GET",
            path: '/v4/direction/bicycling?origin=' + origin + '&destination=' + destination + '&key=ed66020fb354ea91537d9283dbfbe564',
            timeout: 30000
        });
        try {
            server.request({});
            server.completed(function (result) {
                if (result.errcode == 0) {
                    resolve(result.data.paths[0]);
                } else reject({
                    message: result.errdetail
                })
            });
            server.error(function (e) {
                reject(e);
            });
        } catch (err) {
            reject(err)
        }
    })
}

exports.SFOrderReq = function (params, action) {
    return new Promise(function (resolve, reject) {
        var server = new Platserver({
            host: __plat__.api_qianhub.host,
            port: __plat__.api_qianhub.port,
            path: "/delivery/gateway?method=" + action + "&id=3303",
            timeout: 30000
        });
        var signContent = cryptogram.hmacEncrypt(JSON.stringify(params), "1000");
        server.insertHeader("X-QianHub-App", "1000");
        server.insertHeader("X-QianHub-Sign", signContent);
        try {
            server.request(params);
            server.completed(function (result) {
                if (!result.error_code) {
                    resolve(result);
                } else {
                    reject(result);
                }
            });
            server.error(function (e) {
                reject(e);
            });
        } catch (err) {
            reject(err)
        }
    })
}