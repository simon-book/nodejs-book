var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var util = require('../../util/index.js');
var tagSequelize = require('../../data/sequelize/book/tagSequelize.js');

exports.create = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.body;
        if (!body || !body.name) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        body.branchId = currentUser.branchId;
        var added = await tagSequelize.create(body);
        adminHttpResult.jsonSuccOut(req, res, added);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.bulkCreate = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.body;
        _.remove(body, function(tag) {
            tag.branchId = currentUser.branchId;
            return !tag.name;
        })
        if (!body || !body.length) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var added = await tagSequelize.bulkCreate(body);
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
        if (!body || !body.tagId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var tag = await tagSequelize.findByPk(body.tagId);
        if (!tag || tag.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "BOOK_TAG_ERROR", "tag不存在");
            return;
        }
        if (body.name) tag.set("name", body.name);
        await tag.save();
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
        if (!body || !body.tagId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var tag = await tagSequelize.findByPk(body.tagId);
        if (!tag || tag.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "BOOK_TAG_ERROR", "tag不存在");
            return;
        }
        tag.set("statusId", 0);
        await tag.save();
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
        var list = await tagSequelize.findAll({
            branchId: currentUser.branchId,
        });
        adminHttpResult.jsonSuccOut(req, res, list);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}