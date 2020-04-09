var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var util = require('../../util/index.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');

exports.create = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.body;
        if (!body || !body.title || !body.bookType || !body.category1Id) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        body.branchId = currentUser.branchId;
        var added = await bookSequelize.create(body);
        adminHttpResult.jsonSuccOut(req, res, added);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.update = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.body;
        if (!body || !body.bookId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var book = await bookSequelize.findByPk(body.bookId);
        if (!book || book.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "BOOK_ERROR", "book不存在");
            return;
        }
        // delete body.chapterCount;
        // delete body.lastChapterId;
        // delete body.coinCount;
        // delete body.readCount;
        var added = await bookSequelize.update(body, {
            bookId: body.bookId
        })
        adminHttpResult.jsonSuccOut(req, res, true);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.delete = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.params;
        if (!body || !body.bookId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var book = await bookSequelize.findByPk(body.bookId);
        if (!book || book.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "BOOK_ERROR", "book不存在");
            return;
        }
        book.set("statusId", 0);
        await book.save();
        adminHttpResult.jsonSuccOut(req, res, true);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.list = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.body;
        if (!body) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var pageSize = body.pageSize || 20;
        var page = body.page || 1;
        var offset = pageSize * (page - 1);
        var where = {
            branchId: currentUser.branchId
        }
        if (body.categoryId) where[[Op.or]] = [{
            category1Id: {
                [Op.in]: body.categoryId
            }
        }, {
            category2Id: {
                [Op.in]: body.categoryId
            }
        }];
        if (body.bookType) where.bookType = {
            [Op.in]: body.bookType
        }
        if (body.publishStatus) where.publishStatus = {
            [Op.in]: body.publishStatus
        }
        if (body.chargeType) where.chargeType = {
            [Op.in]: body.chargeType
        }
        if (body.searchContent) where[[Op.or]] = [{
            title: {
                [Op.like]: '%' + body.searchContent + '%'
            }
        }, {
            keywords: {
                [Op.like]: '%' + body.searchContent + '%'
            }
        }, {
            writer: {
                [Op.like]: '%' + body.searchContent + '%'
            }
        }];
        var list = await bookSequelize.findAndCountAll(where, offset, pageSize);
        adminHttpResult.jsonSuccOut(req, res, {
            list: list.rows,
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