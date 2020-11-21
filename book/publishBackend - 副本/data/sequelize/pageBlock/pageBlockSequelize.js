var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var sequelize = require('../../../service/sequelizeConn.js');

var PageBlock = require('../_models/pageBlock/pageBlock.js')
var PageBlockBooks = require('../_models/pageBlock/pageBlockBooks.js')
var Book = require('../_models/book/book.js')

exports.create = function(obj) {
    return new Promise(function(resolve, reject) {
        PageBlock.create(obj).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findByPk = function(id) {
    return new Promise(function(resolve, reject) {
        PageBlock.findByPk(id).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findBlockBookByPk = function(id) {
    return new Promise(function(resolve, reject) {
        PageBlockBooks.findByPk(id).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findAll = function(where, offset, limit, order) {
    return new Promise(function(resolve, reject) {
        PageBlock.findAll({
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

exports.findBlockBooks = function(blockId, limit, offset) {
    return new Promise(function(resolve, reject) {
        PageBlockBooks.findAndCountAll({
            where: {
                blockId: blockId
            },
            limit: limit || 100000,
            offset: offset || 0,
            order: [
                ['orderIndex', 'DESC'],
                ['bookId', 'DESC']
            ],
            attributes: ["id"],
            include: [{
                model: Book,
                as: 'book',
                required: false
            }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        })
    })
}