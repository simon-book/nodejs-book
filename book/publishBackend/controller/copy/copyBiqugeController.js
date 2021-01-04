var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');
var util = require('../../util/index.js');
var httpGateway = require('../../data/http/httpGateway.js')
// var branchMap = require('./commonController.js').branchMap
var branchSequelize = require('../../data/sequelize/branch/branchSequelize.js');
var bookCategorySequelize = require('../../data/sequelize/book/bookCategorySequelize.js');
var tagSequelize = require('../../data/sequelize/book/tagSequelize.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');
var rankSequelize = require('../../data/sequelize/rank/rankSequelize.js');
var pageSequelize = require('../../data/sequelize/rank/pageSequelize.js');

var branch = { //笔趣阁
    copySrc: "www.biquge.info",
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
            branch.categoryPage = savedBranch.copyParams.categoryPage;
            branch.rankPage = savedBranch.copyParams.rankPage;
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
                branch.rank[item.name] = item.token;
            })
        }
    } catch (err) {
        console.log(err);
    }
}

exports.copy_book_category = async function() {
    try {
        var path = "/sort.html";
        console.log(path);
        var html = await httpGateway.htmlStartReq(branch.copyUrl, path, branch.charset);
        var $ = cheerio.load(html, {
            decodeEntities: false
        });
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
        var html = await httpGateway.htmlStartReq(branch.copyUrl, path, branch.charset);
        var $ = cheerio.load(html, {
            decodeEntities: false
        });
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

exports.copy_all_books = async function(categoryPageIndex) {
    try {
        for (var category in branch.category) {
            copy_category_books(category, categoryPageIndex);
        }
    } catch (err) {
        console.log(err);
    }
}


async function copy_category_books(category, categoryPageIndex) {
    try {
        var index = 1;
        var totalPage = 1;
        try {
            var path = "/list/" + branch.category[category][0] + "_1" + ".html";
            console.log(path);
            var html = await httpGateway.htmlStartReq(branch.copyUrl, path, branch.charset);
            var $ = cheerio.load(html, {
                decodeEntities: false
            });
            var pages = $(".page2").text().match(/\d+/g);
            if (pages[1]) totalPage = parseInt(pages[1]);
            console.log(totalPage);
        } catch (err) {
            console.log("获取分类totalPage失败", category);
        }
        if (categoryPageIndex && totalPage >= categoryPageIndex) index = categoryPageIndex;
        do {
            try {
                var path = "/list/" + branch.category[category][0] + "_" + index + ".html";
                console.log(path);
                var html = await httpGateway.htmlStartReq(branch.copyUrl, path, branch.charset);
                var $ = cheerio.load(html, {
                    decodeEntities: false
                });
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
                index++;
            } catch (err) {
                console.log(category, branch.category[category][0], index);
                console.log(err);
            }
        } while (index <= branch.categoryPage && index <= totalPage);
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
        console.log(bookHref);
        var bookHtml = await httpGateway.htmlStartReq(branch.pcCopyUrl, bookHref, branch.charset);
        var $ = cheerio.load(bookHtml, {
            decodeEntities: false
        });
        book.cover = $("#fmimg").find("img").attr("src");
        if (!/^(http)/.test(book.cover)) book.cover = branch.pcCopyUrl + book.cover;
        var liItems = $("#info").children();
        book.title = $(liItems[0]).text();
        console.log(book.title);
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
        var chapters = $("#list dl").children();
        book.chapterCount = chapters.length;
        for (var j = 0; j < chapters.length; j++) {
            var a = $(chapters[j]).children()[0];
            var aHref = $(a).attr("href");
            var ids = aHref.match(/\d+/g);
            book.chapters.push({
                title: $(a).text(),
                number: j + 1,
                type: 1,
                branchId: branch.branchId,
                originId: ids[ids.length - 1]
            });
        }
        if (!book.chapters.length) return true;
        var count = await bookSequelize.countBooks({
            branchId: branch.branchId
        });
        book.sn = util.prefixInteger(count + 1, 8);
        var added = await bookSequelize.create(book);
        return added;
    } catch (err) {
        console.log(err, book);
        return false;
    }
}

exports.create_book = create_book;

async function update_book(savedBook) {
    try {
        var bookHref = "/" + savedBook.originId + "/";
        var bookHtml = await httpGateway.htmlStartReq(branch.pcCopyUrl, bookHref, branch.charset);
        var $ = cheerio.load(bookHtml, {
            decodeEntities: false
        });
        var liItems = $("#info").children();
        console.log($(liItems[0]).text());
        var lastUpdatedAt = new Date($(liItems[3]).text().split(/\s+\:/)[1]);
        if (Math.abs(lastUpdatedAt.getTime() - new Date(savedBook.lastUpdatedAt).getTime()) > 10000) {
            savedBook.set("lastUpdatedAt", lastUpdatedAt);
            savedBook.set("publishStatus", $('meta[property="og:novel:status"]').attr("content").indexOf("连载") > -1 ? 1 : 2);

            var newChapters = [];
            var chapters = $("#list dl").children();
            for (var j = savedBook.chapterCount; j < chapters.length; j++) {
                var a = $(chapters[j]).children()[0];
                var aHref = $(a).attr("href");
                var ids = aHref.match(/\d+/g);
                newChapters.push({
                    title: $(a).text(),
                    bookId: savedBook.bookId,
                    number: j + 1,
                    type: 1,
                    branchId: branch.branchId,
                    originId: ids[ids.length - 1]
                });
            }
            savedBook.set("chapterCount", chapters.length)
            await bookSequelize.updateBookAndChapters(savedBook, newChapters);
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
            var allRecommendOriginIds = {};
            console.log("homepage page");
            var html = await httpGateway.htmlStartReq(branch.pcCopyUrl, path, branch.charset);
            var $ = cheerio.load(html, {
                decodeEntities: false
            });
            var targetItems = $("#hotcontent").find(".item");
            for (var i = 0; i < targetItems.length; i++) {
                try {
                    var item = targetItems[i];
                    var bookHref = $(item).find("a").attr("href");
                    var originId = bookHref.split("info/")[1].replace("\/", "");
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

            var targetItems = $("#newscontent .r").find("li");
            for (var i = 0; i < targetItems.length; i++) {
                try {
                    var item = targetItems[i];
                    var bookHref = $(item).find("a").attr("href");
                    var originId = bookHref.split("info/")[1].replace("\/", "");
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
                var savedRank = await pageSequelize.findOne({
                    branchId: branch.branchId,
                    token: "homepage"
                })
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
                    var originId = $(this).attr("href").split("info/")[1].replace("\/", "");
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
                var html = await httpGateway.htmlStartReq(branch.pcCopyUrl, path, branch.charset);
                var $ = cheerio.load(html, {
                    decodeEntities: false
                });

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
                        var originId = bookHref.split("info/")[1].replace("\/", "");
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

exports.copy_rank = async function() {
    try {
        var orderIndex = 0;
        for (var rank in branch.rank) {
            try {
                orderIndex++;
                var index = 1;
                var rankBookIds = [];
                do {
                    var path = "/" + branch.rank[rank] + "/" + index + ".html";
                    console.log(path);
                    // var recommendBookIds = [];
                    try {
                        var html = await httpGateway.htmlStartReq(branch.copyUrl, path, branch.charset);
                        var $ = cheerio.load(html, {
                            decodeEntities: false
                        });
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
                                console.log(rank, originId);
                                console.log(err);
                            }
                        }
                        index++;
                    } catch (err) {
                        console.log(rank, index);
                        console.log(err);
                    }
                } while (index <= branch.rankPage)
                if (!rankBookIds.length) continue;
                var savedRank = await rankSequelize.findOne({
                    branchId: branch.branchId,
                    token: branch.rank[rank]
                })
                if (savedRank) {
                    // savedRank.set("recommendBookIds", recommendBookIds);
                    savedRank.set("rankBookIds", rankBookIds);
                    await savedRank.save();
                } else {
                    await rankSequelize.create({
                        token: branch.rank[rank],
                        name: rank,
                        // recommendBookIds: recommendBookIds,
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