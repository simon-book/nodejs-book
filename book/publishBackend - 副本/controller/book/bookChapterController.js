var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var util = require('../../util/index.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var MossClient = require('../../service/mossConn.js');

exports.create = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.body;
        if (!body || !body.title || !body.number || !body.bookId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        body.branchId = currentUser.branchId;
        body.number = parseInt(body.number);
        var chapter = await bookChapterSequelize.findOne({
            number: body.number,
            bookId: body.bookId
        });
        if (chapter) {
            adminHttpResult.jsonFailOut(req, res, "BOOK_CHAPTER_ERROR", "book chapter number重复");
            return;
        }
        var book = await bookSequelize.findByPk(body.bookId);
        if (!book || book.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "BOOK_ERROR", "book不存在");
            return;
        }
        // if (!body.price && book.chapterPrice) body.price = book.chapterPrice;
        if (body.local == 1) {
            var result = await MossClient.put("branch" + book.branchId, book.bookId + "/" + body.number + ".txt", body.txt);
            if (result) body.txt = null;
            else body.local = 2;
        }


        var newChapter = await bookChapterSequelize.create(body);
        adminHttpResult.jsonSuccOut(req, res, newChapter);
        book.set("chapterCount", (book.chapterCount || 0) + 1);
        // book.set("wordsCount", (book.wordsCount || 0) + (newChapter.wordsCount || 0));
        // if (!book.lastChapterId || !book.lastChapterNumber || book.lastChapterNumber < newChapter.number) {
        //     book.set("lastChapterId", newChapter.chapterId);
        //     book.set("lastChapterNumber", newChapter.number);
        // }
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
        if (!body || !body.chapterId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var chapter = await bookChapterSequelize.findByPk(body.chapterId);
        if (!chapter || chapter.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "BOOK_CHAPTER_ERROR", "book chapter不存在");
            return;
        }
        delete body.bookId;
        var added = await bookChapterSequelize.update(body, {
            chapterId: body.chapterId
        })
        adminHttpResult.jsonSuccOut(req, res, true);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.detail = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.body;
        if (!body || !body.number) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var chapter = await bookChapterSequelize.findOne({
            bookId: body.bookId,
            number: body.number
        });
        if (!chapter || chapter.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "BOOK_CHAPTER_ERROR", "book chapter不存在");
            return;
        }
        adminHttpResult.jsonSuccOut(req, res, chapter);
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