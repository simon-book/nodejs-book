var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var cheerio = require('cheerio');
var util = require('../../util/index.js');
var httpGateway = require('../../data/http/httpGateway.js')
var commonController = require('./commonController.js')
var branchSequelize = require('../../data/sequelize/branch/branchSequelize.js');
var tagSequelize = require('../../data/sequelize/picture/tagSequelize.js');
var modelSequelize = require('../../data/sequelize/picture/modelSequelize.js');
var pictureSequelize = require('../../data/sequelize/picture/pictureSequelize.js');

var branch = {
    copySrc: "invshen", //www.invshen.net/
    originPictureTagGroups: [
        ["国家", 0],
        ["风格", 1],
        ["身材", 2],
        ["服饰", 3],
        ["机构", 4],
        ["场景", 5],
        ["杂志", 6],
        ["其他", 7]
    ],
    originModelTagGroups: [
        ["职业", 0],
        ["地域", 1],
        ["身材", 2],
        ["风格", 3],
        ["长相", 4],
        ["团体", 5],
        ["其他", 6]
    ],
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
            branch.charset = savedBranch.copyParams.charset;
            branch.isTest = savedBranch.copyParams.isTest || false;
            branch.pictureTagGroups = [];
            branch.modelTagGroups = [];
            var TagGroups = await tagSequelize.findAllTagGroup({
                branchId: branch.branchId
            })
            _.forEach(pictureTagGroups, function(tagGroup) {
                var group = {
                    tagGroupId: tagGroup.tagGroupId,
                    name: tagGroup.name,
                    type: tagGroup.type
                }
                group.tags = _.map(tagGroup.tags, function(tag) {
                    return {
                        tagId: tag.tagId,
                        name: tag.name,
                        originId: tag.originId
                    }
                })
                if (group.type == "picture") branch.pictureTagGroups.push(group);
                else if (group.type == "model") branch.modelTagGroups.push(group);
            })
        }
    } catch (err) {
        console.log(err);
    }
}

exports.create_tag_groups = async function() {
    try {
        for (var i = 0; i < branch.originPictureTagGroups.length; i++) {
            var savedTagGroup = await tagSequelize.findOneTagGroup({
                branchId: branch.branchId,
                name: branch.originPictureTagGroups[i][0]
            })
            if (!savedTagGroup) {
                await tagSequelize.createTagGroup({
                    branchId: branch.branchId,
                    name: branch.originPictureTagGroups[i][0],
                    type: "picture",
                    orderIndex: i,
                    originId: i
                })
            }
        }
        await copy_tags("picture");
        for (var i = 0; i < branch.originModelTagGroups.length; i++) {
            var savedTagGroup = await tagSequelize.findOneTagGroup({
                branchId: branch.branchId,
                name: branch.originModelTagGroups[i][0]
            })
            if (!savedTagGroup) {
                await tagSequelize.createTagGroup({
                    branchId: branch.branchId,
                    name: branch.originModelTagGroups[i][0],
                    type: "model",
                    orderIndex: i,
                    originId: i
                })
            }
        }
        await copy_tags("model");
    } catch (err) {
        console.log(err);
    }
}

async function copy_tags(tagGroupType) {
    try {
        if (!tagGroupType) return false;
        if (tagGroupType == "picture") var path = "/gallery/";
        else if (tagGroupType == "model") var path = "/tag/";
        console.log(path);
        var $ = await commonController.copyHtml(branch.copyUrl, path, branch.charset);
        var tagGroupDivs = $(".tag_div");
        for (var i = 0; i < tagGroupDivs.length; i++) {
            try {
                var tagGroupDiv = tagGroupDivs[i];
                var tagItems = $(tagGroupDiv).find("a");
                var savedTagGroup = await tagSequelize.findOneTagGroup({
                    branchId: branch.branchId,
                    name: branch.pictureTagGroups[i][0]
                })
                if (!savedTagGroup) continue;
                for (var j = 0; j < tagItems.length; j++) {
                    var item = tagItems[j];
                    var originId = $(item).attr("href").split("/")[2];
                    var name = $(item).text();
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
                            orderIndex: j,
                            tagGroupId: savedTagGroup.tagGroupId
                        })
                    }
                }
            } catch (err) {
                console.log(err, i);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

exports.copy_all_pictures = async function(tagGroupId) {
    try {
        for (var i = 0; i < branch.pictureTagGroups.length; i++) {
            var tagGroup = branch.pictureTagGroups[i];
            if (tagGroupId && tagGroup.tagGroupId != tagGroupId) continue;
            var totalPage = 100;
            for (var j = 0; j < tagGroup.tags; j++) {
                var tag = tagGroup.tags[j];
                try {
                    console.log(tag);
                    await copy_category_pictures(tag, "gallery");
                } catch (err) {
                    console.log("获取分类totalPage失败", category, err);
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
}


async function copy_category_pictures(tag, startPath, startIndex, endIndex) {
    try {
        var index = startIndex || 1;
        if (!endIndex) endIndex = 10000;
        if (branch.isTest) endIndex = startIndex + 5;
        var stop = false;
        do {
            try {
                var path = "/" + startPath + "/" + tag.originId + "/";
                if (index > 1) path += index + ".html";
                console.log(path);
                var $ = await commonController.copyHtml(branch.pcCopyUrl, path, branch.charset);
                var targetItems = $("#listdiv").find("li.galleryli");
                for (var i = 0; i < targetItems.length; i++) {
                    try {
                        var item = targetItems[i];
                        var bookHref = $(item).find("a").attr("href");
                        var originId = bookHref.replace(/^\/|\/$/g, "");
                        var savedBook = await pictureSequelize.findOne({
                            branchId: branch.branchId,
                            originId: bookHref
                        })
                        if (!savedBook) {
                            var picture = {
                                branchId: branch.branchId,
                                cover: $(item).find("img").attr("src"),
                                title: $(item).find("a.caption").text(),
                                originId: originId
                            }
                            if (/^(https)/.test(picture.cover)) picture.cover = picture.cover.replace(/https:\/\/[^\/]+/, "");
                            else if (/^(http)/.test(picture.cover)) picture.cover = picture.cover.replace(/http:\/\/[^\/]+/, "");
                            var result = await create_picture(originId, picture, tag);
                        } else if (!savedBook.tags || _.findIndex(savedBook.tags, { tagId: tag.tagId }) == -1) {
                            await savedBook.addTags([tag.tagId]);
                        }
                        if (!result) throw new Error("save picture error.")
                    } catch (err) {
                        console.log(index, i, originId);
                        console.log(err);
                    }
                }
                var pages = $("#listdiv").find(".pagesYY a");
                if ($(pages[pages.length - 1]).hasClass("cur")) stop = true;
            } catch (err) {
                console.log(tag, startPath, index);
                console.log(err);
            }
            index++;
        } while (index <= endIndex && !stop);
    } catch (err) {
        console.log(err);
    }
}

async function create_picture(originId, picture, tag) {
    try {
        var bookHref = "/g/" + originId + "/";
        console.log(bookHref);
        var $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
        picture.count = parseInt($("#dinfo").text().match(/\d+/)[0]);
        picture.lastUpdatedAt = new Date($("#dinfo").text().match(/\d{4}\/\d{1,2}\/\d{1,2}/)[0]);
        picture.abstractContent = $("#ddesc").text();
        picture.pictureList = [];
        picture.pictureHdList = [];
        var pics = $("#hgallery").find("img");
        var picUrl = $(pics[0]).attr("src");
        if (/^(https)/.test(picUrl)) picUrl = picUrl.replace(/https:\/\/[^\/]+/, "");
        else if (/^(http)/.test(picUrl)) picUrl = picUrl.replace(/http:\/\/[^\/]+/, "");
        var picForamt = picUrl.match(/(\d+\.(jpg|jpeg|png))$/ig)[0].split(".")[1];
        var picPath = picUrl.replace(/(\d+\.(jpg|jpeg|png))$/ig, "");
        var picHdPath = picPath.replace("/s/", "/");
        for (var i = 0; i < picture.count; i++) {
            if (i == 0) {
                picture.pictureList.push(picPath + "0." + picForamt);
                picture.pictureHdList.push(picHdPath + "0." + picForamt);
            } else {
                picture.pictureList.push(picPath + util.prefixInteger(i, 3) + "." + picForamt);
                picture.pictureHdList.push(picHdPath + util.prefixInteger(i, 3) + "." + picForamt);
            }
        }
        var savedPicture = await pictureSequelize.create(picture);
        var utags = $("#utag").find("li a");
        var girlIds = [];
        var tagIds = [];
        for (var i = 0; i < utags.length; i++) {
            var utag = utags[i];
            var tagHref = $(utag).attr("href");
            var tagName = $(utag).text();
            var tagOriginId = tagHref.split("/")[2];
            if (tagHref.match(/\/girl\//g).length) {
                var savedModel = await modelSequelize.findOneModel({
                    branchId: branch.branchId,
                    originId: tagOriginId
                })
                if (!savedModel) {
                    savedModel = await modelSequelize.create({
                        branchId: branch.branchId,
                        originId: tagOriginId
                    })
                }
                if (savedModel) girlIds.push(savedModel.modelId);
            } else {
                var savedTag = await tagSequelize.findOneTag({
                    branchId: branch.branchId,
                    originId: tagOriginId,
                    name: tagName
                })
                if (!savedTag) {
                    var otherGroup = _.find(branch.pictureTagGroups, { name: "其他" });
                    savedTag = await tagSequelize.create({
                        branchId: branch.branchId,
                        originId: tagOriginId,
                        name: tagName,
                        tagGroupId: otherGroup ? otherGroup.tagGroupId : null
                    })
                }
                if (savedTag) tagIds.push(savedTag.tagId);
            }
        }
        if (girlIds.length) await savedPicture.addModels(girlIds);
        if (tagIds.length) {
            if (tag && _.indexOf(tagIds, tag.tagId) == -1) tagIds.push(tag.tagId);
            await savedPicture.addTags(tagIds);
        }
        return savedPicture;
    } catch (err) {
        console.log(err);
        return false;
    }
}

exports.copy_all_models = async function(tagGroupId) {
    try {
        for (var i = 0; i < branch.modelTagGroups.length; i++) {
            var tagGroup = branch.modelTagGroups[i];
            if (tagGroupId && tagGroup.tagGroupId != tagGroupId) continue;
            var totalPage = 100;
            for (var j = 0; j < tagGroup.tags; j++) {
                var tag = tagGroup.tags[j];
                try {
                    console.log(tag);
                    await copy_category_models(tag, "tag");
                } catch (err) {
                    console.log("获取分类totalPage失败", category, err);
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
}

async function copy_category_models(tag, startPath, startIndex, endIndex) {
    try {
        var index = startIndex || 1;
        if (!endIndex) endIndex = 10000;
        if (branch.isTest) endIndex = startIndex + 5;
        var stop = false;
        do {
            try {
                var path = "/" + startPath + "/" + tag.originId + "/";
                if (index > 1) path += index + ".html";
                console.log(path);
                var $ = await commonController.copyHtml(branch.pcCopyUrl, path, branch.charset);
                var targetItems = $("#listdiv").find("li.beautyli");
                for (var i = 0; i < targetItems.length; i++) {
                    try {
                        var item = targetItems[i];
                        var modelHref = $($(item).find("a")[1]).attr("href");
                        if (modelHref.match(/\/girl\//g).length) {
                            var originId = modelHref.split("/")[2];
                            var savedModel = await modelSequelize.findOneModel({
                                branchId: branch.branchId,
                                originId: originId
                            })
                            if (!savedModel) {
                                savedModel = await modelSequelize.create({
                                    branchId: branch.branchId,
                                    originId: originId
                                })
                            }
                        }
                    } catch (err) {
                        console.log(index, i, originId);
                        console.log(err);
                    }
                }
                var pages = $("#listdiv").find(".pagesYY a");
                if ($(pages[pages.length - 1]).hasClass("cur")) stop = true;
            } catch (err) {
                console.log(tag, startPath, index);
                console.log(err);
            }
            index++;
        } while (index <= endIndex && !stop);
    } catch (err) {
        console.log(err);
    }
}

exports.complete_all_model_info = async function() {
    try {
        var models = await modelSequelize.findAll({
            branchId: branch.branchId,
            statusId: 1
        })
        for (var i = 0; i < models.length; i++) {
            var model = models[i];
            await complete_one_model_info(model)
        }
    } catch (err) {
        console.log(err);
    }
}

async function complete_one_model_info(model) {
    try {
        var bookHref = "/girl/" + model.originId + "/";
        console.log(bookHref);
        var $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
        var cover = $(".infoleft_imgdiv a").attr("href");
        if (/^(https)/.test(cover)) cover = cover.replace(/https:\/\/[^\/]+/, "");
        else if (/^(http)/.test(cover)) cover = cover.replace(/http:\/\/[^\/]+/, "");
        var otherInfo = {
            cover: cover,
            nickname: $(".div_h1").find("h1").text().replace(/\s+/g, "").replace("(", ",").replace(")", ""),
            remark: $(".infocontent p").text()
        };
        var targetItems = $(".infodiv tr");
        _.forEach(targetItems, function(item) {
            var itemValue = $($(".infodiv tr")[0]).text().replace(/\s+/g, "").split("：");
            otherInfo[itemValue[0]] = itemValue[1];
        })
        if (otherInfo["年龄"]) otherInfo["属相"] = otherInfo["年龄"].slice(-2).slice(0, 1);
        if (otherInfo["属相"]) model.set("zodiac", otherInfo["属相"]);
        if (otherInfo["生日"]) model.set("birthday", otherInfo["生日"]);
        if (otherInfo["星座"]) model.set("constellation", otherInfo["星座"]);
        if (otherInfo["身高"]) model.set("height", otherInfo["身高"]);
        if (otherInfo["体重"]) model.set("weight", otherInfo["体重"]);
        if (otherInfo["三围"]) model.set("figure", otherInfo["三围"]);
        if (otherInfo["出生"]) model.set("birthIn", otherInfo["出生"]);
        if (otherInfo["职业"]) model.set("job", otherInfo["职业"]);
        if (otherInfo["兴趣"]) model.set("interests", otherInfo["兴趣"]);
        if (otherInfo.cover) model.set("cover", otherInfo.cover);
        if (otherInfo.nickname) model.set("nickname", otherInfo.nickname);
        if (otherInfo.remark) model.set("remark", otherInfo.remark);
        await model.save();
        if ($(".archive_more").length) await copy_model_pictures(null, model.originId);
        else {
            var targetItems = $(".photo_ul").find("li.igalleryli");
            for (var i = 0; i < targetItems.length; i++) {
                try {
                    var item = targetItems[i];
                    var bookHref = $(item).find("a").attr("href");
                    var originId = bookHref.replace(/^\/|\/$/g, "");
                    var savedBook = await pictureSequelize.findOne({
                        branchId: branch.branchId,
                        originId: bookHref
                    })
                    if (savedBook) continue;
                    else {
                        var picture = {
                            branchId: branch.branchId,
                            cover: $(item).find("img").attr("src"),
                            title: $(item).find("a.caption").text(),
                            originId: originId
                        }
                        if (/^(https)/.test(picture.cover)) picture.cover = picture.cover.replace(/https:\/\/[^\/]+/, "");
                        else if (/^(http)/.test(picture.cover)) picture.cover = picture.cover.replace(/http:\/\/[^\/]+/, "");
                        var result = await create_picture(originId, picture);
                    }
                    if (!result) throw new Error("save picture error.")
                } catch (err) {
                    console.log(err);
                }
            }
        }
        if ($("li.favli").length) {
            var targetItems = $("li.favli");
            for (var i = 0; i < targetItems.length; i++) {
                try {
                    var item = targetItems[i];
                    var modelHref = $($(item).find("a")[1]).attr("href");
                    if (modelHref.match(/\/girl\//g).length) {
                        var originId = modelHref.split("/")[2];
                        var savedModel = await modelSequelize.findOneModel({
                            branchId: branch.branchId,
                            originId: originId
                        })
                        if (!savedModel) {
                            savedModel = await modelSequelize.create({
                                branchId: branch.branchId,
                                originId: originId
                            })
                        }
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        }
    } catch (err) {
        console.log(i, err);
    }
}

async function copy_model_pictures(modelId, originId) {
    try {
        if (!originId && modelId) {
            var savedModel = await modelSequelize.findOneModel({
                modelId: modelId
            })
            if (savedModel) originId = savedModel.originId;
        }
        if (!originId) return false;

        var index = 1;
        var endIndex = 10000;
        var stop = false;
        do {
            try {
                var path = "/girl/" + originId + "/album/";
                if (index > 1) path += index + ".html";
                console.log(path);
                var $ = await commonController.copyHtml(branch.pcCopyUrl, path, branch.charset);
                var targetItems = $("#photo_list").find("li.galleryli");
                for (var i = 0; i < targetItems.length; i++) {
                    try {
                        var item = targetItems[i];
                        var bookHref = $(item).find("a").attr("href");
                        var originId = bookHref.replace(/^\/|\/$/g, "");
                        var savedBook = await bookSequelize.findOne({
                            branchId: branch.branchId,
                            originId: bookHref
                        })
                        if (!savedBook) {
                            var picture = {
                                branchId: branch.branchId,
                                cover: $(item).find("img").attr("src"),
                                title: $(item).find("a.caption").text(),
                                originId: originId
                            }
                            if (/^(https)/.test(picture.cover)) picture.cover = picture.cover.replace(/https:\/\/[^\/]+/, "");
                            else if (/^(http)/.test(picture.cover)) picture.cover = picture.cover.replace(/http:\/\/[^\/]+/, "");
                            var result = await create_picture(originId, picture);
                        }
                        if (!result) throw new Error("save picture error.")
                    } catch (err) {
                        console.log(index, i, originId);
                        console.log(err);
                    }
                }
                var pages = $("#post_entry").find(".pagesYY a");
                if ($(pages[pages.length - 1]).hasClass("cur")) stop = true;
            } catch (err) {
                console.log(originId, index);
                console.log(err);
            }
            index++;
        } while (index <= endIndex && !stop);
    } catch (err) {
        console.log(err);
    }
}

exports.copy_all_models = async function() {
    try {

    } catch {

    }
}