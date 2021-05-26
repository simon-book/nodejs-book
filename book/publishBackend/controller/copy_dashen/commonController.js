var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');
var httpGateway = require('../../data/http/httpGateway.js');

var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');

async function reqHtmlContent(host, path, charset) {
    try {
        var html = await httpGateway.htmlStartReq(host, path, charset);
        var $ = cheerio.load(html, {
            decodeEntities: false
        });
        var metas = $('meta[name="keywords"]');
        if (metas && metas.length) return $;
        else {
            console.log(html);
            return null;
        }
    } catch (err) {
        console.log(err, host + path);
        return null;
    }
}

exports.copyHtml = async function(host, path, charset) {
    try {
        var result = await reqHtmlContent(host, path, charset);
        if (!result) var result = await reqHtmlContent(host, path, charset);
        if (!result) var result = await reqHtmlContent(host, path, charset);
        if (!result) var result = await reqHtmlContent(host, path, charset);
        if (!result) var result = await reqHtmlContent(host, path, charset);
        if (result) {
            console.log("success:" + host + path)
            return result;
        } else throw new Error("5次请求html失败");
    } catch (err) {
        console.log("5次请求html失败:", path);
        throw err;
    }
}