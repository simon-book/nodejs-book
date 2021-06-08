var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var sequelize = require('../../../service/sequelizeConn.js');

var BookCategory = require('../_models/book/bookCategory.js')

exports.findAll = function(where, offset, limit, order) {
    return new Promise(function(resolve, reject) {
        BookCategory.findAll({
            where: where,
            limit: limit || 10000,
            offset: offset || 0,
            raw: true,
            order: order || [
                ['orderIndex', 'ASC'],
                ['categoryId', 'DESC']
            ],
            attributes: ["categoryId", "name", "relatedCategoryIds", "recommendBooks"]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}