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

exports.findOrCreate = function(where, record) {
    return new Promise(function(resolve, reject) {
        VisitStat.findOrCreate({
            where: where,
            defaults: record
        }).then(function(results) {
            resolve(results[0]);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.increment = function(where) {
    return new Promise(function(resolve, reject) {
        VisitStat.increment("count", {
            where: where
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}