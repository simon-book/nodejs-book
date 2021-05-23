var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var sequelize = require('../../../service/sequelizeConn.js');

var User = require('../_models/user/user.js')
var UserBookMark = require('../_models/user/userBookMark.js')
var Book = require('../_models/book/book.js')
var BookChapter = require('../_models/book/bookChapter.js')

exports.create = function(user) {
    return new Promise(function(resolve, reject) {
        UserBookMark.create(user).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findOne = function(where) {
    return new Promise(function(resolve, reject) {
        UserBookMark.findOne({
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
        UserBookMark.destroy({
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
        UserBookMark.findAll({
            where: where,
            order: [
                ["updatedAt", "desc"]
            ],
            include: [{
                model: Book,
                as: 'book',
                raw: true,
                required: true,
                attributes: ["bookId", "title", "writer", "cover", "categoryId", "categoryName", "lastUpdatedAt"]
            }, {
                model: BookChapter,
                as: 'chapter',
                raw: true,
                required: false,
                attributes: ["title", "number", "cover"]
            }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}