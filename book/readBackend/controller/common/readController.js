var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var util = require('../../util/index.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');

exports.bookDeail = async function(req, res) {
    try {
        var body = req.params;
        var branchId = body.branchId;
        var bookId = body.bookId;
        if (!branchId || !bookId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var book = await bookSequelize.findByPk(bookId);
        book = book.get();
        book.categoryName = book.category ? book.category.name : "";
        delete book.category;
        book.tags = _.map(book.tags, function(tag) {
            tag = tag.get();
            delete tag.book_tags;
            return tag;
        })
        var lastChapter = await bookChapterSequelize.findOne({});
        adminHttpResult.jsonSuccOut(req, res, {
            book: book,
            lastChapter: lastChapter ? lastChapter : null
        });
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.bookChapters = async function(req, res) {
    try {
        var body = req.params;
        var branchId = body.branchId;
        var bookId = body.bookId;
        if (!branchId || !bookId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        body = req.query;
        var pageSize = body.pageSize || 20;
        var page = body.page || 1;
        var offset = pageSize * (page - 1);
        var where = {
            bookId: bookId
        }
        var list = await bookChapterSequelize.findAndCountAll(where, offset, pageSize);
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

exports.chapterDetail = async function(req, res) {
    try {
        var body = req.params;
        var branchId = body.branchId;
        var chapterId = body.chapterId;
        if (!branchId || !chapterId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var chapter = await bookChapterSequelize.findByPk(chapterId);
        adminHttpResult.jsonSuccOut(req, res, chapter);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}