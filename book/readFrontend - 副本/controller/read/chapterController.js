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

exports.copyChapterContent = async function(host, path) {
    try {
        // if (/biquge\.info/.test(host)) {
        var bookHtml = await httpGateway.htmlStartReq(host, path);
        var $ = cheerio.load(bookHtml, {
            decodeEntities: false
        });
        return $("#content").html();
        // } else {
        //     return "";
        // }
    } catch (err) {
        return "";
    }
}