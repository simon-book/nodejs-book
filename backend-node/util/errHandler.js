var logger = require("../log4js/logHelper.js").helper;

function setDbError(err, sql, args) {
    logger.writeErr(['mysql:' + sql, args, err ? (err.stack || err.message) : ""]);
    console.error('mysql:' + sql, args, err ? (err.stack || err.message) : "");
}

function setHttpError(url, reqParams, err) {
    logger.writeErr(['Http:' + url, "Body:" + JSON.stringify(reqParams), err ? (err.stack || err.message) : ""]);
    console.error('Http:' + url, JSON.stringify(reqParams), err ? (err.stack || err.message) : "");
}

function setError(args) {
    logger.writeErr(['COMMON:' + JSON.stringify(args)]);
    console.error('COMMON:' + JSON.stringify(args));
}

exports.setDbError = setDbError;
exports.setHttpError = setHttpError;
exports.setError = setError;