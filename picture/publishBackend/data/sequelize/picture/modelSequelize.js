var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var sequelize = require('../../../service/sequelizeConn.js');

var Model = require('../_models/picture/model.js')
var Tag = require('../_models/picture/tag.js')
var ModelTag = require('../_models/picture/modelTag.js')

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
            }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}