var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');
var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var util = require('../../util/index.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var httpGateway = require('../../data/http/httpGateway.js')
var MossClient = require('../../service/mossConn.js');

exports.detail = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.body;
        if (!body || !body.number || !body.bookId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var chapter = await bookChapterSequelize.findOne({
            number: body.number,
            bookId: body.bookId
        });
        if (!chapter || chapter.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "BOOK_CHAPTER_ERROR", "book chapter不存在");
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
            if (chapter.local) {
                var content = await MossClient.get("branch" + chapter.branchId, chapter.bookId + "/" + chapter.number);
                chpaterDetail.content = content ? content : "";
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
                var result = await MossClient.put("branch" + chapter.branchId, chapter.bookId + "/" + chapter.number, content);
                if (result) {
                    chapter.set("local", 1);
                    chapter.set("txt", null);
                    chapter.set("domain", null);
                    chapter.save();
                }
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

exports.list = async function(req, res) {
    try {
        var currentUser = req.currentUser;
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