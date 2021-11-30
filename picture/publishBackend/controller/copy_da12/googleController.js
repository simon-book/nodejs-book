var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var path = require('path');
var https = require('https');
var fs = require('fs');
var fsPromises = fs.promises;
var httpGateway = require('../../data/http/httpGateway.js');
var tagSequelize = require('../../data/sequelize/picture/tagSequelize.js');
var modelSequelize = require('../../data/sequelize/picture/modelSequelize.js');
var pictureSequelize = require('../../data/sequelize/picture/pictureSequelize.js');
var articleSequelize = require('../../data/sequelize/picture/articleSequelize.js');
var rankSequelize = require('../../data/sequelize/rank/rankSequelize.js');
var sitemap = {
    "www.9iktb.com": {
        branchId: 1,
        site: "https://www.9iktb.com",
        token: "MLVSuDUPIqTlqZVO",
        startDate: "2021-09-20"
    }
}

var sitemapPath = path.resolve('../../', 'static/txt_9iktb/');
console.log(sitemapPath);

exports.createSitemapFiles = async function(site) {
    try {
        if (!site || !sitemap[site]) return false;
        var siteInfo = sitemap[site];
        var urls = [siteInfo.site, siteInfo.site + "/tagList/", siteInfo.site + "/galleryList/"];
        var tags = await tagSequelize.findAll({
            branchId: siteInfo.branchId
        })
        _.forEach(tags, function(tag) {
            urls.push(siteInfo.site + "/galleryList/" + tag.tagId + "/1");
        });
        var pictures = await pictureSequelize.findAllWithoutTags({}, ["pictureId"]);
        for (var i = 0; i < pictures.length; i++) {
            urls.push(siteInfo.site + "/gallery/" + pictures[i].pictureId);
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
                await fsPromises.writeFile(sitemapPath + "/" + fileName + ".txt", content);
                https.get('https://www.google.com/ping?sitemap=' + siteInfo.site + '/' + fileName + '.txt', (res) => {
                    console.log('statusCode:', res.statusCode);
                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => { rawData += chunk; });
                    res.on('end', () => {
                        try {
                            console.log(rawData);
                        } catch (e) {
                            console.error(e.message);
                        }
                    });

                }).on('error', (e) => {
                    console.error(e);
                });
            } catch (err) {
                console.log(err);
            }
            start += len;
        } while (start < urls.length)
    } catch (err) {
        console.log(err);
    }
}