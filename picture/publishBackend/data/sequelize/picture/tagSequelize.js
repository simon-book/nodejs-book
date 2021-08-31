var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var sequelize = require('../../../service/sequelizeConn.js');

var TagGroup = require('../_models/picture/tagGroup.js')
var Tag = require('../_models/picture/tag.js')

exports.createTagGroup = function(obj) {
    return new Promise(function(resolve, reject) {
        TagGroup.create(obj).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findOneTagGroup = function(where) {
    return new Promise(function(resolve, reject) {
        TagGroup.findOne({
            where: where
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findTagGroupByPk = function(id) {
    return new Promise(function(resolve, reject) {
        Tag.findByPk(id).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findAllTagGroup = function(where, offset, limit, order) {
    return new Promise(function(resolve, reject) {
        TagGroup.findAll({
            where: where,
            limit: limit || 10000,
            offset: offset || 0,
            order: order || [
                ['tagGroupId', 'DESC']
            ],
            include: [{
                model: Tag,
                as: 'tags',
                required: false,
                attributes: ["tagId", "name", "originId", "remark"]
            }]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.create = function(obj) {
    return new Promise(function(resolve, reject) {
        Tag.create(obj).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.update = function(obj, where) {
    return new Promise(function(resolve, reject) {
        Tag.update(obj, {
            where: where
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.bulkCreate = function(obj) {
    return new Promise(function(resolve, reject) {
        Tag.bulkCreate(obj).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findOneTag = function(where) {
    return new Promise(function(resolve, reject) {
        Tag.findOne({
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
        Tag.findByPk(id).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}

exports.findAll = function(where, offset, limit, order) {
    return new Promise(function(resolve, reject) {
        Tag.findAll({
            where: where,
            limit: limit || 10000,
            offset: offset || 0,
            order: order || [
                ['tagId', 'DESC']
            ]
        }).then(function(results) {
            resolve(results);
        }, reject).catch(function(err) {
            reject(err);
        });
    })
}