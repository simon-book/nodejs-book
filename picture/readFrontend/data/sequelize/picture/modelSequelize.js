var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var sequelize = require('../../../service/sequelizeConn.js');

var Model = require('../_models/picture/model.js')
var Tag = require('../_models/picture/tag.js')
var Article = require('../_models/picture/article.js')
var ModelTag = require('../_models/picture/modelTag.js')

exports.findOneModel = function(where) {
    return new Promise(function(resolve, reject) {
        Model.findOne({
            where: where,
            include: [{
                model: Tag,
                as: 'tags',
                required: false,
                attributes: ["tagId", "name"]
            }, {
                model: Article,
                as: 'articles',
                required: false,
                attributes: ["articleId", "title"]
            }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findByPk = function(id) {
    return new Promise(function(resolve, reject) {
        Model.findByPk(id, {
            include: [{
                model: Tag,
                as: 'tags',
                required: false,
                attributes: ["tagId", "name"]
            }, {
                model: Article,
                as: 'articles',
                required: false,
                attributes: ["articleId", "title"]
            }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

// exports.findAllWithoutTags = function(where, offset, limit, order, attributes) {
//     return new Promise(function(resolve, reject) {
//         Model.findAll({
//             where: where,
//             limit: limit || 10000,
//             offset: offset || 0,
//             raw: true,
//             order: order || [
//                 ['modelId', 'DESC']
//             ],
//             attributes: attributes
//         }).then(function(results) {
//             resolve(results);
//         }, reject).catch(function(err) {
//             reject(err);
//         });
//     })
// }

exports.findAll = function(where, offset, limit, order) {
    return new Promise(function(resolve, reject) {
        Model.findAll({
            where: where,
            limit: limit || 10000,
            offset: offset || 0,
            order: order || [
                ['originId', 'DESC']
            ],
            include: [{
                model: Tag,
                as: 'tags',
                required: false,
                raw: true,
                attributes: ["tagId", "name"]
            }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findTagModels = function(where, offset, limit, order) {
    return new Promise(function(resolve, reject) {
        ModelTag.findAll({
            where: where,
            limit: limit || 10000,
            offset: offset || 0,
            order: order || [
                ['modelOriginId', 'DESC']
            ],
            include: [{
                model: Model,
                as: 'models',
                required: false,
                raw: true,
                attributes: ["modelId", "name", "othername", "birthday", "job"]
            }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findAndCountAllPictureTag = function(where, offset, limit, order) {
    return new Promise(function(resolve, reject) {
        PictureTag.findAndCountAll({
            where: where,
            limit: limit || 10000,
            offset: offset || 0,
            order: order || [
                ['modelOriginId', 'DESC']
            ],
            include: [{
                model: Picture,
                as: 'picture',
                required: false,
                attributes: ["modelId", "name", "othername", "birthday", "job"],
                include: [{
                    model: Tag,
                    as: 'tags',
                    required: false,
                    raw: true,
                    attributes: ["tagId", "name"]
                }]
            }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        })
    })
}

exports.findAndCountAll = function(where, offset, limit, order) {
    return new Promise(function(resolve, reject) {
        Model.findAndCountAll({
            where: where,
            limit: limit || 10000,
            offset: offset || 0,
            order: order || [
                ['originId', 'DESC']
            ],
            attributes: ["modelId", "name", "othername", "birthday", "job"],
            include: [{
                model: Tag,
                as: 'tags',
                required: false,
                raw: true,
                attributes: ["tagId", "name"]
            }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        })
    })
}