var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var fs = require('fs');
var fsPromises = fs.promises;
var moment = require('moment');
var cheerio = require('cheerio');
var http = require('http');
var util = require('../../util/index.js');
var httpGateway = require('../../data/http/httpGateway.js')
var commonController = require('./commonController.js')
var copyController = require('./copyController.js')
var branchSequelize = require('../../data/sequelize/branch/branchSequelize.js');
var tagSequelize = require('../../data/sequelize/picture/tagSequelize.js');
var modelSequelize = require('../../data/sequelize/picture/modelSequelize.js');
var pictureSequelize = require('../../data/sequelize/picture/pictureSequelize.js');
var articleSequelize = require('../../data/sequelize/picture/articleSequelize.js');
var rankSequelize = require('../../data/sequelize/rank/rankSequelize.js');
var OssClient = require('../../service/aliossConn.js');
var crytogram = require('../../util/cryptogram.js')

exports.receive_local_data = async function(req, res) {
    try {
        var body = req.body;
        if (!body.copySrc) {
            res.send({
                result: false,
                remark: "缺少copySrc！"
            })
            return false;
        };
        var branchInfo = await branchSequelize.findOne({
            copySrc: body.copySrc
        });
        if (!branchInfo) {
            res.send({
                result: false,
                remark: "查不到对应品牌信息"
            })
            return false;
        };
        console.log(body);
        // res.send({
        //     result: true,
        //     remark: "测试数据"
        // });
        // return true;
        // if (body.articles && body.articles.length) {
        //     console.log("update articles count: ", body.articles.length);
        //     for (var i = 0; i < body.articles.length; i++) {
        //         var article = body.articles[i];
        //         if (!article.local) continue;
        //         await articleSequelize.update({
        //             branchId: branchInfo.branchId,
        //             originId: article.originId
        //         }, {
        //             local: article.local,
        //             cover: article.cover,
        //             content: article.content
        //         })
        //     }
        // }
        if (body.models && body.models.length) {
            console.log("update models count: ", body.models.length);
            for (var i = 0; i < body.models.length; i++) {
                var model = body.models[i];
                if (!model.local) continue;
                var savedModel = await modelSequelize.findOneModel({
                    branchId: branchInfo.branchId,
                    originId: model.originId
                })
                if (savedModel && !savedModel.local) {
                    await modelSequelize.update({
                        branchId: branchInfo.branchId,
                        originId: model.originId
                    }, {
                        local: model.local,
                        cover: model.cover
                    })
                }
                if (savedModel.tags && savedModel.tags.length) continue;
                if (!savedModel) {
                    delete model.modelId;
                    delete model.relatedModelIds;
                    model.branchId = branchInfo.branchId;
                    savedModel = await modelSequelize.create(model);
                }
                var originTagIds = _.map(model.tags, "originId");
                if (!originTagIds || !originTagIds.length) continue;
                var tags = await tagSequelize.findAll({
                    branchId: branchInfo.branchId,
                    originId: {
                        [Op.in]: originTagIds
                    }
                })
                var tagIds = _.map(tags, "tagId");
                if (!tagIds || !tagIds.length) continue;
                savedModel.addTags(tagIds, {
                    through: {
                        modelOriginId: savedModel.originId
                    }
                });
            }
            for (var i = 0; i < body.models.length; i++) {
                var model = body.models[i];
                if (!model.local) continue;
                var savedModel = await modelSequelize.findOneModel({
                    branchId: branchInfo.branchId,
                    originId: model.originId
                })
                if (savedModel && !savedModel.relatedModelIds && model.relatedModelOriginIds) {
                    var relatedModelOriginIds = model.relatedModelOriginIds;
                    if (!relatedModelOriginIds || !relatedModelOriginIds.length) continue;
                    var relatedModels = await modelSequelize.findAll({
                        branchId: branchInfo.branchId,
                        originId: {
                            [Op.in]: relatedModelOriginIds
                        }
                    })
                    relatedModels = _.sortBy(relatedModels, function(model) {
                        return _.indexOf(relatedModelOriginIds, model.originId);
                    })
                    var relatedModelIds = _.map(relatedModels, "modelId");
                    if (!relatedModelIds || !relatedModelIds.length) continue;
                    savedModel.set("relatedModelIds", relatedModelIds);
                    await savedModel.save();
                }
            }
        }
        if (body.pictures && body.pictures.length) {
            console.log("update pictures count: ", body.pictures.length);
            for (var i = 0; i < body.pictures.length; i++) {
                var picture = body.pictures[i];
                if (!picture.local) continue;
                var savedPicture = await pictureSequelize.findOne({
                    branchId: branchInfo.branchId,
                    originId: picture.originId
                })
                if (savedPicture && savedPicture.local) continue;
                if (savedPicture) {
                    await pictureSequelize.update({
                        local: picture.local,
                        cover: picture.cover,
                        pictureHdList: picture.pictureHdList,
                        // pictureList: picture.pictureList,
                    }, {
                        branchId: branchInfo.branchId,
                        originId: picture.originId
                    })
                } else {
                    var modelOriginIds = _.map(picture.models, "originId");
                    var tagOriginIds = _.map(picture.tags, "originId");
                    delete picture.pictureId;
                    picture.branchId = branchInfo.branchId;
                    var addedPicture = await pictureSequelize.create(picture);
                    var models = await modelSequelize.findAll({
                        branchId: branchInfo.branchId,
                        originId: {
                            [Op.in]: modelOriginIds
                        }
                    })
                    var modelIds = _.map(models, "modelId");
                    if (modelIds && modelIds.length) await addedPicture.addModels(modelIds);
                    var tags = await tagSequelize.findAll({
                        branchId: branchInfo.branchId,
                        originId: {
                            [Op.in]: tagOriginIds
                        }
                    })
                    var tagIds = _.map(tags, "tagId");
                    if (tagIds && tagIds.length) {
                        await addedPicture.addTags(_.uniq(tagIds), {
                            through: {
                                pictureLastUpdatedAt: addedPicture.lastUpdatedAt,
                                orderIndex: parseInt(addedPicture.originId)
                            }
                        });
                    }
                }

            }
        }
        res.send({
            result: true,
            remark: "已更新全部信息"
        });
    } catch (err) {

    }
}


exports.send_local_data = async function(body) {
    try {
        if (!body.copySrc || !body.receiveHost || !body.receivePort) return false;
        var data = {
            copySrc: body.copySrc
        };
        var branchInfo = await branchSequelize.findOne({
            copySrc: body.copySrc
        });
        if (!branchInfo) return false;
        var modelWhere = {
            branchId: branchInfo.branchId,
            local: true,
            modelId: {
                [Op.gte]: 10540
            }
        };
        var pictureWhere = {
            branchId: branchInfo.branchId,
            local: true
        };
        // if (body.modelStartDate) modelWhere.createdAt = {
        //     [Op.gte]: new Date(body.modelStartDate + " 00:00:00.000")
        // }
        if (body.pictureStartDate) pictureWhere.createdAt = {
            [Op.gte]: new Date(body.pictureStartDate + " 00:00:00.000")
        }
        // if (body.copyArticle) {
        //     var articles = await articleSequelize.findAll(where, 0, 100000, null, ["articleId", "cover", "title", "content", "local", "originId"]);
        //     data.articles = _.map(articles, function(article) {
        //         return article.get();
        //     })
        // }
        if (body.copyModel) {
            var models = await modelSequelize.findAll(modelWhere);
            data.models = [];
            for (var i = 0; i < models.length; i++) {
                var model = models[i];
                var tags = _.map(model.tags, function(tag) {
                    return tag.get();
                })
                model = model.get();
                model.tags = tags;
                var relatedModels = await modelSequelize.findAll({
                    branchId: branchInfo.branchId,
                    modelId: {
                        [Op.in]: model.relatedModelIds
                    }
                });
                relatedModels = _.sortBy(relatedModels, function(model) {
                    return _.indexOf(model.relatedModelIds, model.modelId);
                })
                model.relatedModelOriginIds = _.map(relatedModels, "originId");
                data.models.push(model);
            }
        }
        if (body.copyPicture) {
            data.pictures = await pictureSequelize.findAll(pictureWhere);
        }
        var result = await sendData(body.receiveHost, body.receivePort, "/api/publisher/invshen/receive_local_data", data);
        console.log(result);
        return result;
    } catch (err) {
        console.log(err);
        return false;
    }
}

function sendData(host, port, path, data) {
    return new Promise(function(resolve, reject) {
        var req = http.request({
            host: host,
            port: port,
            path: path,
            method: 'POST',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            timeout: 60000
        }, function(res) {
            var _data = '';
            res.on('data', function(chunk) {
                _data += chunk;
            });
            res.on('end', function() {
                if (res.statusCode == 200) resolve(_data);
                else reject(_data);
            });
        });
        req.on('error', function(e) {
            console.log("error", host, port, path, e);
            reject(e);
        });
        req.on('timeout', function(e) {
            req.abort();
            console.log("timeout", host, port, path, e);
            reject("timeout");
        });
        req.write(JSON.stringify(data));
        req.end();
    })
}