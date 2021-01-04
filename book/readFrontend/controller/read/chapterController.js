var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');

var httpGateway = require('../../data/http/httpGateway.js')

var charsets = {
    "m.35wx.com": "GBK",
    "www.35wx.com": "GBK"
}

async function copyBiqugeInfoChapterContent(host, path) {
    try {
        var bookHtml = await httpGateway.htmlStartReq(host, path);
        var $ = cheerio.load(bookHtml, {
            decodeEntities: false
        });
        var content = $("#content").html();
        if (!content) {
            var a = $("a")[0];
            if (a && /如果您的页面没有自动跳转，请点击这里/.test($(a).text())) {
                var bookHtml = await httpGateway.htmlStartReq(host, $(a).attr("href"));
                var $ = cheerio.load(bookHtml, {
                    decodeEntities: false
                });
                var content = $("#content").html();
            }
        }
        return content;
    } catch (err) {
        console.log(err);
        return "";
    }
}

exports.copyChapterContent = async function(host, path) {
    try {
        if (/biquge\.info/.test(host)) {
            var content = await copyBiqugeInfoChapterContent(host, path);
            if (!content) var content = await copyBiqugeInfoChapterContent(host, path);
            if (!content) var content = await copyBiqugeInfoChapterContent(host, path);
            if (!content) var content = await copyBiqugeInfoChapterContent(host, path);
            if (!content) var content = await copyBiqugeInfoChapterContent(host, path);
            return content;
        } else {
            return "";
        }
    } catch (err) {
        console.log(err);
        return "";
    }
}