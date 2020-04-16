var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var sequelize = require('../../../service/sequelizeConn.js');

var BookChapter = require('../_models/book/bookChapter.js')
var Book = require('../_models/book/book.js')

exports.create = function(chapter) {
    return new Promise(function(resolve, reject) {
        BookChapter.create(chapter).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
    // return new Promise(function(resolve, reject) {
    //     sequelize.transaction({
    //         deferrable: Sequelize.Deferrable.SET_DEFERRED
    //     }, function(t) {
    //         var all = []
    //         all.push(BookChapter.create(chapter, {
    //             transaction: t
    //         }))
    //         all.push(book.save({
    //             transaction: t,
    //             returning: true
    //         }));
    //         return Promise.all(all);
    //     }).then(function(results) {
    //         resolve(results);
    //     }, reject).catch(function(err) {
    //         reject(err);
    //     })
    // })
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

exports.findOne = function(where) {
    return new Promise(function(resolve, reject) {
        BookChapter.findOne({
            where: where,
            attributes: ["chapterId", "title"]
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
                ['chapterId', 'DESC']
            ],
            attributes: {
                exclude: ["contentText", "contentFormatedText", "contentPictures"]
            }
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}