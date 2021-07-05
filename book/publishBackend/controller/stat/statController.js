var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var util = require('../../util/index.js');
var visitStatSequelize = require('../../data/sequelize/visitStatSequelize.js');

exports.getUV = async function(req, res) {
    try {
        var page = parseInt(req.params.page || 1);
        var pageSize = parseInt(req.params.pageSize || 30);
        var offset = (page - 1) * pageSize;
        var result = await visitStatSequelize.findAndCountAll({}, offset, pageSize);
        // console.log(result);
        res.render('uv', {
            title: "uv",
            list: result.rows,
            pagination: {
                totalNum: result.count,
                currentPage: page,
                totalPage: Math.ceil(result.count / pageSize)
            }
        });
    } catch (err) {
        console.log(err.stack || err.info || err);
        res.render('error', {
            message: "请求错误！",
            error: err ? err.stack || err.info || err : ""
        });
    }
}