var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var sequelize = require('../../../service/sequelizeConn.js');

var Branch = require('../_models/branch/branch.js')
var Manager = require('../_models/manager/manager.js')

var BranchManager = Branch.hasMany(Manager, {
    as: 'managers',
    foreignKey: 'branchId'
})

var ManagerBranch = Manager.belongsTo(Branch, {
    as: 'branch',
    foreignKey: 'branchId'
})


exports.create = function(branch) {
    return new Promise(function(resolve, reject) {
        Branch.create(branch, {
            include: [{
                association: BranchManager,
                as: 'managers'
            }]
        }).then(function(results) {
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

exports.findOne = function(where) {
    return new Promise(function(resolve, reject) {
        Branch.findOne({
            where: where
        }).then(function(results) {
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

exports.countBranches = function(where) {
    return new Promise(function(resolve, reject) {
        Branch.unscoped().count(where ? {
            where: where
        } : null).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}