var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var util = require('../../util/index.js');
var bookCategorySequelize = require('../../data/sequelize/book/bookCategorySequelize.js');

exports.create = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.body;
        if (!body || !body.name) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        body.branchId = currentUser.branchId;
        var added = await bookCategorySequelize.create(body);
        adminHttpResult.jsonSuccOut(req, res, added);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.update = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.body;
        if (!body || !body.categoryId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var category = await bookCategorySequelize.findByPk(body.categoryId);
        if (!category || category.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "BOOK_CATEGORY_ERROR", "category不存在");
            return;
        }
        if (body.name) category.set("name", body.name);
        await category.save();
        adminHttpResult.jsonSuccOut(req, res, true);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.delete = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.params;
        if (!body || !body.categoryId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var category = await bookCategorySequelize.findByPk(body.categoryId);
        if (!category || category.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "BOOK_CATEGORY_ERROR", "category不存在");
            return;
        }
        category.set("statusId", 0);
        await category.save();
        adminHttpResult.jsonSuccOut(req, res, true);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.list = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        // var body = req.body;
        // if (!body) body = {};
        // var pageSize = body.pageSize || 20;
        // var page = body.page || 1;
        // var offset = pageSize * (page - 1);
        var list = await bookCategorySequelize.findAll({
            branchId: currentUser.branchId,
        });
        adminHttpResult.jsonSuccOut(req, res, list);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}