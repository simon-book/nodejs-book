var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');

var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');
var httpGateway = require('../../data/http/httpGateway.js')
var MossClient = require('../../service/mossConn.js');

exports.bookDeail = async function(bookId) {
    try {
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
        return {
            book: book,
            lastChapters: lastChapters ? lastChapters : []
        }
    } catch (err) {
        console.error(err);
        return [];
    }
}

exports.bookChapters = async function(body) {
    try {
        if (!body || !body.blockId) throw new Error("缺少blockId");
        var book = await bookSequelize.findByPk(body.bookId);
        book = book.get();
        var pageSize = body.pageSize || 20;
        var page = body.page || 1;
        var offset = pageSize * (page - 1);
        var where = {
            bookId: bookId
        }
        var list = await bookChapterSequelize.findAndCountAll(where, offset, pageSize);
        return {
            book: book,
            list: list.rows,
            pagination: {
                totalNum: list.count,
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
        var chapter = await bookChapterSequelize.findOne({
            number: number,
            bookId: bookId
        });
        if (!chapter) {
            adminHttpResult.jsonSuccOut(req, res, null);
            return;
        }
        var chapterDetail = {
            chapterId: chapter.chapterId,
            number: chapter.number,
            title: chapter.title,
            bookId: chapter.bookId,
            type: chapter.type == 1 ? "text" : "picture"
        }
        if (chapterDetail.type == "text") {
            if (chapter.local == 1) {
                var content = await MossClient.get("branch" + chapter.branchId, chapter.bookId + "/" + chapter.number + ".txt");
                chapterDetail.content = content ? content : "";
                return chapterDetail;
            } else if (chapter.local == 2) {
                chapterDetail.content = chapter.txt;
                return chapterDetail;
            } else {
                var bookHtml = await httpGateway.htmlStartReq(chapter.domain + chapter.txt);
                var $ = cheerio.load(bookHtml, {
                    decodeEntities: false
                });
                $("#chaptercontent").children().last().remove();
                var content = $("#chaptercontent").html();
                chapterDetail.content = content;
                return chapterDetail;
                var result = await MossClient.put("branch" + chapter.branchId, chapter.bookId + "/" + chapter.number + ".txt", content);
                if (result) {
                    chapter.set("local", 1);
                    chapter.set("txt", null);
                    chapter.set("domain", null);
                    chapter.save();
                }
                checkSiblingsChapters(body.bookId, body.number);
            }
        } else if (chapterDetail.type == "picture") {
            chapterDetail.content = chapter.pics;
            chapterDetail.domain = chapter.domain;
            return chapterDetail;
        } else return chapterDetail;

    } catch (err) {
        console.error(err);
        return [];
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