var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');
var util = require('../../util/index.js');
var httpGateway = require('../../data/http/httpGateway.js');
async function reqHtmlContent(host, path, charset) {
    try {
        var html = await httpGateway.htmlStartReq(host, path, charset);
        var $ = cheerio.load(html, {
            decodeEntities: false
        });
        var metas = $('meta[name="description"]');
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
        await util.sleep(1000);
        if (!result) {
            var result = await reqHtmlContent(host, path, charset);
            await util.sleep(1000);
        }
        if (!result) {
            var result = await reqHtmlContent(host, path, charset);
            await util.sleep(1000);
        }
        if (!result) {
            var result = await reqHtmlContent(host, path, charset);
            await util.sleep(1000);
        }
        if (!result) {
            var result = await reqHtmlContent(host, path, charset);
            await util.sleep(1000);
        }
        if (!result) {
            var result = await reqHtmlContent(host, path, charset);
            await util.sleep(1000);
        }
        if (result) {
            console.log("success:" + host + path)
            return result;
        } else throw new Error("5次请求html失败");
    } catch (err) {
        console.log("5次请求html失败:", path);
        throw err;
    }
}


async function reqHtmlFragmentContent(host, path, charset, body) {
    try {

        var html = await httpGateway.htmlFragmentStartReq(host, path, charset, body);
        var $ = cheerio.load(html, {
            decodeEntities: false
        });
        var metas = $('li.girlli');
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

exports.copyHtmlFragment = async function(host, path, charset, body) {
    try {
        var result = await reqHtmlFragmentContent(host, path, charset, body);
        await util.sleep(1000);
        if (!result) {
            var result = await reqHtmlFragmentContent(host, path, charset, body);
            await util.sleep(1000);
        }
        if (!result) {
            var result = await reqHtmlFragmentContent(host, path, charset, body);
            await util.sleep(1000);
        }
        if (!result) {
            var result = await reqHtmlFragmentContent(host, path, charset, body);
            await util.sleep(1000);
        }
        if (!result) {
            var result = await reqHtmlFragmentContent(host, path, charset, body);
            await util.sleep(1000);
        }
        if (!result) {
            var result = await reqHtmlFragmentContent(host, path, charset, body);
            await util.sleep(1000);
        }
        if (result) {
            console.log("success:" + host + path)
            return result;
        } else throw new Error("5次请求html失败");
    } catch (err) {
        console.log("5次请求html失败:", path);
        throw err;
    }
}