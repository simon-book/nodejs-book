var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var userSequelize = require('../../data/sequelize/user/userSequelize.js');
var auth = require('./auth.js');

exports.register = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var branchId = branchInfo.branchId;
        var body = req.query;
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
            password: password,
            vipType: "none"
        });
        user = user.get();
        delete user.password;
        if (added) adminHttpResult.jsonSuccOut(req, res, user);
        else adminHttpResult.jsonFailOut(req, res, "LOGIN_ERROR", "登陆失败！");
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
        var body = req.query;
        if (!body.username || !body.password) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var user = await userSequelize.findOne({
            branchId: branchId,
            username: body.username,
            password: body.password
        });
        if (!user) {
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

exports.isLogin = async function(req, res, next) {
    var user = await userSequelize.findOne();
    // var user = auth.getUser(req, res);
    if (user) {
        req.currentUser = user;
        next();
    } else adminHttpResult.jsonFailOut(req, res, "LOGIN_ERROR", "用户未登录");
}

exports.logout = async function(req, res) {
    try {
        auth.logout(req, res);
        adminHttpResult.jsonSuccOut(req, res, true);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.getUserInfo = async function(req, res) {
    try {
        var user = auth.getUser(req, res);
        if (user) adminHttpResult.jsonSuccOut(req, res, user);
        else adminHttpResult.jsonFailOut(req, res, "LOGIN_ERROR", "用户未登录");
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}