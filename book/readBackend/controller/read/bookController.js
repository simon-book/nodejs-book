var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var util = require('../../util/index.js');
var bookCategorySequelize = require('../../data/sequelize/book/bookCategorySequelize.js');
var tagSequelize = require('../../data/sequelize/book/tagSequelize.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');

exports.listCategory = async function(req, res) {
    try {
        var branchId = req.params.branchId;
        var body = req.query;
        if (!branchId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var list = await bookCategorySequelize.findAll({
            branchId: branchId
        });
        adminHttpResult.jsonSuccOut(req, res, list);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.listTag = async function(req, res) {
    try {
        var branchId = req.params.branchId;
        var body = req.query;
        if (!branchId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var list = await tagSequelize.findAll({
            branchId: branchId
        });
        adminHttpResult.jsonSuccOut(req, res, list);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.listCategoryAndTag = async function(req, res) {
    try {
        var branchId = req.params.branchId;
        var body = req.query;
        if (!branchId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var categoryList = await bookCategorySequelize.findAll({
            branchId: branchId
        });
        var tagList = await tagSequelize.findAll({
            branchId: branchId
        });
        adminHttpResult.jsonSuccOut(req, res, {
            categoryList: categoryList,
            tagList: tagList
        });
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.listBook = async function(req, res) {
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
        var where = {
            branchId: branchId
        }
        if (body.categoryId) where.categoryId = body.categoryId;
        if (body.bookType) where.bookType = body.bookType;
        if (body.publishStatus) where.publishStatus = body.publishStatus;
        if (body.chargeType) where.chargeType = body.chargeType;
        if (body.searchContent) where[Op.or] = [{
            title: {
                [Op.like]: '%' + body.searchContent + '%'
            }
        }, {
            writer: {
                [Op.like]: '%' + body.searchContent + '%'
            }
        }];
        if (body.tagId) {
            var tagWhere = {
                tagId: body.tagId
            }
        }
        var list = await bookSequelize.findAndCountAll(where, offset, pageSize, null, tagWhere);
        adminHttpResult.jsonSuccOut(req, res, {
            list: _.map(list[1], function(book) {
                // book = book.get();
                // book.categoryName = book.category ? book.category.name : "";
                // delete book.category;
                book.tags = _.map(book.tags, function(tag) {
                    tag = tag.get();
                    delete tag.book_tags;
                    return tag;
                })
                return book;
            }),
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