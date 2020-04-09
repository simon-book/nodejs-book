var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var sequelize = require('../../../service/sequelizeConn.js');

var Branch = require('../_models/branch/branch.js')
var Manager = require('../_models/manager/manager.js')

exports.findOne = function(where) {
    return new Promise(function(resolve, reject) {
        Manager.findOne({
            where: where,
            include: [{
                model: Branch,
                as: 'branch',
                required: true
            }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}