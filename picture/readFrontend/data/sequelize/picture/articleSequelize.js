var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var sequelize = require('../../../service/sequelizeConn.js');

var Article = require('../_models/picture/article.js')
var Model = require('../_models/picture/model.js')
var ArticleModel = require('../_models/picture/articleModel.js')

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

exports.findByPk = function(id, attributes) {
    return new Promise(function(resolve, reject) {
        Article.findByPk(id, {
            attributes: attributes,
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

exports.findAll = function(where, offset, limit, order, attributes) {
    return new Promise(function(resolve, reject) {
        Article.findAll({
            where: where,
            limit: limit || 10000,
            offset: offset || 0,
            raw: true,
            order: order || [
                ['lastUpdatedAt', 'DESC']
            ],
            attributes: attributes
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findAndCountAll = function(where, offset, limit, order, attributes) {
    return new Promise(function(resolve, reject) {
        Article.findAndCountAll({
            where: where,
            limit: limit || 10000,
            offset: offset || 0,
            raw: true,
            order: order || [
                ['lastUpdatedAt', 'DESC']
            ],
            attributes: attributes
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.count = function(where) {
    return new Promise(function(resolve, reject) {
        Article.count({
            where: where
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}