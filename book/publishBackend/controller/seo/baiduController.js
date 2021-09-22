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
var bookCategorySequelize = require('../../data/sequelize/book/bookCategorySequelize.js');

var sitemap = {
    "www.99amn.com": {
        branchId: 1,
        site: "https://www.99amn.com",
        token: "MLVSuDUPIqTlqZVO"
    }
}

exports.createSitemapFiles = async function(site) {
    try {
        if (!site || !sitemap[site]) return false;
        var siteInfo = sitemap[site];
        var books = await bookSequelize.findAll(null, ["bookId"], 0, 200000, true);
        var urls = [siteInfo.site, siteInfo.site + "/category/", siteInfo.site + "/paihang/", siteInfo.site + "/quanbu/", siteInfo.site + "/quanben/"];
        var categories = await bookCategorySequelize.findAll({
            branchId: siteInfo.branchId
        });
        _.forEach(categories, function(category) {
            urls.push(siteInfo.site + "/quanben/" + category.categoryId + "/1");
            urls.push(siteInfo.site + "/category/" + category.categoryId + "/1");
        })
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

exports.submitNew = async function(site, startDate, endDate) {
    try {
        if (__G__.NODE_ENV != "deploy") return false;
        if (!site || !sitemap[site]) return false;
        var siteInfo = sitemap[site];
        if (!startDate || !endDate) {
            startDate = moment().format("YYYY-MM-DD");
            endDate = startDate;
        }
        var yesterday = moment().subtract(1, 'days');
        var books = await bookSequelize.findAll({
            createdAt: {
                [Op.between]: [startDate + " 00:00:00", endDate + " 23:59:59"]
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
                console.log(content);
                var result = await httpGateway.submitUrlsToBaiduStartReq(siteInfo.site, siteInfo.token, content);
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

exports.submitNewBook = async function(bookId) {
    try {
        var site = "www.99amn.com";
        if (__G__.NODE_ENV != "deploy") return false;
        if (!site || !sitemap[site] || !bookId) return false;
        var siteInfo = sitemap[site];
        var content = siteInfo.site + "/book/" + bookId;
        console.log(content);
        var result = await httpGateway.submitUrlsToBaiduStartReq(siteInfo.site, siteInfo.token, content);
        console.log(result);
    } catch (err) {
        console.log(err);
    }
}