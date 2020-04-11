var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var util = require('../../util/index.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');

exports.create = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.body;
        if (!body || !body.title || !body.number || !body.bookId || !body.contentFormat) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        body.branchId = currentUser.branchId;
        // var lastChapter = await bookChapterSequelize.findOne({
        //     order: [
        //         [sequelize.fn('max', sequelize.col('number')), 'DESC'],
        //     ]
        // });
        var book = await bookSequelize.findByPk(body.bookId);
        if (!book || book.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "BOOK_ERROR", "book不存在");
            return;
        }
        var newChapter = await bookChapterSequelize.create(body);
        adminHttpResult.jsonSuccOut(req, res, newChapter);
        book.set("chapterCount", (book.chapterCount || 0) + 1);
        if (!book.lastChapterId || !book.lastChapterNumber || book.lastChapterNumber < newChapter.number) {
            book.set("lastChapterId", newChapter.id);
            book.set("lastChapterNumber", newChapter.number);
        }
        book.save();
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
        var book = await bookChapterSequelize.findByPk(body.bookId);
        if (!book || book.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "BOOK_CHAPTER_ERROR", "book不存在");
            return;
        }
        var added = await bookChapterSequelize.update(body, {
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
        if (!body || !body.chapterId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var chapter = await bookChapterSequelize.findByPk(body.chapterId);
        if (!chapter || chapter.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "BOOK_CHAPTER_ERROR", "book chapter不存在");
            return;
        }
        chapter.set("statusId", 0);
        await chapter.save();
        adminHttpResult.jsonSuccOut(req, res, true);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.list = async function(req, res) {
    try {
        // var currentUser = req.currentUser;
        var body = req.body;
        if (!body || !body.bookId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var pageSize = body.pageSize || 20;
        var page = body.page || 1;
        var offset = pageSize * (page - 1);
        var list = await bookChapterSequelize.findAndCountAll({
            bookId: body.bookId,
        }, offset, pageSize, [
            ['number', 'ASC']
        ]);
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