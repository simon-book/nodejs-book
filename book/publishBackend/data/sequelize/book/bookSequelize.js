var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var sequelize = require('../../../service/sequelizeConn.js');

var Book = require('../_models/book/book.js')
var BookChapter = require('../_models/book/bookChapter.js')
var Tag = require('../_models/book/tag.js')
var BookTag = require('../_models/book/bookTag.js')

var Book_Chapter = Book.hasMany(BookChapter, {
    as: 'chapters',
    foreignKey: 'bookId'
})

var Chapter_Book = BookChapter.belongsTo(Book, {
    as: 'book',
    foreignKey: 'bookId'
})

exports.create = function(obj) {
    return new Promise(function(resolve, reject) {
        Book.create(obj, {
            include: [{
                association: Book_Chapter,
                as: 'chapters'
            }]
        }).then(function(results) {
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
        Book.findByPk(id).then(function(results) {
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