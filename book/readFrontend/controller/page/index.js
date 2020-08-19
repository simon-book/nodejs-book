var _ = require('lodash');
var moment = require('moment');
var util = require("../../util/index.js");
var httpGateway = require("../../data/http/httpGateway.js");

exports.home = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var blocks = await httpGateway.readerStartReq(branchInfo.branchId, "home/index");
        res.render('home', {
            title: "首页" + branchInfo.title,
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
            query.categoryId = req.params.categoryId;
            href += "/" + req.params.categoryId;
        }
        if (req.params.page) {
            query.page = req.params.page;
        }
        var result = await httpGateway.readerStartReq(branchInfo.branchId, "book" + util.generateReqQuery(query));
        var books = result.list;
        var currentPage = parseInt(result.pagination.page);
        var totalPage = Math.ceil(result.pagination.totalNum / result.pagination.pageSize);
        var prevPage = currentPage > 1 ? currentPage - 1 : 0;
        var nextPage = currentPage < totalPage ? currentPage + 1 : 0;
        res.render('category', {
            title: branchInfo.title,
            keywords: "全部小说" + branchInfo.keywords,
            description: branchInfo.description,
            books: result.list,
            pagination: {
                currentPage: currentPage,
                totalPage: totalPage,
                href: href,
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
    res.render('book', {
        title: "测试"
    });
};

exports.chapter = async function(req, res) {
    res.render('chapter', {
        title: "测试"
    });
};

exports.search = async function(req, res) {
    res.render('search', {
        title: "测试"
    });
};

exports.register = async function(req, res) {
    res.render('register', {
        title: "测试"
    });
};

exports.login = async function(req, res) {
    res.render('login', {
        title: "测试"
    });
};