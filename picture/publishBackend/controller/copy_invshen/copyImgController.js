var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var fs = require('fs');
var fsPromises = fs.promises;
var moment = require('moment');
var cheerio = require('cheerio');
var http = require('https');
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

exports.copy_articles_img = async function(articleId, startIndex) {
    try {
        var branchInfo = await copyController.queryBranchInfo();
        var where = {
            local: false
        };
        if (articleId) where.articleId = articleId;
        var articles = await articleSequelize.findAll(where, 0, 10000, null, ["articleId", "cover", "title", "content", "local"]);
        console.log(articles.length);
        for (var i = 0; i < articles.length; i++) {
            var article = articles[i];
            if (article.local) continue;
            try {
                console.log("article-" + article.articleId);
                var filePath = "./assets/branch" + branchInfo.branchId + "/articles/" + article.articleId;
                var ossPath = "assets/branch" + branchInfo.branchId + "/articles/" + article.articleId;
                if (!fs.existsSync(filePath)) {
                    await fsPromises.mkdir(filePath, {
                        recursive: true
                    });
                }
                var local = true;
                var index = 0;
                var copyPictureUrl = "https://img.xiublog.com:85";
                var imgUrl = copyPictureUrl + article.cover;
                var imgFormat = /(\.jpg|\.png|\.jpeg|\.gif)$/i.test(imgUrl) ? imgUrl.split(".").pop() : "jpg";
                var fileName = filePath + "/" + index + "." + imgFormat;
                var ossName = ossPath + "/" + index + "." + imgFormat;
                await startDownloadFile(imgUrl, fileName);
                var putresult = await OssClient.put(ossName, fileName);
                console.log("upload!", fileName);
                article.set("cover", "/" + ossName);
                index++;
                for (var j = 0; j < article.content.length; j++) {
                    var content = article.content[j];
                    content = content.replace(/\*{4}pictureUrl\*{3}/g, copyPictureUrl);
                    var $ = cheerio.load(content, null, false);
                    var imgs = $("img");
                    console.log(imgs.length);
                    for (var k = 0; k < imgs.length; k++) {
                        var img = imgs[k];
                        var imgUrl = $(img).attr("src");
                        var imgFormat = /(\.jpg|\.png|\.jpeg|\.gif)$/i.test(imgUrl) ? imgUrl.split(".").pop() : "jpg";
                        var fileName = filePath + "/" + index + "." + imgFormat;
                        var ossName = ossPath + "/" + index + "." + imgFormat;
                        await startDownloadFile(imgUrl, fileName);
                        var putresult = await OssClient.put(ossName, fileName);
                        console.log("upload!", fileName);
                        $(img).attr("src", "****pictureUrl***/" + ossName)
                        index++;
                    };
                    content = $.html();
                    // console.log(content);
                    article.content.splice(j, 1, content);
                }
                article.set("content", article.content);
            } catch (err) {
                console.log("article error", err);
                local = false;
            }
            if (!local) continue;
            article.set("local", local);
            await article.save();
        }
    } catch (err) {
        console.log(err);
    }
}

exports.copy_models_img = async function(modelId, startIndex) {
    try {
        var branchInfo = await copyController.queryBranchInfo();
        var where = {
            local: false
        };
        if (modelId) where.modelId = modelId;
        var models = await modelSequelize.findAll(where);
        console.log(models.length);
        for (var i = 0; i < models.length; i++) {
            var model = models[i];
            if (model.local || !model.cover) continue;
            try {
                console.log("model-" + model.modelId);
                var filePath = "./assets/branch" + branchInfo.branchId + "/models/cover";
                var ossPath = "assets/branch" + branchInfo.branchId + "/models/cover";
                if (!fs.existsSync(filePath)) {
                    await fsPromises.mkdir(filePath, {
                        recursive: true
                    });
                }
                var local = true;
                var copyPictureUrl = "https://img.xiublog.com:85";
                var imgUrl = copyPictureUrl + model.cover;
                var imgFormat = /(\.jpg|\.png|\.jpeg|\.gif)$/i.test(imgUrl) ? imgUrl.split(".").pop() : "jpg";
                var fileName = filePath + "/" + model.modelId + "." + imgFormat;
                var ossName = ossPath + "/" + model.modelId + "." + imgFormat;
                await startDownloadFile(imgUrl, fileName);
                var putresult = await OssClient.put(ossName, fileName);
                console.log("upload!", fileName);
                model.set("cover", "/" + ossName);
            } catch (err) {
                console.log("model error", err);
                local = false;
            }
            if (!local) continue;
            model.set("local", local);
            await model.save();
        }
    } catch (err) {
        console.log(err);
    }
}

exports.copy_gallerys_img = async function(pictureId, startIndex) {
    try {
        var branchInfo = await copyController.queryBranchInfo();
        var where = {
            local: false
        };
        if (pictureId) where.pictureId = pictureId;
        var pictures = await pictureSequelize.findAll(where);
        console.log(pictures.length);
        for (var i = 0; i < pictures.length; i++) {
            var picture = pictures[i];
            if (picture.local) continue;
            try {
                if (!picture.cover || !picture.pictureHdList) {
                    picture = await copyController.create_picture(picture.originId);
                }
                console.log("picture-" + picture.pictureId);
                var filePath = "./assets/branch" + branchInfo.branchId + "/pictures/cover";
                var ossPath = "assets/branch" + branchInfo.branchId + "/pictures/cover";
                if (!fs.existsSync(filePath)) {
                    await fsPromises.mkdir(filePath, {
                        recursive: true
                    });
                }
                var local = true;
                var imgUrl = branchInfo.copyPictureUrl + picture.cover;
                var imgFormat = imgUrl.split(".").pop();
                var fileName = filePath + "/" + picture.pictureId + "." + imgFormat;
                var ossName = ossPath + "/" + picture.pictureId + "." + imgFormat;
                await startDownloadFile(imgUrl, fileName);
                var putresult = await OssClient.put(ossName, fileName);
                console.log("upload!", fileName);
                picture.set("cover", "/" + ossName);

                var imgs = picture.pictureHdList;
                if (imgs && imgs.length) {
                    var filePath = "./assets/branch" + branchInfo.branchId + "/pictures/hdlist/" + picture.pictureId;
                    var ossPath = "assets/branch" + branchInfo.branchId + "/pictures/hdlist/" + picture.pictureId;
                    if (!fs.existsSync(filePath)) {
                        await fsPromises.mkdir(filePath, {
                            recursive: true
                        });
                    }
                    var index = 1;
                    console.log(imgs.length);
                    for (var k = 0; k < imgs.length; k++) {
                        var img = imgs[k];
                        var imgUrl = branchInfo.copyPictureUrl + img;
                        var imgFormat = imgUrl.split(".").pop();
                        var fileName = filePath + "/" + index + "." + imgFormat;
                        var ossName = ossPath + "/" + index + "." + imgFormat;
                        await startDownloadFile(imgUrl, fileName);
                        var putresult = await OssClient.put(ossName, fileName);
                        console.log("upload!", fileName);
                        imgs.splice(k, 1, "/" + ossName);
                        index++;
                    };
                    picture.set("pictureHdList", picture.pictureHdList);
                }

                var imgs = picture.pictureList;
                if ((!picture.pictureHdList || !picture.pictureHdList.length) && imgs && imgs.length) {
                    var filePath = "./assets/branch" + branchInfo.branchId + "/pictures/list/" + picture.pictureId;
                    var ossPath = "assets/branch" + branchInfo.branchId + "/pictures/list/" + picture.pictureId;
                    if (!fs.existsSync(filePath)) {
                        await fsPromises.mkdir(filePath, {
                            recursive: true
                        });
                    }
                    var index = 1;
                    console.log(imgs.length);
                    for (var k = 0; k < imgs.length; k++) {
                        var img = imgs[k];
                        var imgUrl = branchInfo.copyPictureUrl + img;
                        var imgFormat = imgUrl.split(".").pop();
                        var fileName = filePath + "/" + index + "." + imgFormat;
                        var ossName = ossPath + "/" + index + "." + imgFormat;
                        await startDownloadFile(imgUrl, fileName);
                        var putresult = await OssClient.put(ossName, fileName);
                        console.log("upload!", fileName);
                        imgs.splice(k, 1, "/" + ossName);
                        index++;
                    };
                    picture.set("pictureList", picture.pictureList);
                }
            } catch (err) {
                console.log("picture error", err);
                local = false;
            }
            if (!local) continue;
            picture.set("local", local);
            await picture.save();
        }
    } catch (err) {
        console.log(err);
    }
}

async function startDownloadFile(src, fileName) {
    try {
        var result = await downloadFile(src, fileName);
        if (!result) {
            var result = await downloadFile(src, fileName);
        }
        if (!result) {
            var result = await downloadFile(src, fileName);
        }
        if (!result) {
            var result = await downloadFile(src, fileName);
        }
        if (!result) {
            var result = await downloadFile(src, fileName);
        }
        if (result) {
            return true;
        } else throw new Error("5次请求img失败");
    } catch (err) {
        console.log("5次请求img失败:", src, fileName);
        throw new Error("5次请求img失败");
        // return false;
    }
}

async function downloadFile(src, fileName) {
    try {
        await httpFile(src, fileName);
        return true;
    } catch (err) {
        return false;
    }
}


function httpFile(src, fileName) {
    return new Promise(function(resolve, reject) {
        var stream = fs.createWriteStream(fileName);
        stream.on('finish', async () => {
            console.log("download!", fileName);
            resolve(true);
        });
        console.log("start download!", src, fileName);
        var req = http.request({
            host: src.replace(/https:\/\/|http:\/\//, "").split(":85")[0],
            port: "85",
            path: src.replace(/https:\/\/|http:\/\//, "").split(":85")[1],
            method: 'GET',
            rejectUnauthorized: false,
            headers: {
                "Referer": "https://www.fnvshen.com/"
            },
            timeout: 10000
        }, function(response) {
            response.pipe(stream);
        });
        req.on('error', function(e) {
            console.log("error", e);
            reject();
        });
        req.on('timeout', function(e) {
            req.abort();
            console.log("timeout", e);
            reject(e);
        });
        req.write("");
        req.end();
    })
}

exports.startDownloadFile = startDownloadFile;
exports.downloadFile = downloadFile;
exports.httpFile = httpFile;