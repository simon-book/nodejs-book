var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var sequelize = require('../../../service/sequelizeConn.js');

var Book = require('../_models/book/book.js')
var BookChapter = require('../_models/book/bookChapter.js')
var Tag = require('../_models/book/tag.js')
var BookCategory = require('../_models/book/bookCategory.js')
var BookTag = require('../_models/book/bookTag.js')

exports.create = function(obj) {
    return new Promise(function(resolve, reject) {
        Book.create(obj).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.countBooks = function(where) {
    return new Promise(function(resolve, reject) {
        Book.unscoped().count(where ? {
            where: where
        } : null).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.updateBookAndChapters = function(book, chapters) {
    return new Promise(function(resolve, reject) {
        sequelize.transaction({
            deferrable: Sequelize.Deferrable.SET_DEFERRED
        }, function(t) {
            var all = []
            all.push(book.save({
                transaction: t
            }));
            all.push(BookChapter.bulkCreate(chapters, {
                transaction: t
            }))
            return Promise.all(all);
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        })
    })
}

exports.update = function(obj, where) {
    return new Promise(function(resolve, reject) {
        Book.update(obj, {
            where: where,
            returning: true
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findOneBook = function(where) {
    return new Promise(function(resolve, reject) {
        Book.findOne({
            where: where,
            include: [{
                model: Tag,
                as: 'tags',
                required: false,
                attributes: ["tagId", "name"]
            }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findAll = function(where, attributes) {
    return new Promise(function(resolve, reject) {
        Book.findAll({
            where: where,
            attributes: attributes
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findByPk = function(id) {
    return new Promise(function(resolve, reject) {
        Book.findByPk(id, {
            include: [{
                model: Tag,
                as: 'tags',
                required: false,
                attributes: ["tagId", "name"]
            }, {
                model: BookCategory,
                as: 'category',
                required: false,
                attributes: ["categoryId", "name"]
            }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findAndCountAll = function(where, offset, limit, order, tagWhere) {
    return new Promise(function(resolve, reject) {
        sequelize.transaction({
            deferrable: Sequelize.Deferrable.SET_DEFERRED
        }, function(t) {
            var all = []
            all.push(Book.count({
                where: where,
                transaction: t
            }))
            all.push(Book.findAll({
                where: where,
                limit: limit || 10000,
                offset: offset || 0,
                order: order || [
                    ['bookId', 'DESC']
                ],
                raw: true,
                attributes: {
                    exclude: ["copyInfo", "originId", "branchId"]
                },
                transaction: t,
                include: [tagWhere ? {
                    model: Tag,
                    as: 'tags',
                    required: true,
                    where: tagWhere,
                    attributes: ["tagId", "name"]
                } : {
                    model: Tag,
                    as: 'tags',
                    required: false,
                    attributes: ["tagId", "name"]
                }],
            }));
            return Promise.all(all);
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        })
    })
}