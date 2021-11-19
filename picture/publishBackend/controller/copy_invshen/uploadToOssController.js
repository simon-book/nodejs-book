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

exports.update_gallery_img = async function(pictureId) {
    try {
        var where = {
            local: true,
        };
        if (pictureId instanceof Array) {
            where.pictureId = {
                [Op.between]: [pictureId[0], pictureId[1]]
            }
        } else if (pictureId) {
            where.pictureId = {
                [Op.gte]: pictureId
            }
        }
        var pictures = await pictureSequelize.findAll(where);
        console.log(pictures.length);
        for (var i = 0; i < pictures.length; i++) {
            var picture = pictures[i];
            try {
                console.log("picture-upload-" + picture.pictureId);
                // if (picture.cover) {
                //     var img = picture.cover;
                //     var fileName = "." + img;
                //     var ossName = img.replace("/", "");
                //     if (fs.existsSync(fileName)) {
                //         var putresult = await OssClient.put(ossName, fileName);
                //     }
                // }

                var imgs = picture.pictureHdList;
                if (imgs && imgs.length) {
                    try {
                        var lastImg = imgs[imgs.length - 1];
                        var ossName = lastImg.replace("/", "");
                        var exist = await OssClient.head(ossName);
                        console.log("picture-hasUploaded-" + picture.pictureId);
                        continue;
                    } catch (err) {
                        console.log(imgs.length);
                        for (var k = 0; k < imgs.length; k++) {
                            var img = imgs[k];
                            var fileName = "." + img;
                            var ossName = img.replace("/", "");
                            if (fs.existsSync(fileName)) {
                                var putresult = await OssClient.put(ossName, fileName);
                                console.log(putresult.name);
                            }
                        };
                    }
                }

                var imgs = picture.pictureList;
                if ((!picture.pictureHdList || !picture.pictureHdList.length) && imgs && imgs.length) {
                    try {
                        var lastImg = imgs[imgs.length - 1];
                        var ossName = lastImg.replace("/", "");
                        var exist = await OssClient.head(ossName);
                        console.log("picture-hasUploaded-" + picture.pictureId);
                        continue;
                    } catch (err) {
                        console.log(imgs.length);
                        for (var k = 0; k < imgs.length; k++) {
                            var img = imgs[k];
                            var fileName = "." + img;
                            var ossName = img.replace("/", "");
                            if (fs.existsSync(fileName)) {
                                var putresult = await OssClient.put(ossName, fileName);
                            }
                        };
                    }
                }
            } catch (err) {
                console.log("picture-upload-error-" + picture.pictureId, err);
            }
        }
    } catch (err) {
        console.log(err);
    }
}