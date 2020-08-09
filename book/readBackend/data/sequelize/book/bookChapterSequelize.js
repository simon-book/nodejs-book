var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var sequelize = require('../../../service/sequelizeConn.js');

var BookChapter = require('../_models/book/bookChapter.js')
var Book = require('../_models/book/book.js')

exports.findByPk = function(id) {
    return new Promise(function(resolve, reject) {
        BookChapter.findByPk(id).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findOne = function(where, order) {
    return new Promise(function(resolve, reject) {
        BookChapter.findOne({
            where: where,
            attributes: {
                exclude: ["contentText", "contentFormatedText", "contentPictures", "createdAt", "sourceDomain", "contentFormat", "branchId", "statusId"]
            },
            order: order || [
                ['number', 'desc']
            ]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findAndCountAll = function(where, offset, limit, order) {
    return new Promise(function(resolve, reject) {
        BookChapter.findAndCountAll({
            where: where,
            limit: limit || 10000,
            offset: offset || 0,
            raw: true,
            order: order || [
                ['number', 'asc']
            ],
            attributes: {
                exclude: ["contentText", "contentFormatedText", "contentPictures", "createdAt", "sourceDomain", "bookId", "branchId", "statusId"]
            }
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}