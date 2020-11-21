function setDbError(err, sql, args) {
    console.error(err, sql, args);
}

function setHttpError(url, reqParams, err) {
    console.error(url, reqParams, err);
}

function setError(args) {
    console.error(args);
}

exports.setDbError = setDbError;
exports.setHttpError = setHttpError;
exports.setError = setError;