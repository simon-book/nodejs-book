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
        if (!body || !body.title || !body.bookType || !body.categoryId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        body.branchId = currentUser.branchId;
        if (!body.sn) {
            var count = await bookSequelize.countBooks({
                branchId: currentUser.branchId
            })
            body.sn = util.prefixInteger(count + 1, 8);
        }
        var added = await bookSequelize.create(body);
        if (body.tags && body.tags.length) {
            var tagIds = _map(body.tags, "tagId");
            await added.setTags(tagIds);
        }
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
        added = added[1][0];
        if (body.tags && body.tags.length) {
            var tagIds = _.map(body.tags, "tagId");
            await added.setTags(tagIds);
        }
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
        if (!body) body = {};
        var pageSize = body.pageSize || 20;
        var page = body.page || 1;
        var offset = pageSize * (page - 1);
        var where = {
            branchId: currentUser.branchId
        }
        if (body.categoryId) where.categoryId = body.categoryId;
        if (body.bookType) where.bookType = body.bookType;
        if (body.publishStatus) where.publishStatus = body.publishStatus;
        if (body.chargeType) where.chargeType = body.chargeType;
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
        if (body.tagIds) {
            var tagWhere = {
                tagId: {
                    [Op.in]: body.tagIds
                }
            }
        }
        var list = await bookSequelize.findAndCountAll(where, offset, pageSize, null, tagWhere);
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