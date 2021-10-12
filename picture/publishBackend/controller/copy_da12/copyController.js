var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');
var util = require('../../util/index.js');
var httpGateway = require('../../data/http/httpGateway.js')
var commonController = require('../copy_invshen/commonController.js')
var branchSequelize = require('../../data/sequelize/branch/branchSequelize.js');
var tagSequelize = require('../../data/sequelize/picture/tagSequelize.js');
var modelSequelize = require('../../data/sequelize/picture/modelSequelize.js');
var pictureSequelize = require('../../data/sequelize/picture/pictureSequelize.js');
var articleSequelize = require('../../data/sequelize/picture/articleSequelize.js');
var rankSequelize = require('../../data/sequelize/rank/rankSequelize.js');

var branch = {
    copySrc: "da12.cc", //www.da12.cc/
}

exports.queryBranchInfo = async function() {
    try {
        var savedBranch = await branchSequelize.findOne({
            copySrc: branch.copySrc
        });
        if (savedBranch && savedBranch.copyParams) {
            branch.branchId = savedBranch.branchId;
            branch.copyUrl = savedBranch.copyParams.copyUrl;
            branch.pcCopyUrl = savedBranch.copyParams.pcCopyUrl;
            branch.pictureUrl = savedBranch.copyParams.pictureUrl;
            branch.charset = savedBranch.copyParams.charset;
            branch.isTest = savedBranch.copyParams.isTest || false;
            branch.tags = [];
            var savedTags = await tagSequelize.findAll({
                branchId: branch.branchId
            })
            _.forEach(savedTags, function(tag) {
                branch.tags.push({
                    tagId: tag.tagId,
                    name: tag.name,
                    remark: tag.remark,
                    originId: tag.originId,
                    originPath: tag.originId
                });
            })
        }
        return branch;
    } catch (err) {
        console.log(err);
    }
}


exports.copy_tags = async function() {
    try {
        var path = "/to/tag/";
        console.log(path);
        var $ = await commonController.copyHtml(branch.pcCopyUrl, path, branch.charset);
        var tagItems = $(".jigou li");
        for (var j = 0; j < tagItems.length; j++) {
            var item = tagItems[j];
            var originId = $(item).find("a").attr("href").split("/")[2];
            var name = $(item).find("a").text();
            // var count = parseInt($(item).find("span").text());
            var savedTag = await tagSequelize.findOneTag({
                branchId: branch.branchId,
                originId: originId,
                name: name
            })
            if (!savedTag) {
                await tagSequelize.create({
                    branchId: branch.branchId,
                    originId: originId,
                    name: name,
                    // pictureCount: count || 0,
                    orderIndex: j
                })
            }
        }
    } catch (err) {
        console.log(err);
    }
}

exports.copy_all_pictures = async function(tagId) {
    try {
        for (var j = 0; j < branch.tags.length; j++) {
            if (branch.isTest && j > 2) break;
            var tag = branch.tags[j];
            if (tagId && tag.tagId != tagId) continue;
            try {
                console.log(tag);
                await copy_category_pictures(tag);
            } catch (err) {
                console.log("获取分类totalPage失败", category, err);
            }
        }
    } catch (err) {
        console.log(err);
    }
}


async function copy_category_pictures(tag, startIndex, endIndex, isUpdate) {
    try {
        if (!tag || !tag.originId || !tag.originPath) return false;
        if (!startIndex) startIndex = 1;
        var index = startIndex;
        if (!endIndex) endIndex = 100;
        if (branch.isTest) endIndex = startIndex + 1;
        var stop = false;
        do {
            try {
                var path = "/to/";
                if (tag) path = path + tag.originPath + "/list_" + tag.originId + "_" + index + ".html";
                console.log(path);
                var $ = await commonController.copyHtml(branch.pcCopyUrl, path, branch.charset);
                if (tag.originPath != "xin" && index == 1 && !tag.remark) {
                    var tagRemark = $('meta[name="description"]').attr("content");
                    if (tagRemark) {
                        await tagSequelize.update({
                            remark: tagRemark
                        }, {
                            tagId: tag.tagId
                        })
                    }
                }
                var targetItems = $("ul.pic-sd-box").find("li");
                for (var i = 0; i < targetItems.length; i++) {
                    try {
                        var item = targetItems[i];
                        var bookHref = $(item).find("a").attr("href");
                        var tagId = bookHref.match(/\d+/g)[bookHref.match(/\d+/g).length - 2];
                        var originId = bookHref.match(/\d+/g)[bookHref.match(/\d+/g).length - 1];
                        var savedPicture = await pictureSequelize.findOne({
                            branchId: branch.branchId,
                            originId: originId
                        })
                        if (savedPicture && isUpdate) {
                            stop = true;
                            break;
                        }
                        if (!savedPicture) {
                            var picture = {
                                branchId: branch.branchId,
                                cover: $(item).find("img").attr("src"),
                                title: $(item).find("p").text(),
                                originId: originId
                            }
                            picture.imgHost = picture.cover.match(/http(s?):\/\/[^\/]+/g)[0];
                            picture.cover = picture.cover.replace(picture.imgHost, "");
                            savedPicture = await create_picture(originId, picture, tagId);
                        } else if (!savedPicture.count) {
                            savedPicture.set("count", savedPicture.pictureList.length);
                            await savedPicture.save();
                        }
                    } catch (err) {
                        console.log(index, i, originId);
                        console.log(err);
                    }
                }
                var pages = $(".pages a");
                pages = $(pages[pages.length - 1]).text().match(/\d+/g);
                if (parseInt(pages[0] == parseInt(pages[1]))) stop = true;
            } catch (err) {
                console.log(tag, index);
                console.log(err);
            }
            index++;
        } while (index <= endIndex && !stop);
    } catch (err) {
        console.log(err);
    }
}

exports.copy_category_pictures = copy_category_pictures;

async function create_picture(originId, picture, tagId) {
    try {
        picture.pictureList = [];
        var bookHref = "/to/" + tagId + "/" + originId + ".html";
        console.log(bookHref);
        var $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
        var pics = $(".content").find("img");
        _.forEach(pics, function(pic) {
            var picUrl = $(pic).attr("src");
            if (/^(https)/.test(picUrl)) picUrl = picUrl.replace(/https:\/\/[^\/]+/, "");
            else if (/^(http)/.test(picUrl)) picUrl = picUrl.replace(/http:\/\/[^\/]+/, "");
            picture.pictureList.push(picUrl);
        })
        var pages = $(".pages a");
        if (pages && pages.length > 1) {
            pages = parseInt($(pages[0]).text().match(/\d+/g)[0]);
            for (var i = 2; i <= pages; i++) {
                var bookHref = "/to/" + tagId + "/" + originId + "_" + i + ".html";
                console.log(bookHref);
                var $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
                var pics = $(".content").find("img");
                _.forEach(pics, function(pic) {
                    var picUrl = $(pic).attr("src");
                    if (/^(https)/.test(picUrl)) picUrl = picUrl.replace(/https:\/\/[^\/]+/, "");
                    else if (/^(http)/.test(picUrl)) picUrl = picUrl.replace(/http:\/\/[^\/]+/, "");
                    picture.pictureList.push(picUrl);
                })
            }
        }
        picture.count = picture.pictureList.length;
        var savedPicture = await pictureSequelize.create(picture);
        return savedPicture;
    } catch (err) {
        console.log(err);
        return false;
    }
}


function mapObjToHrefSearch(obj) {
    var str = [];
    for (var key in obj) {
        str.push([key, encodeURIComponent(obj[key])].join("="))
    }
    return str.join("&");
}