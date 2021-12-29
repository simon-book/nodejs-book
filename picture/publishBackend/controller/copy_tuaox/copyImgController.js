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
var pictureSequelize = require('../../data/sequelize/picture/pictureSequelize.js');

exports.copy_gallerys_img = async function(pictureId, startIndex) {
    try {
        var branchInfo = await copyController.queryBranchInfo();
        var where = {
            branchId: branchInfo.branchId,
            local: false
        };
        if (pictureId) where.pictureId = pictureId;
        var pictures = await pictureSequelize.findAll(where);
        console.log(pictures.length);
        for (var i = 0; i < pictures.length; i++) {
            var picture = pictures[i];
            if (picture.local || picture.horiCover) continue;
            try {
                console.log("picture-" + picture.pictureId);
                var filePath = "./assets/branch" + branchInfo.branchId + "/pictures/cover";
                var ossPath = "assets/branch" + branchInfo.branchId + "/pictures/cover";
                if (!fs.existsSync(filePath)) {
                    await fsPromises.mkdir(filePath, {
                        recursive: true
                    });
                }
                var local = true;
                var imgUrl = picture.cover;
                var imgFormat = imgUrl.split(".").pop();
                var fileName = filePath + "/" + picture.pictureId + "." + imgFormat;
                var ossName = ossPath + "/" + picture.pictureId + "." + imgFormat;
                await startDownloadFile(branchInfo.copyPictureUrl, imgUrl, fileName);
                picture.set("cover", "/" + ossName);

                var imgs = picture.pictureList;
                if (imgs && imgs.length) {
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
                        var imgUrl = img;
                        var imgFormat = imgUrl.split(".").pop();
                        var fileName = filePath + "/" + index + "." + imgFormat;
                        var ossName = ossPath + "/" + index + "." + imgFormat;
                        await startDownloadFile(branchInfo.copyPictureUrl, imgUrl, fileName);
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

async function startDownloadFile(host, src, fileName) {
    try {
        var result = await downloadFile(host, src, fileName);
        if (!result) {
            var result = await downloadFile(host, src, fileName);
        }
        if (!result) {
            var result = await downloadFile(host, src, fileName);
        }
        if (!result) {
            var result = await downloadFile(host, src, fileName);
        }
        if (!result) {
            var result = await downloadFile(host, src, fileName);
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

async function downloadFile(host, src, fileName) {
    try {
        await httpFile(host, src, fileName);
        return true;
    } catch (err) {
        return false;
    }
}


function httpFile(host, src, fileName) {
    return new Promise(function(resolve, reject) {
        // var stream = fs.createWriteStream(fileName);
        // stream.on('finish', async () => {
        //     console.log("download!", fileName);
        //     resolve(true);
        // });
        console.log("start download!", src, fileName);
        var req = http.request({
            host: host.replace(/https:\/\/|http:\/\//, ""),
            path: src,
            method: 'GET',
            rejectUnauthorized: false,
            headers: {
                "Referer": host + "/"
            },
            timeout: 60000
        }, function(res) {
            // response.pipe(stream);
            var _data = [];
            res.on('data', function(chunk) {
                _data.push(chunk);
            });
            res.on('end', async function() {
                if (res.statusCode == 200) {
                    try {
                        var body = Buffer.concat(_data);
                        await fsPromises.writeFile(fileName, body);
                        console.log("download!", fileName);
                        resolve(true);
                    } catch (err) {
                        console.log(path, err);
                        reject(err);
                    }
                } else {
                    // console.log("status error", path, _data);
                    reject("status error: " + res.statusCode);
                }
            });
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