var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');
var util = require('../../util/index.js');
var httpGateway = require('../../data/http/httpGateway.js')
var branchMap = require('./commonController.js').branchMap
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');


//抓取m.35xs.co的小说
var branch = branchMap["m.35xs.co"];

exports.copy_book = async function(categoryId, categoryPageIndex) {
    try {
        for (var category in branch.category) {
            if (categoryId && categoryId > branch.category[category][0]) continue;
            if (categoryId && categoryId == branch.category[category][0]) var index = categoryPageIndex;
            else var index = 1;
            do {
                try {
                    var path = "/cate/" + branch.category[category][0] + "/" + index + "/";
                    console.log(path);
                    var html = await httpGateway.htmlStartReq(branch.copyUrl, path);
                    var $ = cheerio.load(html);
                    var targetItems = $("#main").children(".hot_sale");
                    for (var i = 0; i < targetItems.length; i++) {
                        try {
                            var item = targetItems[i];
                            var bookHref = $(item).find("a").attr("href");
                            var savedBook = await bookSequelize.findOneBook({
                                originId: bookHref.split("/")[2]
                            })
                            if (savedBook) {
                                var result = await update_book(savedBook);
                            } else {
                                var result = await create_book(bookHref);
                            }
                            if (!result) throw new Error("save book error.")
                        } catch (err) {
                            console.log(category, branch.category[category][0], index, i);
                            console.log(err);
                        }
                    }
                    index++;
                } catch (err) {
                    console.log(category, branch.category[category][0], index);
                    console.log(err);
                }
            } while (index < 3)
        }
    } catch (err) {
        console.log(err);
    }
}

async function create_book(bookHref) {
    try {
        var book = {
            copyInfo: {
                d: branch.copyUrl,
                a: bookHref,
                m: bookHref + "mulu/"
            },
            originId: bookHref.split("/")[2],
            branchId: branch.branchId,
            bookType: 1,
            recommend: 60 + parseInt(40 * Math.random()),
            chapters: []
        }
        var bookHtml = await httpGateway.htmlStartReq(branch.copyUrl, book.copyInfo.a);
        var $ = cheerio.load(bookHtml);
        book.title = $("header .title").text();
        console.log(book.title);
        book.cover = branch.copyUrl + $("#thumb img").attr("src");
        var liItems = $("#book_detail").children();
        book.writer = $(liItems[0]).text().slice(3);
        book.categoryName = $(liItems[1]).find("a").text() || "未分类";
        book.categoryId = branch.category[book.categoryName][1];
        book.publishStatus = branch.publishStatus[$(liItems[2]).text().slice(3)];
        book.lastUpdatedAt = new Date($($(".recommend h2 a")[0]).text().split("：")[1]);
        book.abstractContent = $("p.review").text();
        var sameBook = await bookSequelize.findOneBook({
            title: book.title,
            writer: book.writer
        })
        if (sameBook) return true;
        var muluHtml = await httpGateway.htmlStartReq(branch.copyUrl, book.copyInfo.m);
        var $ = cheerio.load(muluHtml);
        var chapters = $("#chapterlist").children();
        book.chapterCount = chapters.length - 1;
        for (var j = 1; j < chapters.length; j++) {
            var a = $(chapters[j]).children()[0];
            book.chapters.push({
                title: $(a).text(),
                number: j,
                type: 1,
                branchId: branch.branchId,
                domain: branch.copyUrl,
                txt: $(a).attr("href")
            });
        }
        if (!book.chapters.length) return true;
        var count = await bookSequelize.countBooks({
            branchId: branch.branchId
        });
        book.sn = util.prefixInteger(count + 1, 8);
        // console.log(book);
        await bookSequelize.create(book);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function update_book(savedBook) {
    try {
        var bookHtml = await httpGateway.htmlStartReq(branch.copyUrl, savedBook.copyInfo.a);
        var $ = cheerio.load(bookHtml);
        var lastUpdatedAt = new Date($($(".recommend h2 a")[0]).text().split("：")[1]);
        if (Math.abs(lastUpdatedAt.getTime() - new Date(savedBook.lastUpdatedAt).getTime()) > 10000) {
            savedBook.set("lastUpdatedAt", lastUpdatedAt);
            var liItems = $("#book_detail").children();
            savedBook.set("publishStatus", branch.publishStatus[$(liItems[2]).text().slice(3)]);

            var newChapters = [];
            var muluHtml = await httpGateway.htmlStartReq(branch.copyUrl, savedBook.copyInfo.m);
            var $ = cheerio.load(muluHtml);
            var chapters = $("#chapterlist").children();
            for (var j = savedBook.chapterCount + 1; j < chapters.length; j++) {
                var a = $(chapters[j]).children()[0];
                newChapters.push({
                    title: $(a).text(),
                    number: j,
                    type: 1,
                    branchId: branch.branchId,
                    domain: branch.copyUrl,
                    txt: $(a).attr("href")
                });
            }
            savedBook.set("chapterCount", chapters.length - 1)
            // console.log(savedBook, newChapters);
            await bookSequelize.update(savedBook, newChapters);
        }
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}