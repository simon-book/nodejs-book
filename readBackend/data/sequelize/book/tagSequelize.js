var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var sequelize = require('../../../service/sequelizeConn.js');

var Tag = require('../_models/book/tag.js')

exports.findAll = function(where, offset, limit, order) {
    return new Promise(function(resolve, reject) {
        Tag.findAll({
            where: where,
            limit: limit || 10000,
            offset: offset || 0,
            order: order || [
                ['tagId', 'DESC']
            ],
            attributes: ["tagId", "name"]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}