// var logger = require("../log4js/logHelper.js").helper;

function setDbError(err, sql, args) {
    // logger.writeErr(['mysql:' + sql, args, err ? (err.stack || err.message) : ""]);
    console.error(err, sql, args);
}

function setHttpError(url, reqParams, err) {
    // logger.writeErr(['Http:' + url, "Body:" + JSON.stringify(reqParams), err ? (err.stack || err.message) : ""]);
    console.error(url, reqParams, err);
}

function setError(args) {
    // logger.writeErr(['COMMON:' + JSON.stringify(args)]);
    console.error(args);
}

exports.setDbError = setDbError;
exports.setHttpError = setHttpError;
exports.setError = setError;