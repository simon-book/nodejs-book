var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var util = require('../../util/index.js');
var managerSequelize = require('../../data/sequelize/manager/managerSequelize.js');
var auth = require('./auth.js');

exports.login = async function(req, res) {
    try {
        var body = req.body;
        if (!body.username || !body.password) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var manager = await managerSequelize.findOne({
            phone: body.username,
            password: body.password
        });
        if (!manager) {
            adminHttpResult.jsonFailOut(req, res, "LOGIN_ERROR", "用户名或密码错误！");
            return;
        }
        manager = manager.get();
        branch = manager.branch.get();
        manager.branch = branch;
        delete manager.password;
        var added = auth.login(req, res, manager);
        if (added) adminHttpResult.jsonSuccOut(req, res, manager);
        else adminHttpResult.jsonFailOut(req, res, "LOGIN_ERROR", "登陆失败！");
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.isLogin = async function(req, res, next) {
    // var manager = await managerSequelize.findOne();
    var manager = auth.getUser(req, res);
    // var manager = {
//     branchId: __HOSTMAP__[req.hostname]
// }
    if (manager) {
        req.currentUser = manager;
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

exports.getUser = async function(req, res) {
    try {
        var manager = auth.getUser(req, res);
        if (manager) adminHttpResult.jsonSuccOut(req, res, manager);
        else adminHttpResult.jsonFailOut(req, res, "LOGIN_ERROR", "用户未登录");
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}