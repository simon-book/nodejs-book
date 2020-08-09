var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var sequelize = require('../../../service/sequelizeConn.js');

var Book = require('../_models/book/book.js')
var Tag = require('../_models/book/tag.js')
var BookCategory = require('../_models/book/bookCategory.js')
var bookChapter = require('../_models/book/bookChapter.js')

exports.findByPk = function(id) {
    return new Promise(function(resolve, reject) {
        Book.findByPk(id, {
            raw: true,
            attributes: {
                exclude: ["coinCount", "branchId", "statusId", "createdAt", "updatedAt"]
            },
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
    var include = [{
        model: BookCategory,
        as: 'category',
        required: false,
        attributes: ["categoryId", "name"]
    }]
    if (tagWhere) include.push({
        model: Tag,
        as: 'tags',
        required: true,
        where: tagWhere,
        attributes: ["tagId", "name"]
    })
    return new Promise(function(resolve, reject) {
        sequelize.transaction({
            deferrable: Sequelize.Deferrable.SET_DEFERRED
        }, function(t) {
            var all = []
            all.push(Book.count({
                where: where,
                transaction: t,
                include: tagWhere ? [{
                    model: Tag,
                    as: 'tags',
                    required: true,
                    where: tagWhere
                }] : null
            }))
            all.push(Book.findAll({
                where: where,
                limit: limit || 10000,
                offset: offset || 0,
                raw: true,
                order: order || [
                    ['bookId', 'DESC']
                ],
                transaction: t,
                attributes: ["bookId", "title", "cover", "horiCover", "categoryId", "abstractContent", "chapterCount", "recommend", "readCount", "publishStatus", "lastUpdatedAt"],
                include: include
            }));
            return Promise.all(all);
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        })
    })
}