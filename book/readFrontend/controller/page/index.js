var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var moment = require('moment');
var util = require("../../util/index.js");
var httpGateway = require("../../data/http/httpGateway.js");
var homeController = require("../read/homeController.js");
var bookController = require("../read/bookController.js");
var readController = require("../read/readController.js");
var rankController = require("../read/rankController.js");
var chargeController = require("../read/chargeController.js");
var userController = require("../user/userController.js");
var auth = require('../user/auth.js');

exports.login = async function(req, res) {
    var branchInfo = req.branchInfo;
    res.render('login', {
        title: "用户登录_" + branchInfo.title,
        branchInfo: branchInfo,
        user: auth.getUser(req, res),
        currentRender: "login",
        pageTitle: "登录"
    })
};

exports.register = async function(req, res) {
    var branchInfo = req.branchInfo;
    res.render('register', {
        title: "用户注册_" + branchInfo.title,
        branchInfo: branchInfo,
        user: auth.getUser(req, res),
        currentRender: "register",
        pageTitle: "注册"
    })
};

exports.bookshelf = async function(req, res) {
    var branchInfo = req.branchInfo;
    var user = auth.getUser(req, res);
    if (user) {
        var bookMarks = await userController.getUserBookMarks(user.userId);
        res.render('bookshelf', {
            title: "我的书架_" + branchInfo.title,
            branchInfo: branchInfo,
            currentRender: "bookshelf",
            user: auth.getUser(req, res),
            pageTitle: "我的书架",
            bookMarks: bookMarks
        })
    } else {
        res.redirect("/login?o=/bookshelf")
    }

};

exports.home = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var blocks = await rankController.listPage(branchInfo.branchId);
        var lastUpdatedBooks = await bookController.listBook({
            // branchId: branchInfo.branchId,
            pageSize: 30,
            page: 1
        })
        res.render('home', {
            title: "首页_" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "home",
            firstBlock: blocks[0],
            otherBlocks: blocks.slice(1),
            lastUpdatedBooks: lastUpdatedBooks.list
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            message: "请求错误！",
            error: err ? JSON.stringify(err) : ""
        });
    }
};

exports.category = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var currentCategoryId = null;
        var query = {
            // branchId: branchInfo.branchId,
            page: parseInt(req.params.page || 1),
            pageSize: 30
        };
        if (req.params.categoryId) currentCategoryId = parseInt(req.params.categoryId);
        var blocks = await rankController.listPage(branchInfo.branchId);
        if (currentCategoryId) {
            var currentCategory = _.find(branchInfo.categoryMap, function(category) {
                return category[1] == currentCategoryId || _.indexOf(category[2], currentCategoryId) > -1;
            });
            var currentBlock = _.find(blocks, { name: currentCategory[0] });
            if (currentCategory[2]) {
                query.categoryId = {
                    [Op.in]: currentCategory[2]
                }
                currentCategoryId = currentCategory[1];
            } else query.categoryId = currentCategoryId;
        } else {
            var currentCategory = ["全部小说"];
        }
        var lastUpdatedBooks = await bookController.listBook(query);
        var currentPage = query.page;
        res.render('category', {
            title: currentCategory[0] + "_" + "好看的" + currentCategory[0] + "_" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: currentCategory[0],
            books: lastUpdatedBooks.list,
            currentBlock: currentBlock,
            currentRender: "category",
            currentCategoryId: currentCategoryId,
            pagination: {
                totalNum: lastUpdatedBooks.pagination.totalNum,
                currentPage: currentPage,
                totalPage: lastUpdatedBooks.pagination.totalPage
            }
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            message: "请求错误！",
            error: err ? JSON.stringify(err) : ""
        });
    }
};

exports.paihang = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var rankMap = branchInfo.rankMap;
        var currentRankId = req.params.rankId ? parseInt(req.params.rankId) : rankMap[0][1]
        var currentPage = parseInt(req.params.page || 1);
        var pageSize = 30;
        var currentRank = _.find(rankMap, function(category) {
            return category[1] == currentRankId;
        })
        currentRank = currentRank[0];
        if (currentRankId == 10) {
            var result = await bookController.listBook({ page: currentPage, pageSize: pageSize }, [
                ["createdAt", "desc"]
            ]);
        } else if (currentRankId == 11) {
            var result = await bookController.listBook({ page: currentPage, pageSize: pageSize }, [
                ["lastUpdatedAt", "desc"]
            ]);
        } else {
            var result = await rankController.listPaihang(currentRankId, currentPage, pageSize);
        }
        res.render('paihang', {
            title: currentRank + "小说列表_" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: currentRank,
            books: result.list,
            currentRender: "paihang",
            currentRankId: currentRankId,
            pagination: {
                totalNum: result.pagination.totalNum,
                currentPage: currentPage,
                totalPage: result.pagination.totalPage,
            }
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            message: "请求错误！",
            error: err ? JSON.stringify(err) : ""
        });
    }
};

exports.quanben = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var currentCategoryId = null;
        var query = {
            // branchId: branchInfo.branchId,
            publishStatus: 2,
            page: parseInt(req.params.page || 1),
            pageSize: 30
        };
        if (req.params.categoryId) currentCategoryId = parseInt(req.params.categoryId);
        if (currentCategoryId) {
            var currentCategory = _.find(branchInfo.categoryMap, function(category) {
                return category[1] == currentCategoryId || _.indexOf(category[2], currentCategoryId) > -1;
            });
            if (currentCategory[2]) {
                query.categoryId = {
                    [Op.in]: currentCategory[2]
                }
                currentCategoryId = currentCategory[1];
            } else query.categoryId = currentCategoryId;
        } else {
            var currentCategory = ["全部小说"];
        }
        var lastUpdatedBooks = await bookController.listBook(query);
        var currentPage = query.page;
        res.render('quanben', {
            title: "已完结" + currentCategory[0] + "小说列表_" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: currentCategory[0],
            books: lastUpdatedBooks.list,
            currentRender: "quanben",
            currentCategoryId: currentCategoryId,
            pagination: {
                totalNum: lastUpdatedBooks.pagination.totalNum,
                currentPage: currentPage,
                totalPage: lastUpdatedBooks.pagination.totalPage
            }
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            message: "请求错误！",
            error: err ? JSON.stringify(err) : ""
        });
    }
};

exports.quanbu = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        res.render('quanbu', {
            title: "全部小说列表_" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: "全部小说",
            categoryMap: branchInfo.categoryMap,
            currentRender: "quanbu"
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            message: "请求错误！",
            error: err ? JSON.stringify(err) : ""
        });
    }
};

exports.history = async function(req, res) {
    var branchInfo = req.branchInfo;
    res.render('history', {
        title: "阅读记录_" + branchInfo.title,
        branchInfo: branchInfo,
        user: auth.getUser(req, res),
        pageTitle: "阅读记录",
        currentRender: "history"
    })
};

exports.book = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var result = await readController.bookDeail(parseInt(req.params.bookId));
        var bookUrl = req.protocol + "://" + req.headers.host + "/book/" + req.params.bookId + "/";
        var book = result.book;
        var description = book.title + "最新章节由网友提供，《" + book.title + "》情节跌宕起伏、扣人心弦，是一本情节与文笔俱佳的" + book.categoryName + "小说，" + branchInfo.title + "免费提供" + book.writer + "最新清爽干净的文字章节在线阅读.";
        var currentCategory = _.find(branchInfo.categoryMap, function(category) {
            return category[1] == book.categoryId || _.indexOf(category[2], book.categoryId) > -1;
        });
        if (currentCategory) book.categoryId = currentCategory[1];
        res.render('book', {
            title: book.title + "最新章节列表_" + book.title + "最新章节目录_" + branchInfo.shorttitle,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "book",
            keywords: book.title + "," + book.title + "最新章节" + "," + book.writer,
            description: description,
            pageTitle: book.title,
            book: book,
            bookUrl: bookUrl,
            abstractContent: book.abstractContent ? book.abstractContent.replace(/\\n/g, '').replace(/\s+/g, '') : '',
            lastChapters: result.allChapters.slice(-21).reverse(),
            allChapters: result.allChapters,
            lastChapterName: book.lastChapter ? book.lastChapter.title : "",
            lastChapterUrl: book.lastChapter ? bookUrl + book.lastChapter.number : "",
            // firstChapters: result.firstChapters
        });
        if (book.publishStatus == 1) {
            httpGateway.publishUpdateStartReq(book.branchId, "update_book", { bookId: book.bookId });
        }
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: "",
            pageTitle: "资源错误",
            books: [],
            pagination: null
        });
    }
};

exports.mulu = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var query = {
            bookId: parseInt(req.params.bookId),
            page: parseInt(req.params.page || 1),
            pageSize: 100
        };
        var result = await readController.bookChapters(query);
        var currentPage = query.page;
        var book = result.book;
        res.render('mulu', {
            title: book.title + "全部章节列表_" + book.title + "全部章节目录_" + branchInfo.shorttitle,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "mulu",
            pageTitle: book.title,
            book: book,
            chapters: result.list,
            pagination: {
                totalNum: result.pagination.totalNum,
                currentPage: currentPage,
                totalPage: result.pagination.totalPage
            }
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: "",
            pageTitle: "资源错误",
            books: [],
            pagination: null
        });
    }
};

exports.chapter = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var chapter = await readController.chapterDetail(parseInt(req.params.bookId), parseInt(req.params.number));
        var description = branchInfo.shorttitle + "提供了" + chapter.book.writer + "创作的" + chapter.book.categoryName + "《" + chapter.book.title + "》清爽干净的文字章节：" + chapter.title;
        if (chapter) {
            res.render('chapter', {
                title: chapter.title + "_" + branchInfo.title,
                branchInfo: branchInfo,
                user: auth.getUser(req, res),
                currentRender: "chapter",
                keywords: chapter.book.title + "," + chapter.title + "," + chapter.book.writer,
                description: description,
                pageTitle: chapter.title,
                chapter: chapter,
                chapterCount: chapter.book.chapterCount,
                number: chapter.number,
                now: moment().format("YYYY-MM-DD HH:mm:ss")
            });
        } else res.redirect("/book/" + req.params.bookId + "/mulu");
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: "",
            pageTitle: "资源错误",
            books: [],
            pagination: null
        });
    }
};

exports.search = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        if (!req.query.keyword) {
            res.render('search', {
                title: "搜索_输入书名•作者_小说_" + branchInfo.title,
                branchInfo: branchInfo,
                user: auth.getUser(req, res),
                currentRender: "search",
                keywords: "",
                pageTitle: "无搜索内容，搜索请输入书名或作者",
                books: [],
                pagination: null
            });
            return;
        }

        var branchInfo = req.branchInfo;
        var query = {
            // branchId: branchInfo.branchId,
            searchContent: req.query.keyword.replace(/^\s+|\s+$/g, ""),
            page: parseInt(req.query.page || 1),
            pageSize: 30
        };

        var lastUpdatedBooks = await bookController.listBook(query);
        var currentPage = query.page;
        res.render('search', {
            title: "搜索_" + query.searchContent + "_" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            pageTitle: "搜索 " + query.searchContent + " 的结果",
            books: lastUpdatedBooks.list,
            keywords: query.searchContent,
            pagination: {
                totalNum: lastUpdatedBooks.pagination.totalNum,
                currentPage: currentPage,
                totalPage: lastUpdatedBooks.pagination.totalPage
            }
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            message: "请求错误！",
            error: err ? JSON.stringify(err) : ""
        });
    }
};

exports.error = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: "",
            pageTitle: "资源错误",
            books: [],
            pagination: null
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            message: "请求错误！",
            error: err ? JSON.stringify(err) : ""
        });
    }
};