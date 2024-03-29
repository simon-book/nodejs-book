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

exports.findAll = function(where, attributes, offset, limit) {
    return new Promise(function(resolve, reject) {
        Picture.findAll({
            where: where,
            attributes: attributes,
            offset: offset || 0,
            limit: limit || 200000,
            order: [
                [
                    "pictureId", "ASC"
                ]
            ],
            include: [{
                model: Tag,
                as: 'tags',
                required: false,
                // attributes: ["tagId", "name"]
            }, {
                model: Model,
                as: 'models',
                required: false,
                // attributes: ["modelId", "name"]
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
        Picture.findAll({
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

exports.findByPk = function(id) {
    return new Promise(function(resolve, reject) {
        Picture.findByPk(id, {
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

exports.findAndCountAll = function(where, offset, limit, order, tagWhere) {
    return new Promise(function(resolve, reject) {
        sequelize.transaction({
            deferrable: Sequelize.Deferrable.SET_DEFERRED
        }, function(t) {
            var all = []
            all.push(Picture.count({
                where: where,
                transaction: t
            }))
            all.push(Picture.findAll({
                where: where,
                limit: limit || 10000,
                offset: offset || 0,
                order: order || [
                    ['orderIndex', 'DESC']
                ],
                raw: true,
                attributes: {
                    exclude: ["originId", "branchId"]
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

exports.updatePictureTag = function(obj, where) {
    return new Promise(function(resolve, reject) {
        PictureTag.update(obj, {
            where: where
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}


exports.countPictureTag = function(where) {
    return new Promise(function(resolve, reject) {
        PictureTag.count({
            where: where
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}