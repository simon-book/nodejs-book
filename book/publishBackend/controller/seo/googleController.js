var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var path = require('path');
var https = require('https');
var fs = require('fs');
var fsPromises = fs.promises;
var httpGateway = require('../../data/http/httpGateway.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var sitemap = {
    "www.99amn.com": {
        branchId: 1,
        site: "https://www.99amn.com",
        token: "MLVSuDUPIqTlqZVO"
    }
}

var sitemapPath = path.resolve('../../', 'static/txt/');
console.log(sitemapPath);

exports.createSitemapFiles = async function(site) {
    try {
        if (!site || !sitemap[site]) return false;
        var siteInfo = sitemap[site];
        var books = await bookSequelize.findAll({
            createdAt: {
                [Op.gte]: "2021-09-21 00:00:00"
            }
        }, ["bookId"], 0, 200000, true);
        if (!books.length) return false;
        var urls = [];
        for (var i = 0; i < books.length; i++) {
            urls.push(siteInfo.site + "/book/" + books[i].bookId);
        }
        var index = 3;
        var start = 0;
        var len = 50000;
        do {
            try {
                index++;
                var toUrls = urls.slice(start, start + len);
                var content = toUrls.join("\n");
                var fileName = site.replace(/\./g, "") + index;
                await fsPromises.writeFile(sitemapPath + "/" + fileName + ".txt", content);
                https.get('https://www.google.com/ping?sitemap=https://www.99amn.com/www99amncom4.txt', (res) => {
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