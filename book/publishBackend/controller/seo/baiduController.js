var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var fs = require('fs');
var fsPromises = fs.promises;
var httpGateway = require('../../data/http/httpGateway.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');
var rankSequelize = require('../../data/sequelize/rank/rankSequelize.js');

var sitemap = {
    "www.99amn.com": {
        site: "https://www.99amn.com",
        token: "MLVSuDUPIqTlqZVO"
    }
}

exports.createSitemapFiles = async function(site) {
    try {
        if (!site || !sitemap[site]) return false;
        var siteInfo = sitemap[site];
        var books = await bookSequelize.findAll(null, ["bookId"], 0, 200000, true);
        var urls = [];
        for (var i = 0; i < books.length; i++) {
            urls.push(siteInfo.site + "/book/" + books[i].bookId);
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
                start += len;
            } catch (err) {
                console.log(err);
            }
        } while (start < urls.length)
    } catch (err) {
        console.log(err);
    }
}

exports.submitNew = async function(site) {
    try {
        if (!site || !sitemap[site]) return false;
        var siteInfo = sitemap[site];
        var yesterday = moment().subtract(1, 'days');
        var books = await bookSequelize.findAll({
            createdAt: {
                [Op.between]: ["2021-01-01" + " 00:00:00", "2021-07-10" + " 23:59:59"]
            }
        }, ["bookId"], 0, 200000, true);
        if (!books.length) return false;
        var urls = [];
        for (var i = 0; i < books.length; i++) {
            urls.push(siteInfo.site + "/book/" + books[i].bookId);
        }
        var start = 0;
        var len = 2000;
        do {
            try {
                var toUrls = urls.slice(start, start + len);
                var content = toUrls.join("\n");
                var result = await httpGateway.submitUrlsToBaiduStartReq(site, siteInfo.token, content);
                console.log(result);
                start += len;
            } catch (err) {
                console.log(err);
            }
        } while (start < urls.length)
    } catch (err) {
        console.log(err);
    }
}