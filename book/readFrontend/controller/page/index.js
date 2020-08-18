var _ = require('lodash');
var moment = require('moment');
var httpGateway = require("../../data/http/httpGateway.js");

exports.home = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var blocks = await httpGateway.readerStartReq(branchInfo.branchId, "home/index");
        res.render('home', {
            title: branchInfo.title,
            keywords: branchInfo.keywords,
            description: branchInfo.description,

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
    res.render('category', {
        title: "测试"
    });
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