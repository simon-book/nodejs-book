var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var sequelize = require('../../../service/sequelizeConn.js');

var Model = require('../_models/picture/model.js')
var Tag = require('../_models/picture/tag.js')
var Article = require('../_models/picture/article.js')
var ModelTag = require('../_models/picture/modelTag.js')
var Picture = require('../_models/picture/picture.js')

exports.create = function(obj) {
    return new Promise(function(resolve, reject) {
        Model.create(obj).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.bulkCreate = function(obj) {
    return new Promise(function(resolve, reject) {
        Model.bulkCreate(obj).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

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

exports.findAll = function(where, offset, limit, order) {
    return new Promise(function(resolve, reject) {
        Model.findAll({
            where: where,
            limit: limit || 10000,
            offset: offset || 0,
            order: order || [
                ['modelId', 'DESC']
            ],
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

exports.findAllWithoutTags = function(where, attributes) {
    return new Promise(function(resolve, reject) {
        Model.findAll({
            where: where,
            limit: 100000,
            offset: 0,
            attributes: attributes
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findAllWithPictures = function(where, offset, limit, order, attributes) {
    return new Promise(function(resolve, reject) {
        Model.findAll({
            where: where,
            limit: limit || 100000,
            offset: offset || 0,
            order: order || [
                [
                    "modelId", "asc"
                ]
            ],
            attributes: attributes,
            include: [{
                model: Picture,
                as: 'pictures',
                required: true,
                raw: true,
                attributes: ["pictureId"]
            }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}