var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var sequelize = require('../../../service/sequelizeConn.js');

var PageBlock = require('../_models/pageBlock/pageBlock.js')
var PageBlockBooks = require('../_models/pageBlock/pageBlockBooks.js')
var Book = require('../_models/book/book.js')
var Tag = require('../_models/book/tag.js')
var BookTag = require('../_models/book/bookTag.js')

exports.findAll = function(where, offset, limit, order) {
    return new Promise(function(resolve, reject) {
        PageBlock.findAll({
            where: where,
            limit: limit || 10000,
            offset: offset || 0,
            raw: true,
            order: order || [
                ['orderIndex', 'ASC']
            ],
            attributes: {
                exclude: ["statusId", "createdAt", "updatedAt"]
            }
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findIndexBlocksBooks = function(blocks, offset, limit) {
    return new Promise(function(resolve, reject) {
        sequelize.transaction({
            deferrable: Sequelize.Deferrable.SET_DEFERRED
        }, function(t) {
            var all = []
            _.forEach(blocks, function(block) {
                all.push(PageBlockBooks.findAll({
                    where: {
                        blockId: block.blockId
                    },
                    limit: limit || 10,
                    offset: offset || 0,
                    order: [
                        ['orderIndex', 'DESC']
                    ],
                    transaction: t,
                    attributes: ["id"],
                    include: [{
                        model: Book,
                        as: 'book',
                        raw: true,
                        required: true,
                        attributes: ["bookId", "title", "cover", "horiCover", "abstractContent", "chapterCount", "recommend", "readCount", "publishStatus", "lastUpdatedAt"]
                    }]
                }));
            })
            return Promise.all(all);
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        })
    })
}

exports.findBlockBooks = function(blockId, offset, limit) {
    return new Promise(function(resolve, reject) {
        PageBlockBooks.findAndCountAll({
            where: {
                blockId: blockId
            },
            limit: limit || 100000,
            offset: offset || 0,
            order: [
                ['orderIndex', 'DESC']
            ],
            attributes: ["id"],
            include: [{
                model: Book,
                as: 'book',
                raw: true,
                required: true,
                attributes: ["bookId", "title", "cover", "horiCover", "abstractContent", "chapterCount", "recommend", "readCount", "publishStatus", "lastUpdatedAt"]
            }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        })
    })
}