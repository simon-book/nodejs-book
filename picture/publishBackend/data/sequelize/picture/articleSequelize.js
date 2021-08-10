var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var sequelize = require('../../../service/sequelizeConn.js');

var Article = require('../_models/picture/article.js')
var Model = require('../_models/picture/model.js')
var ArticleModel = require('../_models/picture/articleModel.js')

exports.create = function(obj) {
    return new Promise(function(resolve, reject) {
        Article.create(obj).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.bulkCreate = function(obj) {
    return new Promise(function(resolve, reject) {
        Article.bulkCreate(obj).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findOne = function(where) {
    return new Promise(function(resolve, reject) {
        Article.findOne({
            where: where,
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findByPk = function(id) {
    return new Promise(function(resolve, reject) {
        Article.findByPk(id, {
            include: [{
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

exports.findAll = function(where, offset, limit, order) {
    return new Promise(function(resolve, reject) {
        Article.findAll({
            where: where,
            limit: limit || 10000,
            offset: offset || 0,
            order: order || [
                ['lastUpdatedAt', 'DESC']
            ],
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}