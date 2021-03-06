var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var util = require('../../util/index.js');
var branchSequelize = require('../../data/sequelize/branch/branchSequelize.js');
var managerSequelize = require('../../data/sequelize/manager/managerSequelize.js');

exports.createBranch = async function(req, res) {
    try {
        var body = req.body;
        if (!body.name || !body.branchType || !body.administrator || !body.administrator.phone) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        if (body.branchType == "agency" && !body.masterBranchId) {
            adminHttpResult.jsonFailOut(req, res, "BRANCH_ERROR", "代理branch必须属于某一个主branch！");
            return;
        }
        if (body.branchType == "agency" && body.masterBranchId) {
            var masterBranch = await branchSequelize.findOneById(body.masterBranchId);
            if (!masterBranch || masterBranch.branchType == "agency") {
                adminHttpResult.jsonFailOut(req, res, "BRANCH_ERROR", "主branch不合法！");
                return;
            }
        }
        var manager = await managerSequelize.findOne({
            phone: body.administrator.phone
        });
        if (manager) {
            adminHttpResult.jsonFailOut(req, res, "MANAGER_ERROR", "手机号被其他branch占用！");
            return;
        }
        body.administrator.roleType = "administrator";
        if (!body.administrator.nickname) body.administrator.nickname = body.administrator.phone;
        body.administrator.password = "123456";
        body.managers = [body.administrator];
        delete body.administrator;
        var count = await branchSequelize.countBranches();
        body.sn = util.prefixInteger(count + 1, 8);
        if (body.branchId) delete body.branchId;
        var added = await branchSequelize.create(body);
        adminHttpResult.jsonSuccOut(req, res, added);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.updateBranch = async function(req, res) {
    try {
        var body = req.body;
        if (!body.branchId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var branch = await branchSequelize.findOneById(body.branchId);
        if (!branch) {
            adminHttpResult.jsonFailOut(req, res, "BRANCH_ERROR", "branch不存在！");
            return;
        }
        if (body.name) branch.set("name", body.name);
        if (body.ServicePhone) branch.set("ServicePhone", body.ServicePhone);
        if (body.ServiceEmail) branch.set("ServiceEmail", body.ServiceEmail);
        if (body.ServiceOnline) branch.set("ServiceOnline", body.ServiceOnline);
        if (body.domainName) branch.set("domainName", body.domainName);
        if (body.remark) branch.set("remark", body.remark);
        if (body.statusId) branch.set("statusId", body.statusId);
        var added = await branch.save();
        adminHttpResult.jsonSuccOut(req, res, true);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}