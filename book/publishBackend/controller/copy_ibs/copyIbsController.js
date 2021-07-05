var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');
var util = require('../../util/index.js');
var httpGateway = require('../../data/http/httpGateway.js')
var commonController = require('../copy_biqu/commonController.js')
var branchSequelize = require('../../data/sequelize/branch/branchSequelize.js');
var bookCategorySequelize = require('../../data/sequelize/book/bookCategorySequelize.js');
var tagSequelize = require('../../data/sequelize/book/tagSequelize.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');
var rankSequelize = require('../../data/sequelize/rank/rankSequelize.js');
var pageSequelize = require('../../data/sequelize/rank/pageSequelize.js');

var branch = {
    copySrc: "ibs" //www.ibswtan.com
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
            branch.isTest = savedBranch.copyParams.isTest || false;
            branch.category = {};
            var categories = await bookCategorySequelize.findAll({
                branchId: branch.branchId
            })
            _.forEach(categories, function(item) {
                branch.category[item.name] = [item.originId, item.categoryId, item.categoryId];
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
        var path = "/sort/";
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

exports.copy_all_books = async function(date) {
    try {
        for (var category in branch.category) {
            var totalPage = 0;
            try {
                var path = "/sort/" + branch.category[category][0] + "_1/";
                console.log(path);
                var $ = await commonController.copyHtml(branch.copyUrl, path, branch.charset);
                var pages = $(".page2").text().match(/\d+/g);
                if (pages[1]) totalPage = parseInt(pages[1]);
                console.log(category, totalPage);
                // branch.category[category].push(totalPage);
                await copy_category_books(category, 1, totalPage, date);
            } catch (err) {
                console.log("获取分类totalPage失败", category, err);
            }

            // var ranges = _.range(1, totalPage, 100);
            // console.log(ranges);
            // _.forEach(ranges, function(start) {
            //     copy_category_books(category, start, start + 99 > totalPage ? totalPage : start + 99, date);
            // })
        }
    } catch (err) {
        console.log(err);
    }
}


async function copy_category_books(category, startIndex, endIndex, date) {
    try {
        var index = startIndex;
        if (branch.isTest) endIndex = startIndex + 5;
        if (date != -1) {
            if (!date) date = moment().subtract(1, 'days');
            else date = moment(date);
            date = parseInt(date.format("YYMMDD"));
        }
        var stop = false;
        do {
            try {
                var path = "/sort/" + branch.category[category][0] + "_" + index + "/";
                console.log(path);
                var $ = await commonController.copyHtml(branch.copyUrl, path, branch.charset);
                var targetItems = $(".list.fk").children("ul");
                for (var i = 0; i < targetItems.length; i++) {
                    try {
                        var item = targetItems[i];
                        var bookHref = $(item).find("a").attr("href");
                        var originId = bookHref.replace(/^\/|\/$/g, "");
                        var savedBook = await bookSequelize.findOneBook({
                            title: $(item).find(".xsm a").text().replace(/\n|\t|\s/g, ""),
                            writer: $(item).find(".xsm").next().text().replace(/\n|\t|\s/g, "").split("：")[1]
                        })
                        if (savedBook && (savedBook.branchId != branch.branchId || savedBook.publishStatus == 2)) continue;
                        if (savedBook) {
                            bookHref = "/" + originId + "/";
                            var $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
                            var liItems = $("#info").children();
                            var lastUpdatedAt = new Date($(liItems[3]).text().split("：")[1]);
                            var bookDate = parseInt(moment(lastUpdatedAt).format("YYMMDD"));
                            if (bookDate < date) {
                                stop = true;
                                break;
                            }
                            if (savedBook.lastChapterId && Math.abs(lastUpdatedAt.getTime() - new Date(savedBook.lastUpdatedAt).getTime()) <= 10000) continue;
                            var result = await update_book(savedBook, $);
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
        } while (index <= endIndex && !stop);
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
        var chapters = $("#list dl").children();
        if (!chapters.length) return false;
        book.cover = $("#fmimg").find("img").attr("src");
        if (!/^(http)/.test(book.cover)) book.cover = branch.pcCopyUrl + book.cover;
        var liItems = $("#info").children();
        book.title = $(liItems[0]).text();
        // console.log(book.title);
        book.writer = $(liItems[1]).text().split("：")[1];
        if (!book.categoryName) book.categoryName = $('meta[property="og:novel:category"]').attr("content");
        if (!book.categoryId) book.categoryId = branch.category[book.categoryName] ? branch.category[book.categoryName][1] : 0;
        book.publishStatus = $('meta[property="og:novel:status"]').attr("content").indexOf("连载") > -1 ? 1 : 2;
        book.lastUpdatedAt = new Date($(liItems[3]).text().split("：")[1]);
        book.abstractContent = $($("#intro").children()[0]).html().replace(/<br>/g, "\\n");
        // var sameBook = await bookSequelize.findOneBook({
        //     branchId: branch.branchId,
        //     title: book.title,
        //     writer: book.writer
        // })
        // if (sameBook) return true;
        branch.bookCount++;
        book.sn = util.prefixInteger(branch.bookCount, 8);
        var savedBook = await bookSequelize.create(book);
        var start = 0;
        var newChapters = [];
        var lastChapter = null;

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

async function update_book(savedBook, $) {
    try {
        var bookHref = "/" + savedBook.originId + "/";
        if (!$) {
            $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
        }
        var liItems = $("#info").children();
        // console.log($(liItems[0]).text());
        var lastUpdatedAt = new Date($(liItems[3]).text().split("：")[1]);
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

exports.update_book = update_book;

exports.reset_books_copy = async function() {
    try {
        for (var category in branch.category) {
            // if (branch.category[category][1] == 15 || branch.category[category][1] == 16) continue;
            var totalPage = 0;
            try {
                var path = "/sort/" + branch.category[category][0] + "_1/";
                console.log(path);
                var $ = await commonController.copyHtml(branch.copyUrl, path, branch.charset);
                var pages = $(".page2").text().match(/\d+/g);
                if (pages[1]) totalPage = parseInt(pages[1]);
                console.log(category, totalPage);
                // branch.category[category].push(totalPage);
                await reset_category_books_copy(category, 1, totalPage);
            } catch (err) {
                console.log("获取分类totalPage失败", category, err);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

async function reset_category_books_copy(category, startIndex, endIndex) {
    try {
        var index = startIndex;
        if (branch.isTest) endIndex = startIndex + 5;
        var stop = false;
        do {
            try {
                var path = "/sort/" + branch.category[category][0] + "_" + index + "/";
                console.log(path);
                var $ = await commonController.copyHtml(branch.copyUrl, path, branch.charset);
                var targetItems = $(".list.fk").children("ul");
                for (var i = 0; i < targetItems.length; i++) {
                    try {
                        var item = targetItems[i];
                        var bookHref = $(item).find("a").attr("href");
                        var originId = bookHref.replace(/^\/|\/$/g, "");
                        var savedBook = await bookSequelize.findOneBook({
                            title: $(item).find(".xsm a").text().replace(/\n|\t|\s/g, ""),
                            writer: $(item).find(".xsm").next().text().replace(/\n|\t|\s/g, "").split("：")[1]
                        })
                        if (savedBook && savedBook.branchId == branch.branchId) continue;
                        if (savedBook && savedBook.categoryId <= 3) continue;
                        if (savedBook) {
                            if (savedBook.branchId == 2 || savedBook.branchId == 1) {
                                var bookHref = "/" + originId + "/";
                                var book = {
                                    copyInfo: {
                                        m: branch.copyUrl, //移动端地址
                                        pc: branch.pcCopyUrl, //pc端地址
                                    },
                                    originId: originId,
                                    branchId: branch.branchId,
                                    categoryId: branch.category[category][1],
                                    categoryName: category,
                                    // bookType: 1,
                                    // recommend: 60 + parseInt(40 * Math.random()),
                                    // chapters: []
                                }
                                var $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
                                var chapters = $("#list dl").children();
                                if (!chapters.length) return false;
                                book.cover = $("#fmimg").find("img").attr("src");
                                if (!/^(http)/.test(book.cover)) book.cover = branch.pcCopyUrl + book.cover;
                                var liItems = $("#info").children();
                                // book.title = $(liItems[0]).text();
                                // book.writer = $(liItems[1]).text().split("：")[1];
                                // if (!book.categoryName) book.categoryName = $('meta[property="og:novel:category"]').attr("content");
                                // if (!book.categoryId) book.categoryId = branch.category[book.categoryName] ? branch.category[book.categoryName][1] : 0;
                                book.publishStatus = $('meta[property="og:novel:status"]').attr("content").indexOf("连载") > -1 ? 1 : 2;
                                book.lastUpdatedAt = new Date($(liItems[3]).text().split("：")[1]);
                                book.abstractContent = $($("#intro").children()[0]).html().replace(/<br>/g, "\\n");

                                branch.bookCount++;
                                book.sn = util.prefixInteger(branch.bookCount, 8);

                                savedBook = await bookSequelize.update(book, {
                                    bookId: savedBook.bookId
                                });
                                await bookChapterSequelize.destroy({
                                    bookId: savedBook.bookId
                                });

                                var start = 0;
                                var newChapters = [];
                                var lastChapter = null;

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
                        } else {
                            var result = await create_book(originId, branch.category[category][1], category);
                        }
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
        } while (index <= endIndex && !stop);
    } catch (err) {
        console.log(err);
    }
}