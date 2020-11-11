var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var sequelize = require('../../../service/sequelizeConn.js');

var Page = require('../_models/rank/page.js')

exports.create = function(obj) {
    return new Promise(function(resolve, reject) {
        Page.create(obj).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findByPk = function(id) {
    return new Promise(function(resolve, reject) {
        Page.findByPk(id).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findOne = function(where) {
    return new Promise(function(resolve, reject) {
        Page.findOne({
            where: where
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.destroy = function(where) {
    return new Promise(function(resolve, reject) {
        Page.destroy({
            where: where
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.update = function(where, content) {
    return new Promise(function(resolve, reject) {
        Page.update(content, {
            where: where
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findAll = function(where, offset, limit, order) {
    return new Promise(function(resolve, reject) {
        Page.findAll({
            where: where,
            limit: limit || 10000,
            offset: offset || 0,
            order: order || [
                ['orderIndex', 'ASC']
            ]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}