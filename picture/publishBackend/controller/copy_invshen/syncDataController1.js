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
        if (body.branchInfo && body.branchInfo.copyParams) {
            branchInfo.set("copyParams", body.branchInfo.copyParams);
            await branchInfo.save();
        }
        if (body.articles && body.articles.length) {
            console.log("update articles count: ", body.articles.length);
            for (var i = 0; i < body.articles.length; i++) {
                var article = body.articles[i];
                if (!article.local) continue;
                await articleSequelize.update({
                    branchId: branchInfo.branchId,
                    originId: article.originId
                }, {
                    local: article.local,
                    cover: article.cover,
                    content: article.content
                })
            }
        }
        if (body.models && body.models.length) {
            console.log("update models count: ", body.models.length);
            for (var i = 0; i < body.models.length; i++) {
                var model = body.models[i];
                if (!model.local) continue;
                await modelSequelize.update({
                    branchId: branchInfo.branchId,
                    originId: model.originId
                }, {
                    local: model.local,
                    cover: model.cover
                })
            }
        }
        if (body.pictures && body.pictures.length) {
            console.log("update pictures count: ", body.pictures.length);
            for (var i = 0; i < body.pictures.length; i++) {
                var picture = body.pictures[i];
                if (!picture.local) continue;
                await pictureSequelize.update({
                    local: picture.local,
                    cover: picture.cover,
                    pictureHdList: picture.pictureHdList,
                    // pictureList: picture.pictureList,
                }, {
                    branchId: branchInfo.branchId,
                    originId: picture.originId
                })
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
        if (body.copyBranchInfo) data.branchInfo = branchInfo.get();
        var where = {
            branchId: branchInfo.branchId,
            local: true
        };
        if (body.startDate) where.createdAt = {
            [Op.gte]: new Date(body.startDate + " 00:00:00.000")
        }
        if (body.copyArticle) {
            var articles = await articleSequelize.findAll(where, 0, 100000, null);
            data.articles = _.map(articles, function(article) {
                return article.get();
            })
        }
        if (body.copyModel) {
            var models = await modelSequelize.findAllWithoutTags(where);
            data.models = _.map(models, function(model) {
                return model.get();
            })
        }
        if (body.copyPicture) {
            var pictures = await pictureSequelize.findAllWithoutTags(where);
            data.pictures = _.map(pictures, function(picture) {
                return picture.get();
            })
        }
        console.log(data);
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