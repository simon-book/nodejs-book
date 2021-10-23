var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');
var fs = require('fs');
var compressing = require('compressing');
var util = require('../../util/index.js');
var branchMap = require('../common/branchMap.js').hostMap;
var chapterController = require('./chapterController.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');
var httpGateway = require('../../data/http/httpGateway.js')
// var MossClient = require('../../service/mossConn.js');

exports.bookDeail = async function(bookId) {
    try {
        var book = await bookSequelize.findByPk(bookId);
        book = book.get();
        book.tags = _.map(book.tags, function(tag) {
            // tag = tag.get();
            delete tag.book_tags;
            return tag;
        })
        var allChapters = await bookChapterSequelize.findAll({
            bookId: bookId
        }, 0, 100000, null, true);
        return {
            book: book,
            allChapters: allChapters
        }
    } catch (err) {
        console.error(err);
        return [];
    }
}

exports.bookChapters = async function(body) {
    try {
        if (!body || !body.bookId) throw new Error("缺少bookId");
        var book = await bookSequelize.findByPk(body.bookId);
        book = book.get();
        var pageSize = body.pageSize || 20;
        var page = body.page || 1;
        var offset = pageSize * (page - 1);
        var where = {
            bookId: body.bookId
        }
        var list = await bookChapterSequelize.findAndCountAll(where, offset, pageSize);
        return {
            book: book,
            list: list.rows,
            pagination: {
                totalNum: list.count,
                totalPage: Math.ceil(list.count / pageSize),
                page: page,
                pageSize: pageSize
            }
        }
    } catch (err) {
        console.error(err);
        return [];
    }
}

exports.chapterDetail = async function(bookId, number) {
    try {
        number = parseInt(number);
        bookId = parseInt(bookId);
        var book = await bookSequelize.findSimpleByPk(bookId);
        bookSequelize.incrementReadCount(bookId);
        book = book.get();
        var chapter = await bookChapterSequelize.findOne({
            number: number,
            bookId: bookId
        });
        if (!chapter) {
            return null;
        }
        var chapterDetail = {
            book: book,
            chapterId: chapter.chapterId,
            number: chapter.number,
            title: chapter.title,
            bookId: chapter.bookId,
            type: chapter.type == 1 ? "text" : "picture"
        }
        if (chapterDetail.type == "text") {
            if (chapter.local == 2) {
                chapterDetail.content = chapter.txt;
                return chapterDetail;
            }
            var content = "";
            if (chapter.local == 1) {
                content = await httpGateway.mossServerStartReq("GET", "/moss/get/" + chapter.branchId + "/" + chapter.bookId + "/" + chapter.number, "");
            }
            if (content) {
                chapterDetail.content = content;
                checkSiblingsChapters(book, number, 1);
            } else {
                content = await chapterController.copyChapterContent(branchMap.includeBranches[book.branchId], book.originId, chapter.originId, chapter);
                chapterDetail.content = content;
                if (content) {
                    var result = await httpGateway.mossServerStartReq("POST", "/moss/put/" + chapter.branchId + "/" + chapter.bookId + "/" + chapter.number, {
                        content: content
                    });
                    if (result) {
                        chapter.set("local", 1);
                        chapter.save();
                    }
                }
                checkSiblingsChapters(book, number, 1);
            }
        } else if (chapterDetail.type == "picture") {
            chapterDetail.content = chapter.pics;
            chapterDetail.domain = chapter.domain;
        }
        return chapterDetail;

    } catch (err) {
        console.error(err);
        return null;
    }
}

async function checkSiblingsChapters(book, number, limit) {
    try {
        var numbers = _.range(number + 1, number + 1 + limit);
        console.log(numbers);
        var chapters = await bookChapterSequelize.findAll({
            number: {
                [Op.in]: numbers
            },
            bookId: book.bookId
        });
        for (var i = 0; i < chapters.length; i++) {
            var chapter = chapters[i];
            if (!chapter.local) {
                {
                    await util.sleep(1000);
                    var content = await chapterController.copyChapterContent(branchMap.includeBranches[book.branchId], book.originId, chapter.originId, chapter);
                    if (!content) continue;
                    var result = await httpGateway.mossServerStartReq("POST", "/moss/put/" + chapter.branchId + "/" + chapter.bookId + "/" + chapter.number, {
                        content: content
                    });
                    if (result) {
                        chapter.set("local", 1);
                        chapter.save();
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
    }

}