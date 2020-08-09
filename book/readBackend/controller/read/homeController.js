var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var util = require('../../util/index.js');
var branchSequelize = require('../../data/sequelize/branch/branchSequelize.js');
var pageBlockSequelize = require('../../data/sequelize/pageBlock/pageBlockSequelize.js');
var chargeItemSequelize = require('../../data/sequelize/charge/chargeItemSequelize.js');
var bookCategorySequelize = require('../../data/sequelize/book/bookCategorySequelize.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');
var tagSequelize = require('../../data/sequelize/book/tagSequelize.js');

exports.index = async function(req, res) {
    try {
        //可在管理后台一键生成首页内容，缩短数据查询时间
        var branchId = req.params.branchId;
        if (!branchId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        // var branch = await branchSequelize.findOneById(branchId);
        // if (!branch) {
        //     adminHttpResult.jsonFailOut(req, res, "BRANCH_ERROR", "branch不存在！");
        //     return;
        // }
        var blocks = await pageBlockSequelize.findAll({
            branchId: branchId
        });
        var list = await pageBlockSequelize.findIndexBlocksBooks(blocks);
        _.forEach(blocks, function(block, index) {
            // block = block.get();
            block.books = _.map(list[index], "book");
        })
        adminHttpResult.jsonSuccOut(req, res, blocks);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.blockBooks = async function(req, res) {
    try {
        var branchId = req.params.branchId;
        var body = req.query;
        if (!branchId || !body.blockId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var pageSize = body.pageSize || 20;
        var page = body.page || 1;
        var offset = pageSize * (page - 1);
        var list = await pageBlockSequelize.findBlockBooks(body.blockId, offset, pageSize);
        adminHttpResult.jsonSuccOut(req, res, {
            list: _.map(list.rows, "book"),
            pagination: {
                totalNum: list.count,
                page: page,
                pageSize: pageSize
            }
        });
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.rankBooks = async function(req, res) {
    try {
        var branchId = req.params.branchId;
        if (!branchId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var body = req.query;
        var pageSize = body.pageSize || 20;
        var page = body.page || 1;
        var offset = pageSize * (page - 1);
        var list = await bookSequelize.findAndCountAll({
            branchId: branchId
        }, offset, pageSize, [
            ["readCount", "DESC"]
        ]);
        adminHttpResult.jsonSuccOut(req, res, {
            list: list[1],
            pagination: {
                totalNum: list[0],
                page: page,
                pageSize: pageSize
            }
        });
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.vipBlockBooks = async function(req, res) {
    try {
        var branchId = req.params.branchId;
        var body = req.query;
        if (!branchId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var pageSize = body.pageSize || 20;
        var page = body.page || 1;
        var offset = pageSize * (page - 1);
        var list = await bookSequelize.findAndCountAll({
            branchId: branchId,
            vipOnly: true
        }, offset, pageSize, [
            ["updatedAt", "DESC"]
        ]);
        adminHttpResult.jsonSuccOut(req, res, {
            list: list[1],
            pagination: {
                totalNum: list[0],
                page: page,
                pageSize: pageSize
            }
        });
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}