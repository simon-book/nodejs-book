var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');
var httpGateway = require('../../data/http/httpGateway.js');

var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');

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
        console.time(host + path);
        var result = await reqHtmlContent(host, path, charset);
        if (!result) var result = await reqHtmlContent(host, path, charset);
        if (!result) var result = await reqHtmlContent(host, path, charset);
        if (!result) var result = await reqHtmlContent(host, path, charset);
        if (!result) var result = await reqHtmlContent(host, path, charset);
        console.timeEnd(host + path);
        if (result) {
            // console.log("success:" + host + path)
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
            book.set("cover", book.cover.replace(oldUrl, newUrl));
            await book.save();
        }
    } catch (err) {
        console.log(err);
    }
}