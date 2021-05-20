var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');
var util = require('../../util/index.js');
var httpGateway = require('../../data/http/httpGateway.js')
var commonController = require('./commonController.js')
var branchSequelize = require('../../data/sequelize/branch/branchSequelize.js');
var bookCategorySequelize = require('../../data/sequelize/book/bookCategorySequelize.js');
var tagSequelize = require('../../data/sequelize/book/tagSequelize.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');
var rankSequelize = require('../../data/sequelize/rank/rankSequelize.js');
var pageSequelize = require('../../data/sequelize/rank/pageSequelize.js');

var branch = { //笔趣阁
    copySrc: "www.biquwx.la",
    // branchId: 1,
    // copyUrl: "http://m.biquge.info",
    // pcCopyUrl: "http://www.biquge.info",
    // charset: "utf-8",
    // category: {
    //     "玄幻小说": [1, 1, "xuanhuan"],
    //     "修真小说": [2, 2, "xiuzhen"],
    //     "都市小说": [3, 3, "dushi"],
    //     "穿越小说": [4, 4, "chuanyue"],
    //     "网游小说": [5, 5, "wangyou"],
    //     "科幻小说": [6, 6, "kehuan"]
    // },
    // rank: {
    //     "总点击榜": "paihangbang_allvisit",
    //     "周点击榜": "paihangbang_weekvisit",
    //     "月点击榜": "paihangbang_monthvisit",
    //     "周推荐榜": "paihangbang_weekvote",
    //     "月推荐榜": "paihangbang_monthvote",
    //     "总推荐榜": "paihangbang_allvote",
    //     "总收藏榜": "paihangbang_goodnum",
    //     "总字数榜": "paihangbang_size",
    //     "最新入库": "paihangbang_postdate",
    //     "最近更新": "paihangbang_lastupdate",
    //     "新书榜单": "paihangbang_goodnew"
    // },
    // categoryPage: 2,
    // rankPage: 2
}

exports.queryBranchInfo = async function() {
    try {
        var savedBranch = await branchSequelize.findOne({
            copySrc: branch.copySrc
        });
        if (savedBranch && savedBranch.copyParams) {
            branch.branchId = savedBranch.branchId;
            branch.copyUrl = savedBranch.copyParams.copyUrl;
            branch.pcCopyUrl = savedBranch.copyParams.pcCopyUrl;
            branch.charset = savedBranch.copyParams.charset;
            // branch.categoryPage = savedBranch.copyParams.categoryPage;
            // branch.rankPage = savedBranch.copyParams.rankPage;
            branch.isTest = savedBranch.copyParams.isTest || false;
            branch.category = {};
            branch.rank = {};
            var categories = await bookCategorySequelize.findAll({
                branchId: branch.branchId
            })
            _.forEach(categories, function(item) {
                branch.category[item.name] = [item.originId, item.categoryId, item.categoryId];
            })
            var ranks = await rankSequelize.findAll({
                branchId: branch.branchId
            })
            _.forEach(ranks, function(item) {
                // branch.rank[item.name] = item.token;
                branch.rank[item.name] = item;
            })
            var count = await bookSequelize.countBooks({
                branchId: branch.branchId
            });
            branch.bookCount = count || 0;
        }
    } catch (err) {
        console.log(err);
    }
}

exports.copy_book_category = async function() {
    try {
        var path = "/sort.html";
        console.log(path);
        var $ = await commonController.copyHtml(branch.copyUrl, path, branch.charset);
        var targetItems = $(".sorttop").find("a");
        for (var i = 0; i < targetItems.length; i++) {
            try {
                var item = targetItems[i];
                var originId = $(item).attr("href").match(/\d+/)[0];
                var categoryName = $(item).text();
                var saved = await bookCategorySequelize.findOne({
                    branchId: branch.branchId,
                    originId: originId
                })
                if (!saved) await bookCategorySequelize.create({
                    branchId: branch.branchId,
                    originId: originId,
                    name: categoryName,
                    orderIndex: i
                });
            } catch (err) {
                console.log(err);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

exports.copy_book_rank_category = async function() {
    try {
        var path = "/top.html";
        console.log(path);
        var $ = await commonController.copyHtml(branch.copyUrl, path, branch.charset);
        var targetItems = $(".sorttop").find("a");
        for (var i = 0; i < targetItems.length; i++) {
            try {
                var item = targetItems[i];
                var token = $(item).attr("href").split("/")[1];
                var categoryName = $(item).text();
                var saved = await rankSequelize.findOne({
                    branchId: branch.branchId,
                    token: token
                })
                if (!saved) await rankSequelize.create({
                    branchId: branch.branchId,
                    token: token,
                    name: categoryName,
                    orderIndex: i
                });
            } catch (err) {
                console.log(err);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

exports.copy_all_books = async function() {
    try {
        for (var category in branch.category) {
            var totalPage = 100;
            try {
                var path = "/list/" + branch.category[category][0] + "_1" + ".html";
                console.log(path);
                var $ = await commonController.copyHtml(branch.copyUrl, path, branch.charset);
                var pages = $(".page2").text().match(/\d+/g);
                if (pages[1]) totalPage = parseInt(pages[1]);
                console.log(category, totalPage);
                branch.category[category].push(totalPage);
            } catch (err) {
                console.log("获取分类totalPage失败", category, err);
            }
            var ranges = _.range(1, totalPage, 100);
            console.log(ranges);
            _.forEach(ranges, function(start) {
                copy_category_books(category, start, start + 99 > totalPage ? totalPage : start + 99);
            })
        }
    } catch (err) {
        console.log(err);
    }
}


async function copy_category_books(category, startIndex, endIndex) {
    try {
        var index = startIndex;
        if (branch.isTest) endIndex = startIndex + 5;
        do {
            try {
                var path = "/list/" + branch.category[category][0] + "_" + index + ".html";
                console.log(path);
                var $ = await commonController.copyHtml(branch.copyUrl, path, branch.charset);
                var targetItems = $(".list.fk").children("ul");
                for (var i = 0; i < targetItems.length; i++) {
                    try {
                        var item = targetItems[i];
                        var bookHref = $(item).find("a").attr("href");
                        var originId = bookHref.replace(/\//g, "");
                        var savedBook = await bookSequelize.findOneBook({
                            branchId: branch.branchId,
                            originId: originId
                        })
                        if (savedBook) {
                            var result = await update_book(savedBook);
                        } else {
                            var result = await create_book(originId, branch.category[category][1], category);
                        }
                        if (!result) throw new Error("save book error.")
                    } catch (err) {
                        console.log(category, branch.category[category][0], index, i, originId);
                        console.log(err);
                    }
                }
            } catch (err) {
                console.log(category, branch.category[category][0], index);
                console.log(err);
            }
            index++;
        } while (index <= endIndex);
    } catch (err) {
        console.log(err);
    }
}

async function create_book(originId, categoryId, categoryName) {
    try {
        var bookHref = "/" + originId + "/";
        var book = {
            copyInfo: {
                m: branch.copyUrl, //移动端地址
                pc: branch.pcCopyUrl, //pc端地址
                // book: bookHref, //book路径
                // chapter: bookHref + "**chapter**.html"
            },
            originId: originId,
            branchId: branch.branchId,
            categoryId: categoryId,
            categoryName: categoryName,
            bookType: 1,
            recommend: 60 + parseInt(40 * Math.random()),
            chapters: []
        }
        // console.log(bookHref);
        var $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
        book.cover = $("#fmimg").find("img").attr("src");
        if (!/^(http)/.test(book.cover)) book.cover = branch.pcCopyUrl + book.cover;
        var liItems = $("#info").children();
        book.title = $(liItems[0]).text();
        // console.log(book.title);
        book.writer = $(liItems[1]).text().split(":")[1];
        if (!book.categoryName) book.categoryName = $(liItems[2]).text().split(":")[1];
        if (!book.categoryId) book.categoryId = branch.category[book.categoryName] ? branch.category[book.categoryName][1] : 7
        book.publishStatus = $('meta[property="og:novel:status"]').attr("content").indexOf("连载") > -1 ? 1 : 2;
        book.lastUpdatedAt = new Date($(liItems[3]).text().split(/\s+\:/)[1]);
        book.abstractContent = $($("#intro").children()[0]).html().replace(/<br>/g, "\\n");
        var sameBook = await bookSequelize.findOneBook({
            branchId: branch.branchId,
            title: book.title,
            writer: book.writer
        })
        if (sameBook) return true;
        branch.bookCount++;
        book.sn = util.prefixInteger(branch.bookCount, 8);
        var savedBook = await bookSequelize.create(book);
        var start = 0;
        var newChapters = [];
        var lastChapter = null;
        var chapters = $("#list dl").children();
        for (var j = start; j < chapters.length; j++) {
            var a = $(chapters[j]).children()[0];
            var aHref = $(a).attr("href");
            var ids = aHref.match(/\d+/g);
            var newChapter = {
                title: $(a).text(),
                number: j + 1,
                type: 1,
                bookId: savedBook.bookId,
                branchId: branch.branchId,
                originId: ids[ids.length - 1]
            };
            if (j < chapters.length - 1) {
                newChapters.push(newChapter);
            } else if (j == chapters.length - 1) {
                lastChapter = newChapter;
            }
        }
        if (newChapters.length) var added = await bookChapterSequelize.bulkCreate(newChapters);
        if (lastChapter) {
            var added = await bookChapterSequelize.create(lastChapter);
            savedBook.set("lastChapterId", added.chapterId);
        }
        savedBook.set("chapterCount", chapters.length);
        await savedBook.save();
        return savedBook;
    } catch (err) {
        console.log(err, book);
        return false;
    }
}

exports.create_book = create_book;

async function update_book(savedBook) {
    try {
        var bookHref = "/" + savedBook.originId + "/";
        var $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
        var liItems = $("#info").children();
        // console.log($(liItems[0]).text());
        var lastUpdatedAt = new Date($(liItems[3]).text().split(/\s+\:/)[1]);
        if (!savedBook.lastChapterId || Math.abs(lastUpdatedAt.getTime() - new Date(savedBook.lastUpdatedAt).getTime()) > 10000) {
            savedBook.set("lastUpdatedAt", lastUpdatedAt);
            savedBook.set("publishStatus", $('meta[property="og:novel:status"]').attr("content").indexOf("连载") > -1 ? 1 : 2);
            var start = savedBook.chapterCount || 0;
            var newChapters = [];
            var lastChapter = null;
            var chapters = $("#list dl").children();
            for (var j = start; j < chapters.length; j++) {
                var a = $(chapters[j]).children()[0];
                var aHref = $(a).attr("href");
                var ids = aHref.match(/\d+/g);
                var newChapter = {
                    title: $(a).text(),
                    number: j + 1,
                    type: 1,
                    bookId: savedBook.bookId,
                    branchId: branch.branchId,
                    originId: ids[ids.length - 1]
                };
                if (j < chapters.length - 1) {
                    newChapters.push(newChapter);
                } else if (j == chapters.length - 1) {
                    lastChapter = newChapter;
                }
            }
            if (newChapters.length) var added = await bookChapterSequelize.bulkCreate(newChapters);
            if (lastChapter) {
                var added = await bookChapterSequelize.create(lastChapter);
                savedBook.set("lastChapterId", added.chapterId);
            }
            savedBook.set("chapterCount", chapters.length);
            await savedBook.save();
        }
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}


exports.copy_page = async function() {
    try {
        try {
            var path = "";
            console.log(path);
            var recommendBookIds = [];
            var rankBookIds = [];
            var hotBookIds = [];
            var allRecommendOriginIds = {};
            console.log("homepage page");
            var savedRank = await pageSequelize.findOne({
                branchId: branch.branchId,
                token: "homepage"
            })
            var $ = await commonController.copyHtml(branch.pcCopyUrl, path, branch.charset);
            var targetItems = $("#hotcontent").find(".item");
            for (var i = 0; i < targetItems.length; i++) {
                try {
                    var item = targetItems[i];
                    var bookHref = $(item).find("a").attr("href");
                    var originId = bookHref.match(/\/\d+\_\d+\//g)[0].replace(/\//g, "");
                    var savedBook = await bookSequelize.findOneBook({
                        branchId: branch.branchId,
                        originId: originId
                    })
                    if (!savedBook) {
                        savedBook = await create_book(originId);
                        if (!savedBook) continue;
                    }
                    recommendBookIds.push(savedBook.bookId);
                } catch (err) {
                    console.log(originId);
                    console.log(err);
                }
            }

            if (!savedRank) {
                var targetItems = $("#hotcontent").find("ul li");
                for (var i = 0; i < targetItems.length; i++) {
                    try {
                        var item = targetItems[i];
                        var bookHref = $(item).find("a").attr("href");
                        if (!bookHref.match(/\/\d+\_\d+\//g)) continue;
                        var originId = bookHref.match(/\/\d+\_\d+\//g)[0].replace(/\//g, "");
                        var savedBook = await bookSequelize.findOneBook({
                            branchId: branch.branchId,
                            originId: originId
                        })
                        if (!savedBook) {
                            savedBook = await create_book(originId);
                            if (!savedBook) continue;
                        }
                        hotBookIds.push(savedBook.bookId);
                    } catch (err) {
                        console.log(originId);
                        console.log(err);
                    }
                }
            }


            var targetItems = $("#newscontent .r").find("li");
            for (var i = 0; i < targetItems.length; i++) {
                try {
                    var item = targetItems[i];
                    var bookHref = $(item).find("a").attr("href");
                    var originId = bookHref.match(/\/\d+\_\d+\//g)[0].replace(/\//g, "");
                    var savedBook = await bookSequelize.findOneBook({
                        branchId: branch.branchId,
                        originId: originId
                    })
                    if (!savedBook) {
                        savedBook = await create_book(originId);
                        if (!savedBook) continue;
                    }
                    rankBookIds.push(savedBook.bookId);
                } catch (err) {
                    console.log(originId);
                    console.log(err);
                }
            }
            if (recommendBookIds.length && rankBookIds.length) {
                if (savedRank) {
                    savedRank.set("recommendBookIds", recommendBookIds);
                    savedRank.set("rankBookIds", rankBookIds);
                    await savedRank.save();
                } else {
                    await pageSequelize.create({
                        token: "homepage",
                        name: "首页",
                        recommendBookIds: recommendBookIds,
                        rankBookIds: rankBookIds,
                        hotBookIds: hotBookIds,
                        orderIndex: 0,
                        branchId: branch.branchId
                    });
                }
            }

            var recommendContents = $(".novelslist").find(".content");
            for (var i = 0; i < recommendContents.length; i++) {
                var key = $(recommendContents[i]).find("h2").text();
                if (!key) continue;
                allRecommendOriginIds[key] = [];
                $(recommendContents[i]).find("a").each(function(i, ele) {
                    var originId = $(this).attr("href").match(/\/\d+\_\d+\//g)[0].replace(/\//g, "");
                    allRecommendOriginIds[key].push(originId);
                })
                allRecommendOriginIds[key] = _.uniq(allRecommendOriginIds[key]);
            }


        } catch (err) {
            console.log(err);
        }
        var orderIndex = 0;
        for (var category in branch.category) {
            try {
                orderIndex++;
                var path = "/list/" + branch.category[category][0] + "_1" + ".html";
                console.log(path);
                var recommendBookIds = [];
                var rankBookIds = [];
                var $ = await commonController.copyHtml(branch.pcCopyUrl, path, branch.charset);
                if (allRecommendOriginIds[category] && allRecommendOriginIds[category].length) {
                    for (var i = 0; i < allRecommendOriginIds[category].length; i++) {
                        try {
                            var originId = allRecommendOriginIds[category][i];
                            var savedBook = await bookSequelize.findOneBook({
                                branchId: branch.branchId,
                                originId: originId
                            })
                            if (!savedBook) {
                                savedBook = await create_book(originId, branch.category[category][1], category);
                                if (!savedBook) continue;
                            }
                            recommendBookIds.push(savedBook.bookId);
                        } catch (err) {
                            console.log(category, originId);
                            console.log(err);
                        }
                    }
                }


                var targetItems = $("#newscontent .r").find("li");
                for (var i = 0; i < targetItems.length; i++) {
                    try {
                        var item = targetItems[i];
                        var bookHref = $(item).find("a").attr("href");
                        var originId = bookHref.match(/\/\d+\_\d+\//g)[0].replace(/\//g, "");
                        var savedBook = await bookSequelize.findOneBook({
                            branchId: branch.branchId,
                            originId: originId
                        })
                        if (!savedBook) {
                            savedBook = await create_book(originId, branch.category[category][1], category);
                            if (!savedBook) continue;
                        }
                        rankBookIds.push(savedBook.bookId);
                    } catch (err) {
                        console.log(category, originId);
                        console.log(err);
                    }
                }
                if (!rankBookIds.length || !recommendBookIds.length) continue;
                var savedRank = await pageSequelize.findOne({
                    branchId: branch.branchId,
                    token: branch.category[category][2].toString()
                })
                if (savedRank) {
                    savedRank.set("recommendBookIds", recommendBookIds);
                    savedRank.set("rankBookIds", rankBookIds);
                    await savedRank.save();
                } else {
                    await pageSequelize.create({
                        token: branch.category[category][2],
                        name: category,
                        recommendBookIds: recommendBookIds,
                        rankBookIds: rankBookIds,
                        orderIndex: orderIndex,
                        branchId: branch.branchId
                    });
                }
            } catch (err) {
                console.log(category);
                console.log(err);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

exports.copy_rank = function() {
    try {
        for (var rankName in branch.rank) {
            var rank = branch.rank[rankName];
            var totalPage = 2000;

            // try {
            //     var path = "/" + rank.token + "/1.html";
            //     console.log(path);
            //     var $ = await commonController.copyHtml(branch.copyUrl, path, branch.charset);
            //     var pages = $(".page2").text().match(/\d+/g);
            //     if (pages[1]) totalPage = parseInt(pages[1]);
            //     console.log(category, totalPage);
            // } catch (err) {
            //     console.log("获取分类totalPage失败", category, err);
            // }
            // var totalPage = 2000;
            // var ranges = _.range(1, totalPage, 200);
            // console.log(ranges);
            // _.forEach(ranges, function(start, index) {
            //     copy_rank_books(rank, start, start + 199 > totalPage ? totalPage : start + 199, index + 1);
            // })
            copy_rank_books(rank.token, 1, totalPage);
        }
    } catch (err) {
        console.log(err);
    }
}

async function copy_rank_books(token, startIndex, endIndex) {
    try {
        var index = startIndex;
        if (branch.isTest) endIndex = startIndex + 3;
        var rankBookIds = [];
        do {
            var path = "/" + token + "/" + index + ".html";
            console.log(path);
            // var recommendBookIds = [];
            try {
                var $ = await commonController.copyHtml(branch.copyUrl, path, branch.charset);
                var targetItems = $(".list").find(".tjimg");
                for (var i = 0; i < targetItems.length; i++) {
                    try {
                        var item = targetItems[i];
                        var bookHref = $(item).find("a").attr("href");
                        var originId = bookHref.replace(/\//g, "");
                        var savedBook = await bookSequelize.findOneBook({
                            branchId: branch.branchId,
                            originId: originId
                        })
                        if (!savedBook) {
                            savedBook = await create_book(originId);
                            if (!savedBook) continue;
                        }
                        rankBookIds.push(savedBook.bookId);
                    } catch (err) {
                        console.log(token, originId);
                        console.log(err);
                    }
                }
            } catch (err) {
                console.log(token, index);
                console.log(err);
            }
            index++;
        } while (index <= endIndex)
        if (!rankBookIds.length) return;
        var savedRank = await rankSequelize.findOne({
            branchId: branch.branchId,
            token: token
        })
        if (savedRank) {
            savedRank.set("rankBookIds", rankBookIds);
            await savedRank.save();
        }
    } catch (err) {
        console.log(err);
    }
}