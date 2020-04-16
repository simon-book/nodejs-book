var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var util = require('../../util/index.js');
var chargeItemSequelize = require('../../data/sequelize/charge/chargeItemSequelize.js');

exports.create = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.body;
        if (!body || !body.name || !body.chargeType || (body.chargeType != "coin" && body.chargeType != "vip") || !body.chargePrice) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        body.branchId = currentUser.branchId;
        var added = await chargeItemSequelize.create(body);
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
        if (!body || !body.chargeItemId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var chargeItem = await chargeItemSequelize.findByPk(body.chargeItemId);
        if (!chargeItem || chargeItem.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "CHARGE_ITEM_ERROR", "chargeItem不存在");
            return;
        }
        if (body.name) chargeItem.set("name", body.name);
        if (body.chargeType) chargeItem.set("chargeType", body.chargeType);
        if (body.chargePrice) chargeItem.set("chargePrice", body.chargePrice);
        if (chargeItem.chargeType == "coin") {
            chargeItem.set("chargeCount", body.chargeCount || 0);
            chargeItem.set("presentCount", body.presentCount || 0);
        }
        if (body.expireDays) chargeItem.set("expireDays", body.expireDays);
        if (body.orderIndex) chargeItem.set("orderIndex", body.orderIndex);
        if (body.isRecommend) chargeItem.set("isRecommend", body.isRecommend);
        if (body.isDefault) chargeItem.set("isDefault", body.isDefault);
        if (body.remark) chargeItem.set("remark", body.remark);
        await chargeItem.save();
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
        if (!body || !body.chargeItemId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var chargeItem = await chargeItemSequelize.findByPk(body.chargeItemId);
        if (!chargeItem || chargeItem.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "CHARGE_ITEM_ERROR", "chargeItem不存在");
            return;
        }
        chargeItem.set("statusId", 0);
        await chargeItem.save();
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
        var body = req.body;
        if (!body) body = {};
        var pageSize = body.pageSize || 20;
        var page = body.page || 1;
        var offset = pageSize * (page - 1);
        var list = await chargeItemSequelize.findAll({
            branchId: currentUser.branchId,
        }, offset, pageSize);
        adminHttpResult.jsonSuccOut(req, res, list);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}