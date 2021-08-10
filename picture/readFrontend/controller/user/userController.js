var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var userSequelize = require('../../data/sequelize/user/userSequelize.js');
var userBookMarkSequelize = require('../../data/sequelize/user/userBookMarkSequelize.js');
var auth = require('./auth.js');

exports.register = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var branchId = branchInfo.branchId;
        var body = req.body;
        if (!body.username || !body.password) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var user = await userSequelize.findOne({
            branchId: branchId,
            username: body.username
        });
        if (user) {
            adminHttpResult.jsonFailOut(req, res, "USER_ERROR", "该用户名已注册过，请换一个！");
            return;
        }
        var user = await userSequelize.create({
            branchId: branchId,
            username: body.username,
            password: body.password,
            vipType: "none"
        });
        user = user.get();
        delete user.password;
        // adminHttpResult.jsonSuccOut(req, res, user);
        var added = auth.login(req, res, user);
        if (added) adminHttpResult.jsonSuccOut(req, res, user);
        else adminHttpResult.jsonFailOut(req, res, "LOGIN_ERROR", "注册成功！");
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}


exports.login = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var branchId = branchInfo.branchId;
        var body = req.body;
        if (!body.username || !body.password) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var user = await userSequelize.findOne({
            branchId: branchId,
            username: body.username
            // password: body.password
        });
        if (!user) {
            adminHttpResult.jsonFailOut(req, res, "LOGIN_ERROR", "用户不存在！");
            return;
        }
        if (user.password != body.password) {
            adminHttpResult.jsonFailOut(req, res, "LOGIN_ERROR", "用户名或密码错误！");
            return;
        }
        user = user.get();
        delete user.password;
        var added = auth.login(req, res, user);
        if (added) adminHttpResult.jsonSuccOut(req, res, user);
        else adminHttpResult.jsonFailOut(req, res, "LOGIN_ERROR", "登陆失败！");
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.logout = async function(req, res) {
    try {
        auth.logout(req, res);
        res.redirect("/")
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.addBookMark = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var user = auth.getUser(req, res);
        var body = req.body;
        if (!body.bookId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        if (user) {
            var bookMark = await userBookMarkSequelize.findOne({
                userId: user.userId,
                bookId: body.bookId
            })
            if (bookMark) {
                adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", "这本书已经在书架啦！", bookMark);
                return;
            }
            var bookMark = await userBookMarkSequelize.create({
                userId: user.userId,
                bookId: body.bookId,
                chapterId: body.chapterId,
                branchId: branchInfo.branchId
            })
            adminHttpResult.jsonSuccOut(req, res, bookMark);
        } else {
            adminHttpResult.jsonFailOut(req, res, "USER_NOT_LOGIN", null, null);
        }
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.deleteBookMark = async function(req, res) {
    try {
        var body = req.query;
        var user = auth.getUser(req, res);
        if (!user) {
            adminHttpResult.jsonFailOut(req, res, "USER_NOT_LOGIN", null, null);
            return;
        }
        if (!body.id) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        await userBookMarkSequelize.destroy({
            id: body.id
        });
        adminHttpResult.jsonSuccOut(req, res, true);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.deleteAllBookMark = async function(req, res) {
    try {
        var user = auth.getUser(req, res);
        if (!user) {
            adminHttpResult.jsonFailOut(req, res, "USER_NOT_LOGIN", null, null);
            return;
        }
        await userBookMarkSequelize.destroy({
            userId: user.userId
        });
        adminHttpResult.jsonSuccOut(req, res, true);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.getUserBookMarks = async function(userId) {
    try {
        var list = await userBookMarkSequelize.findAll({
            userId: userId
        });
        return list;
    } catch (err) {
        console.error(err);
        return [];
    }
}