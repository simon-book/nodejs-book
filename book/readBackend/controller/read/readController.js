var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');
var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var util = require('../../util/index.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');
var httpGateway = require('../../data/http/httpGateway.js')
var MossClient = require('../../service/mossConn.js');

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
        // book.categoryName = book.category ? book.category.name : "";
        delete book.category;
        book.tags = _.map(book.tags, function(tag) {
            // tag = tag.get();
            delete tag.book_tags;
            return tag;
        })
        var lastChapters = await bookChapterSequelize.findAll({
            bookId: bookId
        }, 0, 10, [
            ["number", "desc"]
        ]);
        adminHttpResult.jsonSuccOut(req, res, {
            book: book,
            lastChapters: lastChapters ? lastChapters : []
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
        var book = await bookSequelize.findByPk(bookId);
        book = book.get();
        body = req.query;
        var pageSize = body.pageSize || 20;
        var page = body.page || 1;
        var offset = pageSize * (page - 1);
        var where = {
            bookId: bookId
        }
        var list = await bookChapterSequelize.findAndCountAll(where, offset, pageSize);
        adminHttpResult.jsonSuccOut(req, res, {
            book: book,
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
        if (!body || !body.number || !body.bookId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }

        body.number = parseInt(body.number);
        body.bookId = parseInt(body.bookId);
        var chapter = await bookChapterSequelize.findOne({
            number: body.number,
            bookId: body.bookId
        });
        if (!chapter) {
            adminHttpResult.jsonSuccOut(req, res, null);
            return;
        }
        var chpaterDetail = {
            chapterId: chapter.chapterId,
            number: chapter.number,
            title: chapter.title,
            bookId: chapter.bookId,
            type: chapter.type == 1 ? "text" : "picture"
        }
        if (chpaterDetail.type == "text") {
            if (chapter.local == 1) {
                var content = await MossClient.get("branch" + chapter.branchId, chapter.bookId + "/" + chapter.number + ".txt");
                chpaterDetail.content = content ? content : "";
                adminHttpResult.jsonSuccOut(req, res, chpaterDetail);
            } else if (chapter.local == 2) {
                chpaterDetail.content = chapter.txt;
                adminHttpResult.jsonSuccOut(req, res, chpaterDetail);
            } else {
                var bookHtml = await httpGateway.htmlStartReq(chapter.domain + chapter.txt);
                var $ = cheerio.load(bookHtml, {
                    decodeEntities: false
                });
                $("#chaptercontent").children().last().remove();
                var content = $("#chaptercontent").html();
                chpaterDetail.content = content;
                adminHttpResult.jsonSuccOut(req, res, chpaterDetail);
                var result = await MossClient.put("branch" + chapter.branchId, chapter.bookId + "/" + chapter.number + ".txt", content);
                if (result) {
                    chapter.set("local", 1);
                    chapter.set("txt", null);
                    chapter.set("domain", null);
                    chapter.save();
                }
                checkSiblingsChapters(body.bookId, body.number);
            }
        } else if (chpaterDetail.type == "picture") {
            chpaterDetail.content = chapter.pics;
            chpaterDetail.domain = chapter.domain;
            adminHttpResult.jsonSuccOut(req, res, chpaterDetail);
        } else adminHttpResult.jsonSuccOut(req, res, chpaterDetail);

    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

async function checkSiblingsChapters(bookId, number) {
    try {
        var numbers = [number + 1, number + 2, number + 3, number + 4, number + 5];
        var chapters = await bookChapterSequelize.findAll({
            number: {
                [Op.in]: numbers
            },
            bookId: bookId
        });
        for (var i = 0; i < chapters.length; i++) {
            var chapter = chapters[i];
            if (!chapter.local) {
                {
                    var bookHtml = await httpGateway.htmlStartReq(chapter.domain + chapter.txt);
                    var $ = cheerio.load(bookHtml, {
                        decodeEntities: false
                    });
                    $("#chaptercontent").children().last().remove();
                    var content = $("#chaptercontent").html();
                    var result = await MossClient.put("branch" + chapter.branchId, chapter.bookId + "/" + chapter.number + ".txt", content);
                    if (result) {
                        chapter.set("local", 1);
                        chapter.set("txt", null);
                        chapter.set("domain", null);
                        chapter.save();
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
    }

}