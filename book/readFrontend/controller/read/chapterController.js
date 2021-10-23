var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');
var util = require('../../util/index.js');
var httpGateway = require('../../data/http/httpGateway.js');

async function copyBiqugeInfoChapterContent(host, path, charset, chapter) {
    try {
        var content = await httpGateway.mossServerStartReq("GET", "/moss/get/" + chapter.branchId + "/" + chapter.bookId + "/" + chapter.number, "");
        if (content) return content;
        var bookHtml = await httpGateway.htmlStartReq(host, path, charset);
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
        // console.log(err);
        return "";
    }
}

exports.copyChapterContent = async function(branch, bookOriginId, chapterOriginId, chapter) {
    try {
        var host = branch.pcCopyUrl;
        var content = "";
        var charset = "utf-8";
        if (/biqu/.test(branch.copySrc)) {
            var path = "/" + bookOriginId + "/" + chapterOriginId + ".html";
        } else if (/dashen/.test(branch.copySrc)) {
            charset = "gbk"
            var path = "/html/" + bookOriginId.split("_")[0] + "/" + bookOriginId.split("_")[1] + "/" + chapterOriginId + ".html";
        } else if (/ibs/.test(branch.copySrc)) {
            var path = "/" + bookOriginId + "/" + chapterOriginId + ".html";
        }
        content = await copyBiqugeInfoChapterContent(host, path, charset, chapter);
        if (!content) {
            await util.sleep(1000);
            var content = await copyBiqugeInfoChapterContent(host, path, charset, chapter);
        }
        if (!content) {
            await util.sleep(1000);
            var content = await copyBiqugeInfoChapterContent(host, path, charset, chapter);
        }
        if (!content) {
            await util.sleep(1000);
            var content = await copyBiqugeInfoChapterContent(host, path, charset, chapter);
        }
        if (!content) {
            await util.sleep(1000);
            var content = await copyBiqugeInfoChapterContent(host, path, charset, chapter);
        }
        if (content) {
            console.log("success:" + host + path)
            return content;
        } else throw new Error("5次请求html失败");
    } catch (err) {
        console.log("5次请求html失败:", host + path);
        return "";
    }
}