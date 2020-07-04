var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var sequelize = require('../../../service/sequelizeConn.js');

var Branch = require('../_models/branch/branch.js')

exports.create = function(branch) {
    return new Promise(function(resolve, reject) {
        Branch.create(branch).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findOneById = function(branchId) {
    return new Promise(function(resolve, reject) {
        Branch.findByPk(branchId).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.countBranches = function(where) {
    return new Promise(function(resolve, reject) {
        Branch.unscoped().count(where ? { where: where } : null).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}