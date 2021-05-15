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
        keywords: branchInfo.keywords,
        description: branchInfo.description,
        pageTitle: "登录"
    })
};

exports.register = async function(req, res) {
    var branchInfo = req.branchInfo;
    res.render('register', {
        title: "用户注册_" + branchInfo.title,
        keywords: branchInfo.keywords,
        description: branchInfo.description,
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
            keywords: branchInfo.keywords,
            description: branchInfo.description,
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
            title: "首页_" + branchInfo.title,
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
            title: currentCategory + "_" + "好看的" + currentCategory + "_" + branchInfo.title,
            keywords: branchInfo.keywords,
            description: branchInfo.description,
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
            title: currentRank + "小说列表_" + branchInfo.title,
            keywords: branchInfo.keywords,
            description: branchInfo.description,
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
            title: "已完结" + currentCategory + "小说列表_" + branchInfo.title,
            keywords: branchInfo.keywords,
            description: branchInfo.description,
            pageTitle: "已完结 " + currentCategory + " 小说",
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

// exports.rank = async function(req, res) {
//     try {
//         var branchInfo = req.branchInfo;
//         var ranks = await rankController.listRank(branchInfo.branchId, false, true);
//         res.render('rank', {
//             title: "小说排行_" + branchInfo.title,
//             keywords: branchInfo.keywords,
//             description: branchInfo.description,
//             pageTitle: "小说排行",
//             ranks: ranks
//         });
//     } catch (err) {
//         console.log(err);
//         res.render('error', {
//             message: "请求错误！",
//             error: err ? JSON.stringify(err) : ""
//         });
//     }
// };

exports.history = async function(req, res) {
    var branchInfo = req.branchInfo;
    res.render('history', {
        title: "阅读记录_" + branchInfo.title,
        keywords: branchInfo.keywords,
        description: branchInfo.description,
        pageTitle: "阅读记录"
    })
};

exports.book = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var result = await readController.bookDeail(parseInt(req.params.bookId));
        var bookUrl = req.protocol + "://" + req.headers.host + "/book/" + req.params.bookId + "/";
        var book = result.book;
        var description = book.title + "最新章节由网友提供，《" + book.title + "》情节跌宕起伏、扣人心弦，是一本情节与文笔俱佳的" + book.categoryName + "小说，" + branchInfo.title + "免费提供" + book.writer + "最新清爽干净的文字章节在线阅读.";
        res.render('book', {
            title: book.title + "最新章节列表_" + book.title + "最新章节目录_" + branchInfo.shorttitle,
            keywords: book.title + "," + book.title + "最新章节" + "," + book.writer,
            description: description,
            pageTitle: book.title,
            book: book,
            bookUrl: bookUrl,
            abstractContent: book.abstractContent ? book.abstractContent.replace(/\\n/g, '').replace(/\s+/g, '') : '',
            lastChapters: result.lastChapters,
            lastChapterName: result.lastChapters.length ? result.lastChapters[0].title : "",
            lastChapterUrl: result.lastChapters.length ? bookUrl + result.lastChapters[0].number : "",
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
        var book = result.book;
        res.render('mulu', {
            title: book.title + "全部章节列表_" + book.title + "全部章节目录_" + branchInfo.shorttitle,
            keywords: book.title + "," + book.title + "全部章节" + "," + book.writer,
            description: book.abstractContent ? book.abstractContent.replace(/\\n/g, '').replace(/\s+/g, '') : '',
            pageTitle: book.title,
            book: book,
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
        var description = branchInfo.shorttitle + "提供了" + chapter.book.writer + "创作的" + chapter.book.categoryName + "《" + chapter.book.title + "》清爽干净的文字章节：" + chapter.title;
        if (chapter) {
            res.render('chapter', {
                title: chapter.title + "_" + branchInfo.title,
                keywords: chapter.book.title + "," + chapter.title + "," + chapter.book.writer,
                description: description,
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
                title: "搜索_输入书名•作者_小说_" + branchInfo.title,
                keywords: branchInfo.keywords,
                description: branchInfo.description,
                keyword: "",
                pageTitle: "搜索 输入书名•作者 小说",
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
            title: "搜索_" + req.query.keyword + "_" + branchInfo.title,
            keywords: branchInfo.keywords,
            description: branchInfo.description,
            keyword: req.query.keyword,
            pageTitle: "搜索结果",
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