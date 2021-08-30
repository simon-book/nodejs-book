var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var sequelize = require('../../../service/sequelizeConn.js');

var Picture = require('../_models/picture/picture.js')
var Tag = require('../_models/picture/tag.js')
var Model = require('../_models/picture/model.js')
var PictureTag = require('../_models/picture/pictureTag.js')
var PictureModel = require('../_models/picture/pictureModel.js')

exports.create = function(obj) {
    return new Promise(function(resolve, reject) {
        Picture.create(obj).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.update = function(obj, where, returning) {
    return new Promise(function(resolve, reject) {
        Picture.update(obj, {
            where: where,
            returning: returning == undefined ? true : returning
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findOne = function(where) {
    return new Promise(function(resolve, reject) {
        Picture.findOne({
            where: where,
            include: [{
                model: Tag,
                as: 'tags',
                required: false,
                attributes: ["tagId", "name"]
            }, {
                model: Model,
                as: 'models',
                required: false,
                attributes: ["modelId", "name"]
            }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findAll = function(where, offset, limit, attributes) {
    return new Promise(function(resolve, reject) {
        Picture.findAll({
            where: where,
            attributes: attributes || ["pictureId", "title", "cover", "imgHost", "lastUpdatedAt"],
            offset: offset || 0,
            limit: limit || 200000,
            raw: true,
            order: [
                ["lastUpdatedAt", "DESC"]
            ],
            // include: [{
            //     model: Tag,
            //     as: 'tags',
            //     required: false,
            //     attributes: ["tagId", "name"]
            // }, {
            //     model: Model,
            //     as: 'models',
            //     required: false,
            //     attributes: ["modelId", "name"]
            // }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findByPk = function(id) {
    return new Promise(function(resolve, reject) {
        Picture.findByPk(id, {
            include: [{
                model: Tag,
                as: 'tags',
                required: false,
                raw: true,
                attributes: ["tagId", "name"]
            }, {
                model: Model,
                as: 'models',
                required: false,
                raw: true,
                attributes: ["modelId", "name"]
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
                ['pictureLastUpdatedAt', 'DESC']
            ],
            include: [{
                model: Picture,
                as: 'picture',
                required: false,
                attributes: ["pictureId", "title", "imgHost", "cover", "lastUpdatedAt"],
                // include: [{
                //     model: Tag,
                //     as: 'tags',
                //     required: false,
                //     raw: true,
                //     attributes: ["tagId", "name"]
                // }, {
                //     model: Model,
                //     as: 'models',
                //     required: false,
                //     raw: true,
                //     attributes: ["modelId", "name"]
                // }]
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
        Picture.findAndCountAll({
            where: where,
            limit: limit || 10000,
            offset: offset || 0,
            order: order || [
                ['lastUpdatedAt', 'DESC']
            ],
            attributes: ["pictureId", "title", "imgHost", "cover", "lastUpdatedAt"],
            // include: [{
            //     model: Tag,
            //     as: 'tags',
            //     required: false,
            //     raw: true,
            //     attributes: ["tagId", "name"]
            // }, {
            //     model: Model,
            //     as: 'models',
            //     required: false,
            //     raw: true,
            //     attributes: ["modelId", "name"]
            // }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        })
    })
}

exports.count = function(where) {
    return new Promise(function(resolve, reject) {
        Picture.count({
            where: where
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}