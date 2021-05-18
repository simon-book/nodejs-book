var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');
var httpGateway = require('../../data/http/httpGateway.js');

var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');

exports.branchMap = {
    // "m.35xs.co": { //35小说网
    //     branchId: 1,
    //     copyUrl: "https://m.35xs.co",
    //     category: {
    //         "玄幻奇幻": [1, 1],
    //         "武侠仙侠": [2, 2],
    //         "科幻灵异": [6, 3],
    //         "历史军事": [7, 4],
    //         "都市言情": [8, 5],
    //         "现代言情": [9, 6],
    //         "校园言情": [10, 7],
    //         "古代言情": [11, 8],
    //         "女生频道": [12, 9],
    //         "经典美文": [13, 10],
    //         "穿越时空": [14, 11],
    //         "网游竞技": [15, 12],
    //         "小说同人": [16, 13],
    //         "未分类": [17, 3]
    //     },
    //     publishStatus: {
    //         "连载": 1,
    //         "完成": 2
    //     }
    // },
    "m.35wx.com": { //35文学网
        branchId: 1,
        copyUrl: "https://m.35wx.com",
        pcCopyUrl: "https://www.35wx.com",
        charset: "GBK",
        category: {
            "玄幻奇幻": [1, 1],
            "武侠修真": [2, 2],
            "都市言情": [3, 3],
            "历史军事": [4, 4],
            "科幻灵异": [5, 5],
            "网游竞技": [6, 6],
            "其他小说": [7, 7]
        },
        publishStatus: {
            "连载中": 1,
            "已完结": 2
        }
    }
}

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
        if (!result) var result = await reqHtmlContent(host, path, charset);
        if (!result) var result = await reqHtmlContent(host, path, charset);
        if (!result) var result = await reqHtmlContent(host, path, charset);
        if (!result) var result = await reqHtmlContent(host, path, charset);
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
            book.set("cover", book.cover.replace(oldUrl, newUrl));
            await book.save();
        }
    } catch (err) {
        console.log(err);
    }
}