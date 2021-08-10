var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var sequelize = require('../../../service/sequelizeConn.js');

var Branch = require('../_models/branch/branch.js')

exports.findOneById = function(branchId) {
    return new Promise(function(resolve, reject) {
        Branch.findByPk(branchId).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findAll = function(where) {
    return new Promise(function(resolve, reject) {
        Branch.findAll({
            where: where
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}