var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var fs = require('fs');
var fsPromises = fs.promises;
var httpGateway = require('../../data/http/httpGateway.js');
var tagSequelize = require('../../data/sequelize/picture/tagSequelize.js');
var modelSequelize = require('../../data/sequelize/picture/modelSequelize.js');
var pictureSequelize = require('../../data/sequelize/picture/pictureSequelize.js');
var articleSequelize = require('../../data/sequelize/picture/articleSequelize.js');
var rankSequelize = require('../../data/sequelize/rank/rankSequelize.js');
var sitemap = {
    "www.99nvshen.com": {
        branchId: 1,
        site: "https://www.99nvshen.com",
        token: "MLVSuDUPIqTlqZVO",
        startDate: "2021-09-20"
    },
    "nvshen.datuxiu.com": {
        branchId: 1,
        site: "https://nvshen.datuxiu.com",
        token: "MLVSuDUPIqTlqZVO",
        startDate: "2021-09-20"
    }
}

exports.createSitemapFiles = async function(site) {
    try {
        if (!site || !sitemap[site]) return false;
        var siteInfo = sitemap[site];
        var urls = [siteInfo.site, siteInfo.site + "/galleryList/", siteInfo.site + "/modelList/", siteInfo.site + "/paihang/"];
        var tagGroups = await tagSequelize.findAllTagGroup({
            branchId: siteInfo.branchId
        })
        _.forEach(tagGroups, function(tagGroup) {
            var path = "";
            if (tagGroup.type == "picture") path = "/galleryList/";
            else if (tagGroup.type == "model") path = "/modelList/";
            for (var i = 0; i < tagGroup.tags.length; i++) {
                urls.push(siteInfo.site + path + tagGroup.tags[i].tagId + "/1");
            }
        });
        var ranks = await rankSequelize.findAll({
            branchId: siteInfo.branchId
        })
        for (var i = 0; i < ranks.length; i++) {
            urls.push(siteInfo.site + "/paihang/" + ranks[i].rankId);
        }
        var pictures = await pictureSequelize.findAllWithoutTags({}, ["pictureId"]);
        for (var i = 0; i < pictures.length; i++) {
            urls.push(siteInfo.site + "/gallery/" + pictures[i].pictureId);
        }
        var models = await modelSequelize.findAllWithoutTags({
            statusId: 2
        }, ["modelId"]);
        for (var i = 0; i < models.length; i++) {
            urls.push(siteInfo.site + "/model/" + models[i].modelId);
        }
        var articles = await articleSequelize.findAll({}, 0, 10000, null, ["articleId"]);
        for (var i = 0; i < articles.length; i++) {
            urls.push(siteInfo.site + "/article/" + articles[i].articleId);
        }
        var index = 0;
        var start = 0;
        var len = 50000;
        do {
            try {
                index++;
                var toUrls = urls.slice(start, start + len);
                var content = toUrls.join("\n");
                var fileName = site.replace(/\./g, "") + index;
                await fsPromises.writeFile("./statics/" + fileName + ".txt", content);

            } catch (err) {
                console.log(err);
            }
            start += len;
        } while (start < urls.length)
    } catch (err) {
        console.log(err);
    }
}

exports.submitAll = async function(site) {
    try {
        if (!site || !sitemap[site]) return false;
        var siteInfo = sitemap[site];
        var urls = [];
        var pictures = await pictureSequelize.findAllWithoutTags({}, ["pictureId"]);
        for (var i = 0; i < pictures.length; i++) {
            urls.push(siteInfo.site + "/gallery/" + pictures[i].pictureId);
        }
        var models = await modelSequelize.findAllWithoutTags({
            statusId: 2
        }, ["modelId"]);
        for (var i = 0; i < models.length; i++) {
            urls.push(siteInfo.site + "/model/" + models[i].modelId);
        }
        var articles = await articleSequelize.findAll({}, 0, 10000, null, ["articleId"]);
        for (var i = 0; i < articles.length; i++) {
            urls.push(siteInfo.site + "/article/" + articles[i].articleId);
        }
        var start = 0;
        var len = 2000;
        do {
            try {
                var toUrls = urls.slice(start, start + len);
                var content = toUrls.join("\n");
                console.log(content);
                var result = await httpGateway.submitUrlsToBaiduStartReq(siteInfo.site, siteInfo.token, content);
                console.log(result);
            } catch (err) {
                console.log(err);
            }
            start += len;
        } while (start < urls.length)
    } catch (err) {
        console.log(err);
    }
}

exports.submitNew = async function(site, startDate, endDate) {
    try {
        if (__G__.NODE_ENV != "deploy") return false;
        if (!site || !sitemap[site]) return false;
        var siteInfo = sitemap[site];
        if (!startDate || !endDate) {
            endDate = moment().toDate();
            startDate = moment().subtract(1, 'days').toDate();
        }
        var urls = [];
        var pictures = await pictureSequelize.findAllWithoutTags({
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        }, ["pictureId"]);
        for (var i = 0; i < pictures.length; i++) {
            urls.push(siteInfo.site + "/gallery/" + pictures[i].pictureId);
        }
        var models = await modelSequelize.findAllWithoutTags({
            createdAt: {
                [Op.between]: [startDate, endDate]
            },
            statusId: 2
        }, ["modelId"]);
        for (var i = 0; i < models.length; i++) {
            urls.push(siteInfo.site + "/model/" + models[i].modelId);
            urls.push(siteInfo.site + "/model/" + models[i].modelId + "/album/");
        }
        var articles = await articleSequelize.findAll({
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        }, 0, 10000, null, ["articleId"]);
        for (var i = 0; i < articles.length; i++) {
            urls.push(siteInfo.site + "/article/" + articles[i].articleId);
        }
        var diff = moment().diff(moment(siteInfo.startDate), "days");
        if (diff) {
            var models = await modelSequelize.findAllWithPictures({
                statusId: 2
            }, (diff - 1) * 30, 30, null, ["modelId"]);
            for (var i = 0; i < models.length; i++) {
                urls.push(siteInfo.site + "/model/" + models[i].modelId + "/album/");
            }
        }
        var start = 0;
        var len = 2000;
        do {
            try {
                var toUrls = urls.slice(start, start + len);
                var content = toUrls.join("\n");
                console.log(content);
                var result = await httpGateway.submitUrlsToBaiduStartReq(siteInfo.site, siteInfo.token, content);
                console.log(result);
            } catch (err) {
                console.log(err);
            }
            start += len;
        } while (start < urls.length)
    } catch (err) {
        console.log(err);
    }
}