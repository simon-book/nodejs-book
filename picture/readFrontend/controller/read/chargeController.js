var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var chargeItemSequelize = require('../../data/sequelize/charge/chargeItemSequelize.js');

exports.listChargeItems = async function(branchId) {
    try {
        var list = await chargeItemSequelize.findAll({
            branchId: branchId
        });
        return list;
    } catch (err) {
        console.error(err);
        return [];
    }
}