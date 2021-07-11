var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var sequelize = require('../../service/sequelizeConn.js');

var VisitStat = require('./_models/visitStat.js');

exports.findByPk = function(id) {
    return new Promise(function(resolve, reject) {
        VisitStat.findByPk(id).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findAndCountAll = function(where, offset, limit, order) {
    return new Promise(function(resolve, reject) {
        VisitStat.findAndCountAll({
            where: where,
            limit: limit || 100000,
            offset: offset || 0,
            raw: true,
            order: order || [
                ['date', 'desc']
            ]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}