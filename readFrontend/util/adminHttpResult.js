var RtnCode = require('./RtnCode.js');

function jsonFailOut(req, res, errCode, errMsg, data) {
    var data = data || {};
    var rtnCode = RtnCode[errCode];

    res.set({
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin': '*'
    });
    res.status(400).send({
        data: data,
        rtnCode: rtnCode ? rtnCode[0] : "10002",
        rtnMsg: errMsg || (rtnCode ? rtnCode[1] : "服务器异常")
    });
}

function jsonSuccOut(req, res, data) {
    res.set({
        'Content-Type': 'text/json',
        'Access-Control-Allow-Origin': '*'
    });
    res.send({
        rtnCode: 10000,
        data: data
    });
}


exports.jsonFailOut = jsonFailOut;
exports.jsonSuccOut = jsonSuccOut;