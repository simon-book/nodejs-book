var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');
var util = require('../../util/index.js');
var httpGateway = require('../../data/http/httpGateway.js');
var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');
var branchSequelize = require('../../data/sequelize/branch/branchSequelize.js');
async function reqHtmlContent(host, path, charset) {
    try {
        var html = await httpGateway.htmlStartReq(host, path, charset);
        var $ = cheerio.load(html, {
            decodeEntities: false
        });
        var metas = $('meta[name="keywords"]');
        if (metas && metas.length) return $;
        else {
            console.log(html);
            return null;
        }
    } catch (err) {
        console.log(err, host + path);
        return null;
    }
}

exports.copyHtml = async function(host, path, charset) {
    try {
        var result = await reqHtmlContent(host, path, charset);
        await util.sleep(1000);
        if (!result) {
            var result = await reqHtmlContent(host, path, charset);
            await util.sleep(1000);
        }
        if (!result) {
            var result = await reqHtmlContent(host, path, charset);
            await util.sleep(1000);
        }
        if (!result) {
            var result = await reqHtmlContent(host, path, charset);
            await util.sleep(1000);
        }
        if (!result) {
            var result = await reqHtmlContent(host, path, charset);
            await util.sleep(1000);
        }
        if (!result) {
            var result = await reqHtmlContent(host, path, charset);
            await util.sleep(1000);
        }
        if (result) {
            console.log("success:" + host + path)
            return result;
        } else throw new Error("5次请求html失败");
    } catch (err) {
        console.log("5次请求html失败:", path);
        throw err;
    }
}


exports.updateBookLastChapterId = async function(branchId) {
    try {
        var books = await bookSequelize.findAll({
            branchId: branchId
        }, ["bookId", "lastChapterId", "chapterCount"]);
        for (var i = 0; i < books.length; i++) {
            var book = books[i];
            if (book.lastChapterId || !book.chapterCount) continue;
            var lastChapter = await bookChapterSequelize.findOne({
                bookId: book.bookId,
                number: book.chapterCount
            }, ["chapterId"]);
            if (lastChapter) {
                book.set("lastChapterId", lastChapter.chapterId);
                await book.save();
            }
        }
    } catch (err) {
        console.log(err);
    }
}

exports.updateBookCover = async function(branchId, oldUrl, newUrl) {
    try {
        var books = await bookSequelize.findAll({
            branchId: branchId
        }, ["bookId", "cover"]);
        for (var i = 0; i < books.length; i++) {
            var book = books[i];
            if (!book.cover) continue;
            var cover = "";
            if (/^(https)/.test(book.cover)) cover = book.cover.replace(/https:\/\/[^\/]+/, "");
            else if (/^(http)/.test(book.cover)) cover = book.cover.replace(/http:\/\/[^\/]+/, "");
            // book.set("cover", book.cover.replace(oldUrl, newUrl));
            if (cover) {
                book.set("cover", cover);
                await book.save();
            }
        }
    } catch (err) {
        console.log(err);
    }
}

// exports.deleteRepeatBooks = async function(branchId) {
//     try {
//         var books = await bookSequelize.findAll({
//             branchId: branchId
//         }, ["bookId", "title", "writer", "lastChapterId"]);
//         for (var i = 0; i < books.length; i++) {
//             var book = books[i];
//             var anotherBooks = await bookSequelize.findAll({
//                 title: book.title,
//                 writer: book.writer,
//                 branchId: {
//                     [Op.ne]: branchId
//                 }
//             }, ["bookId", "lastChapterId"]);
//             if (anotherBooks && anotherBooks.length) {
//                 console.log(i, book.bookId, book.title);
//                 // await bookChapterSequelize.update({
//                 //     number: -1
//                 // }, {
//                 //     bookId: book.bookId
//                 // });
//                 book.set("recommend", -1);
//                 await book.save();
//             }
//         }
//     } catch (err) {
//         console.log(err);
//     }
// }

exports.deleteRepeatBooks = async function(branchId) {
    try {
        var books = await bookSequelize.findAll({
            branchId: branchId
        }, ["bookId", "title", "chapterCount", "originId"]);
        var originIdMap = {};
        for (var i = 0; i < books.length; i++) {
            var book = books[i];
            if (!originIdMap[book.originId]) originIdMap[book.originId] = [];
            originIdMap[book.originId].push(book);
        }
        for (var originId in originIdMap) {
            if (originIdMap[originId].length > 1) {
                var maxbook = _.maxBy(originIdMap[originId], "chapterCount");
                console.log(maxbook.bookId, maxbook.title);
                _.remove(originIdMap[originId], { bookId: maxbook.bookId });
                for (var i = 0; i < originIdMap[originId].length; i++) {
                    var book = originIdMap[originId][i];
                    console.log(book.bookId, book.title);
                    book.set("recommend", -1);
                    await book.save();
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
}

exports.updateBrnchCopyUrl = async function(req, res) {
    var body = req.body;
    if (!body || !body.branchId) {
        adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
        return;
    }
    try {
        var branchId = body.branchId;
        var branch = body.branch;
        var book = body.book;
        var savedBranch = await branchSequelize.findOne({
            branchId: branchId
        });
        if (!savedBranch) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID", "branch not exist");
            return;
        }
        if (branch && branch.copyParams) {
            savedBranch.set("copyParams", branch.copyParams);
            await savedBranch.save();
        }
        if (book && book.copyInfo) {
            var result = await bookSequelize.update({
                copyInfo: book.copyInfo
            }, {
                branchId: branchId
            }, false);
        }
        if (book && book.oldUrl && book.newUrl) {
            var books = await bookSequelize.findAll({
                branchId: branchId
            }, ["bookId", "cover"]);
            for (var i = 0; i < books.length; i++) {
                var savedBook = books[i];
                if (!savedBook.cover) continue;
                savedBook.set("cover", savedBook.cover.replace(book.oldUrl, book.newUrl));
                await savedBook.save();
            }
        }
        adminHttpResult.jsonSuccOut(req, res, true);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}