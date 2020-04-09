var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var sequelize = require('../../../service/sequelizeConn.js');

var BookChapter = require('../_models/book/bookChapter.js')
var Book = require('../_models/book/book.js')

exports.create = function(obj) {
    return new Promise(function(resolve, reject) {
        BookChapter.create(obj).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })

    return new Promise(function(resolve, reject) {
        sequelize.transaction({
            deferrable: Sequelize.Deferrable.SET_DEFERRED
        }, function(t) {
            var all = []
            all.push(BookChapter.create(obj, {
                transaction: t
            }))
            all.push(Book.increment({
                chapterCount: 1
            }, {
                where: {
                    bookId: obj.bookId
                },
                transaction: t
            }));
            return Promise.all(all);
        }).then(function(results) {
            resolve(results[0])
        }, reject).catch(function(err) {
            reject(err);
        })
    })

}

exports.update = function(obj, where) {
    return new Promise(function(resolve, reject) {
        BookChapter.update(obj, {
            where: where
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findByPk = function(id) {
    return new Promise(function(resolve, reject) {
        BookChapter.findByPk(id).then(function(results) {
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
            order: order || [
                ['id', 'DESC']
            ]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}