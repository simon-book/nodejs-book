var _ = require('lodash');
var moment = require('moment');
var util = require("../../util/index.js");
var branchMap = require('../common/branchMap.js');
var httpGateway = require("../../data/http/httpGateway.js");

exports.home = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var blocks = await httpGateway.readerStartReq(branchInfo.branchId, "home/index");
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
        var query = {};
        if (req.params.categoryId) {
            query.categoryId = parseInt(req.params.categoryId);
            href += "/" + req.params.categoryId;
        }
        if (req.params.page) {
            query.page = parseInt(req.params.page);
        }
        var result = await httpGateway.readerStartReq(branchInfo.branchId, "book" + util.generateReqQuery(query));
        var currentPage = parseInt(result.pagination.page);
        var totalPage = Math.ceil(result.pagination.totalNum / result.pagination.pageSize);
        var prevPage = currentPage > 1 ? currentPage - 1 : 0;
        var nextPage = currentPage < totalPage ? currentPage + 1 : 0;
        var categoryMap = branchMap.categoryMap[branchInfo.branchId];
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
    res.render('quanben', {
        title: "测试"
    });
};

exports.history = async function(req, res) {
    res.render('history', {
        title: "测试"
    });
};

exports.book = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var result = await httpGateway.readerStartReq(branchInfo.branchId, "book/" + req.params.bookId + "/detail");
        res.render('book', {
            title: result.book.title + " " + branchInfo.title,
            keywords: "",
            description: "",
            pageTitle: result.book.title,
            book: result.book,
            lastChapters: result.lastChapters
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
        var query = {};
        if (req.params.page) query.page = parseInt(req.params.page);
        else query.page = 1
        query.pageSize = 100;
        var result = await httpGateway.readerStartReq(branchInfo.branchId, "book/" + req.params.bookId + "/chapters" + util.generateReqQuery(query));
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
        var chapter = await httpGateway.readerStartReq(branchInfo.branchId, "book/" + req.params.bookId + "/chapterDetail/" + req.params.number);
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
        var query = {};
        query.searchContent = encodeURIComponent(req.query.keyword);
        href += "?searchContent=" + req.query.keyword;
        if (req.query.page) {
            query.page = parseInt(req.query.page);
        }
        var result = await httpGateway.readerStartReq(branchInfo.branchId, "book" + util.generateReqQuery(query));
        var currentPage = parseInt(result.pagination.page);
        var totalPage = Math.ceil(result.pagination.totalNum / result.pagination.pageSize);
        var prevPage = currentPage > 1 ? currentPage - 1 : 0;
        var nextPage = currentPage < totalPage ? currentPage + 1 : 0;
        res.render('search', {
            title: "搜索 " + req.query.keyword + " " + branchInfo.title,
            keywords: "",
            description: "",
            pageTitle: "搜索 " + req.query.keyword,
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