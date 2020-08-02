var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var util = require('../../util/index.js');
var chargeItemSequelize = require('../../data/sequelize/charge/chargeItemSequelize.js');

exports.listChargeItems = async function(req, res) {
    try {
        var branchId = req.params.branchId;
        var body = req.query;
        if (!branchId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var list = await chargeItemSequelize.findAll({
            branchId: branchId
        });
        adminHttpResult.jsonSuccOut(req, res, list);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}