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
        title: "登录 " + branchInfo.title,
        keywords: "",
        description: "",
        pageTitle: "登录"
    })
};

exports.register = async function(req, res) {
    var branchInfo = req.branchInfo;
    res.render('register', {
        title: "注册 " + branchInfo.title,
        keywords: "",
        description: "",
        pageTitle: "注册"
    })
};

exports.bookshelf = async function(req, res) {
    var branchInfo = req.branchInfo;
    var user = auth.getUser(req, res);
    if (user) {
        var bookMarks = await userController.getUserBookMarks(user.userId);
        res.render('bookshelf', {
            title: "我的书架 " + branchInfo.title,
            keywords: "",
            description: "",
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
        // var blocks = await homeController.index(branchInfo.branchId, true);
        var blocks = await rankController.listPage(branchInfo.branchId, true, false);
        res.render('home', {
            title: "首页 " + branchInfo.title,
            keywords: branchInfo.keywords,
            description: branchInfo.description,
            firstBlock: blocks[0],
            otherBlocks: blocks.slice(1)
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
        var href = "/category";
        var query = {
            branchId: branchInfo.branchId
        };
        if (req.params.categoryId) {
            query.categoryId = parseInt(req.params.categoryId);
            href += "/" + req.params.categoryId;
        }
        if (req.params.page) {
            query.page = parseInt(req.params.page);
        }
        var result = await bookController.listBook(query);
        var currentPage = parseInt(result.pagination.page);
        var totalPage = Math.ceil(result.pagination.totalNum / result.pagination.pageSize);
        var prevPage = currentPage > 1 ? currentPage - 1 : 0;
        var nextPage = currentPage < totalPage ? currentPage + 1 : 0;
        var categoryMap = branchInfo.categoryMap;
        var currentCategory = "全部小说"
        if (query.categoryId) {
            currentCategory = _.find(categoryMap, function(category) {
                return category[1] == query.categoryId;
            })
            currentCategory = currentCategory[0];
        }
        res.render('category', {
            title: currentCategory + " " + branchInfo.title,
            keywords: "",
            description: "",
            pageTitle: currentCategory,
            books: result.list,
            categoryMap: categoryMap,
            currentCategoryId: query.categoryId,
            pageIndex: "category",
            pagination: {
                currentPage: currentPage,
                totalPage: totalPage,
                href: href + "/",
                prevPage: prevPage ? href + "/" + prevPage : null,
                nextPage: nextPage ? href + "/" + nextPage : null
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
        var href = "/rank/" + currentRankId;
        var currentPage = req.params.page ? parseInt(req.params.page) : 1;
        var currentRank = _.find(rankMap, function(category) {
            return category[1] == currentRankId;
        })
        currentRank = currentRank[0];
        var result = await rankController.listPaihang(currentRankId, currentPage, 20);
        var totalPage = result.totalPage;
        var prevPage = currentPage > 1 ? currentPage - 1 : 0;
        var nextPage = currentPage < totalPage ? currentPage + 1 : 0;
        res.render('paihang', {
            title: currentRank + " " + branchInfo.title,
            keywords: "",
            description: "",
            pageTitle: currentRank,
            books: result.books,
            rankMap: rankMap,
            currentRankId: currentRankId,
            pageIndex: "rank",
            pagination: {
                currentPage: currentPage,
                totalPage: totalPage,
                href: href + "/",
                prevPage: prevPage ? href + "/" + prevPage : null,
                nextPage: nextPage ? href + "/" + nextPage : null
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
        var href = "/quanben";
        var query = {
            branchId: branchInfo.branchId,
            publishStatus: 2
        };
        if (req.params.categoryId) {
            query.categoryId = parseInt(req.params.categoryId);
            href += "/" + req.params.categoryId;
        }
        if (req.params.page) {
            query.page = parseInt(req.params.page);
        }
        var result = await bookController.listBook(query);
        var currentPage = parseInt(result.pagination.page);
        var totalPage = Math.ceil(result.pagination.totalNum / result.pagination.pageSize);
        var prevPage = currentPage > 1 ? currentPage - 1 : 0;
        var nextPage = currentPage < totalPage ? currentPage + 1 : 0;
        var categoryMap = branchInfo.categoryMap;
        var currentCategory = "全部小说"
        if (query.categoryId) {
            currentCategory = _.find(categoryMap, function(category) {
                return category[1] == query.categoryId;
            })
            currentCategory = currentCategory[0];
        }
        res.render('category', {
            title: "已完结 " + currentCategory + " " + branchInfo.title,
            keywords: "",
            description: "",
            pageTitle: "已完结 " + currentCategory,
            books: result.list,
            categoryMap: categoryMap,
            currentCategoryId: query.categoryId,
            pageIndex: "quanben",
            pagination: {
                currentPage: currentPage,
                totalPage: totalPage,
                href: href + "/",
                prevPage: prevPage ? href + "/" + prevPage : null,
                nextPage: nextPage ? href + "/" + nextPage : null
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

exports.rank = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var ranks = await rankController.listRank(branchInfo.branchId, false, true);
        res.render('rank', {
            title: "排行 " + branchInfo.title,
            keywords: branchInfo.keywords,
            description: branchInfo.description,
            pageTitle: "小说排行",
            ranks: ranks
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
        title: "阅读记录 " + branchInfo.title,
        keywords: "",
        description: "",
        pageTitle: "阅读记录"
    })
};

exports.book = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var result = await readController.bookDeail(parseInt(req.params.bookId));
        res.render('book', {
            title: result.book.title + " " + branchInfo.title,
            keywords: "",
            description: "",
            pageTitle: result.book.title,
            book: result.book,
            lastChapters: result.lastChapters,
            firstChapters: result.firstChapters
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            message: "请求错误！",
            error: err ? JSON.stringify(err) : ""
        });
    }
};

exports.mulu = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var href = "/book/" + req.params.bookId + "/mulu";
        var query = {
            bookId: parseInt(req.params.bookId)
        };
        if (req.params.page) query.page = parseInt(req.params.page);
        else query.page = 1
        query.pageSize = 100;
        var result = await readController.bookChapters(query);
        var currentPage = parseInt(result.pagination.page);
        var totalPage = Math.ceil(result.pagination.totalNum / result.pagination.pageSize);
        var prevPage = currentPage > 1 ? currentPage - 1 : 0;
        var nextPage = currentPage < totalPage ? currentPage + 1 : 0;
        res.render('mulu', {
            title: result.book.title + " 章节目录 " + branchInfo.title,
            keywords: "",
            description: "",
            pageTitle: result.book.title,
            book: result.book,
            chapters: result.list,
            pagination: {
                currentPage: currentPage,
                totalPage: totalPage,
                href: href + "/",
                prevPage: prevPage ? href + "/" + prevPage : null,
                nextPage: nextPage ? href + "/" + nextPage : null
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

exports.chapter = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var chapter = await readController.chapterDetail(parseInt(req.params.bookId), parseInt(req.params.number));
        if (chapter) {
            res.render('chapter', {
                title: chapter.title + " " + branchInfo.title,
                keywords: "",
                description: "",
                pageTitle: chapter.title,
                chapter: chapter,
                number: chapter.number
            });
        } else res.redirect("/book/" + req.params.bookId + "/mulu");
    } catch (err) {
        console.log(err);
        res.render('error', {
            message: "请求错误！",
            error: err ? JSON.stringify(err) : ""
        });
    }
};

exports.search = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        if (!req.query.keyword) {
            res.render('search', {
                title: "搜索  输入书名•作者  小说 " + branchInfo.title,
                keywords: "",
                description: "",
                pageTitle: "搜索  输入书名•作者  小说",
                books: [],
                errorMsg: "指定关键字没有匹配到任何内容！",
                pagination: null
            });
            return;
        }
        var href = "/search";
        var query = {
            branchId: branchInfo.branchId,
            searchContent: req.query.keyword,
            pageSize: 50
        };
        href += "?keyword=" + req.query.keyword;
        if (req.query.page) {
            query.page = parseInt(req.query.page);
        }
        var result = await bookController.listBook(query);
        var currentPage = parseInt(result.pagination.page);
        var totalPage = Math.ceil(result.pagination.totalNum / result.pagination.pageSize);
        var prevPage = currentPage > 1 ? currentPage - 1 : 0;
        var nextPage = currentPage < totalPage ? currentPage + 1 : 0;
        res.render('search', {
            title: "搜索 " + req.query.keyword + " " + branchInfo.title,
            keywords: "",
            description: "",
            keyword: req.query.keyword,
            pageTitle: "搜索",
            books: result.list,
            errorMsg: result.list.length ? null : "指定关键字没有匹配到任何内容！",
            pagination: result.list.length ? {
                currentPage: currentPage,
                totalPage: totalPage,
                href: href + "&page=",
                prevPage: prevPage ? href + "&page=" + prevPage : null,
                nextPage: nextPage ? href + "&page=" + nextPage : null
            } : null
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            message: "请求错误！",
            error: err ? JSON.stringify(err) : ""
        });
    }
};