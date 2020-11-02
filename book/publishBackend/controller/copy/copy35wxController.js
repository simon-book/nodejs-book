var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');
var util = require('../../util/index.js');
var httpGateway = require('../../data/http/httpGateway.js')
// var branchMap = require('./commonController.js').branchMap
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');
var rankSequelize = require('../../data/sequelize/rank/rankSequelize.js');

var branch = { //35文学网
    branchId: 1,
    copyUrl: "https://m.35wx.com",
    pcCopyUrl: "https://www.35wx.com",
    category: {
        "玄幻奇幻": [1, 1, "xuanhuan"],
        "武侠修真": [2, 2, "wuxia"],
        "都市言情": [3, 3, "dushi"],
        "历史军事": [4, 4, "lishi"],
        "科幻灵异": [5, 5, "kehuan"],
        "网游竞技": [6, 6, "wangyou"],
        "其他小说": [7, 7, "qita"]
    },
    publishStatus: {
        "连载中": 1,
        "已完结": 2
    }
}

exports.copy_book = async function(categoryId, categoryPageIndex) {
    try {
        for (var category in branch.category) {
            if (categoryId && categoryId > branch.category[category][0]) continue;
            if (categoryId && categoryId == branch.category[category][0]) var index = categoryPageIndex;
            else var index = 1;
            do {
                try {
                    var path = "/sort/" + branch.category[category][0] + "_" + index + "/";
                    console.log(path);
                    var html = await httpGateway.gbkHtmlStartReq(branch.copyUrl, path);
                    var $ = cheerio.load(html, {
                        decodeEntities: false
                    });
                    var targetItems = $("#main").children(".hot_sale");
                    for (var i = 0; i < targetItems.length; i++) {
                        try {
                            var item = targetItems[i];
                            var bookHref = $(item).find("a").attr("href");
                            var originId = bookHref.split("/book/")[1].replace("\/", "");
                            var savedBook = await bookSequelize.findOneBook({
                                originId: originId
                            })
                            if (savedBook) {
                                var result = await update_book(savedBook, branch.category[category][1], category);
                            } else {
                                var result = await create_book(originId, branch.category[category][1], category);
                            }
                            if (!result) throw new Error("save book error.")
                        } catch (err) {
                            console.log(category, branch.category[category][0], index, i, originId);
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

async function create_book(originId, categoryId, categoryName) {
    try {
        var book = {
            // copyInfo: {
            // d: branch.copyUrl,
            // a: bookHref,
            // m: branch.pcCopyUrl + bookHref
            // },
            originId: originId,
            branchId: branch.branchId,
            categoryId: categoryId,
            categoryName: categoryName,
            bookType: 1,
            recommend: 60 + parseInt(40 * Math.random()),
            chapters: []
        }
        var bookHref = "/book/" + originId + "/";
        var bookHtml = await httpGateway.gbkHtmlStartReq(branch.pcCopyUrl, bookHref);
        var $ = cheerio.load(bookHtml, {
            decodeEntities: false
        });
        book.cover = $("#fmimg").find("img").attr("src");
        var liItems = $("#info").children();
        book.title = $(liItems[0]).text();
        console.log(book.title);
        book.writer = $(liItems[1]).text().split("：")[1];
        book.publishStatus = $(liItems[2]).text().indexOf("连载中") > -1 ? 1 : 2;
        book.lastUpdatedAt = new Date($(liItems[3]).text().split("：")[1]);
        book.abstractContent = $($("#intro").children()[0]).text().replace(/\s/g, "");
        var sameBook = await bookSequelize.findOneBook({
            title: book.title,
            writer: book.writer
        })
        if (sameBook) return true;
        var chapters = $("#list dl").children();
        var dd0Index = $(chapters).index($("#list dt")[1]);
        chapters = chapters.slice(dd0Index);
        book.chapterCount = chapters.length - 1;
        for (var j = 1; j < chapters.length; j++) {
            var a = $(chapters[j]).children()[0];
            book.chapters.push({
                title: $(a).text(),
                number: j,
                type: 1,
                branchId: branch.branchId,
                domain: branch.pcCopyUrl,
                txt: $(a).attr("href")
            });
        }
        if (!book.chapters.length) return true;
        var count = await bookSequelize.countBooks({
            branchId: branch.branchId
        });
        book.sn = util.prefixInteger(count + 1, 8);
        // console.log(book);
        var added = await bookSequelize.create(book);
        return added;
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function update_book(savedBook) {
    try {
        var bookHref = "/book/" + savedBook.originId + "/";
        var bookHtml = await httpGateway.gbkHtmlStartReq(branch.pcCopyUrl, bookHref);
        var $ = cheerio.load(bookHtml, {
            decodeEntities: false
        });
        var liItems = $("#info").children();
        console.log($(liItems[0]).text());
        var lastUpdatedAt = new Date($(liItems[3]).text().split("：")[1]);
        if (Math.abs(lastUpdatedAt.getTime() - new Date(savedBook.lastUpdatedAt).getTime()) > 10000) {
            savedBook.set("lastUpdatedAt", lastUpdatedAt);
            savedBook.set("publishStatus", $(liItems[2]).text().indexOf("连载中") > -1 ? 1 : 2);

            var newChapters = [];
            var chapters = $("#list dl").children();
            var dd0Index = $(chapters).index($("#list dt")[1]);
            chapters = chapters.slice(dd0Index);
            for (var j = savedBook.chapterCount + 1; j < chapters.length; j++) {
                var a = $(chapters[j]).children()[0];
                newChapters.push({
                    title: $(a).text(),
                    bookId: savedBook.bookId,
                    number: j,
                    type: 1,
                    branchId: branch.branchId,
                    domain: branch.pcCopyUrl,
                    txt: $(a).attr("href")
                });
            }
            savedBook.set("chapterCount", chapters.length - 1)
            // console.log(savedBook, newChapters);
            await bookSequelize.updateBookAndChapters(savedBook, newChapters);
        }
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}


exports.copy_rank = async function() {
    try {
        var orderIndex = 0;
        for (var category in branch.category) {
            try {
                orderIndex++;
                var path = "/" + branch.category[category][2] + "/";
                console.log(path);
                var recommendBookIds = [];
                var rankBookIds = [];
                var html = await httpGateway.gbkHtmlStartReq(branch.pcCopyUrl, path);
                var $ = cheerio.load(html, {
                    decodeEntities: false
                });
                var targetItems = $("#hotcontent").find(".item");
                for (var i = 0; i < targetItems.length; i++) {
                    try {
                        var item = targetItems[i];
                        var bookHref = $(item).find("a").attr("href");
                        var originId = bookHref.split("/book/")[1].replace("\/", "");
                        var savedBook = await bookSequelize.findOneBook({
                            originId: originId
                        })
                        if (!savedBook) {
                            savedBook = await create_book(originId, branch.category[category][1], category);
                            if (!savedBook) continue;
                        }
                        recommendBookIds.push(savedBook.bookId);
                    } catch (err) {
                        console.log(category, branch.category[category][2], originId);
                        console.log(err);
                    }
                }

                var targetItems = $("#newscontent .r").find("li");
                for (var i = 0; i < targetItems.length; i++) {
                    try {
                        var item = targetItems[i];
                        var bookHref = $(item).find("a").attr("href");
                        var originId = bookHref.split("/book/")[1].replace("\/", "");
                        var savedBook = await bookSequelize.findOneBook({
                            originId: originId
                        })
                        if (!savedBook) {
                            savedBook = await create_book(originId, branch.category[category][1], category);
                            if (!savedBook) continue;
                        }
                        rankBookIds.push(savedBook.bookId);
                    } catch (err) {
                        console.log(category, branch.category[category][2], originId);
                        console.log(err);
                    }
                }
                var savedRank = await rankSequelize.findOne({
                    branchId: branch.branchId,
                    token: branch.category[category][2]
                })
                if (savedRank) {
                    savedRank.set("recommendBookIds", recommendBookIds);
                    savedRank.set("rankBookIds", rankBookIds);
                    await savedRank.save();
                } else {
                    await rankSequelize.create({
                        token: branch.category[category][2],
                        name: category,
                        recommendBookIds: recommendBookIds,
                        rankBookIds: rankBookIds,
                        orderIndex: orderIndex,
                        branchId: branch.branchId
                    });
                }
            } catch (err) {
                console.log(category, branch.category[category][2]);
                console.log(err);
            }
        }
    } catch (err) {
        console.log(err);
    }
}