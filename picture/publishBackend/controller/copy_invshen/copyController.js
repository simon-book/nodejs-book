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
var articleSequelize = require('../../data/sequelize/picture/articleSequelize.js');
var rankSequelize = require('../../data/sequelize/rank/rankSequelize.js');

var branch = {
    copySrc: "fnvshen", //www.fnvshen.com/
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
            branch.copyPictureUrl = savedBranch.copyParams.copyPictureUrl;
            branch.pictureUrl = savedBranch.copyParams.pictureUrl;
            branch.charset = savedBranch.copyParams.charset;
            branch.isTest = savedBranch.copyParams.isTest || false;
            branch.copyPictureToOss = savedBranch.copyParams.copyPictureToOss || false;
            branch.copyPictureFromRemoteOss = savedBranch.copyParams.copyPictureFromRemoteOss || false;
            branch.submitUrlToGoogle = savedBranch.copyParams.submitUrlToGoogle || false;
            branch.submitUrlToBaidu = savedBranch.copyParams.submitUrlToBaidu || false;
            branch.pictureTagGroups = [];
            branch.modelTagGroups = [];
            branch.pictureTags = [];
            branch.modelTags = [];
            var TagGroups = await tagSequelize.findAllTagGroup({
                branchId: branch.branchId
            })
            _.forEach(TagGroups, function(tagGroup) {
                var group = {
                    tagGroupId: tagGroup.tagGroupId,
                    name: tagGroup.name,
                    type: tagGroup.type
                }
                group.tags = _.map(tagGroup.tags, function(tag) {
                    return {
                        tagId: tag.tagId,
                        name: tag.name,
                        remark: tag.remark,
                        originId: tag.originId
                    }
                })
                group.tags = _.sortBy(group.tags, "tagId");
                if (group.type == "picture") {
                    branch.pictureTagGroups.push(group);
                    branch.pictureTags = _.concat(branch.pictureTags, group.tags);
                } else if (group.type == "model") {
                    branch.modelTagGroups.push(group);
                    branch.modelTags = _.concat(branch.modelTags, group.tags);
                }
            })
        }
        return branch;
    } catch (err) {
        console.log(err);
    }
}

exports.create_tag_groups = async function() {
    try {
        for (var i = 0; i < branch.originPictureTagGroups.length; i++) {
            var savedTagGroup = await tagSequelize.findOneTagGroup({
                branchId: branch.branchId,
                type: "picture",
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
        await copy_tags("picture", branch.originPictureTagGroups);
        for (var i = 0; i < branch.originModelTagGroups.length; i++) {
            var savedTagGroup = await tagSequelize.findOneTagGroup({
                branchId: branch.branchId,
                type: "model",
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
        await copy_tags("model", branch.originModelTagGroups);
    } catch (err) {
        console.log(err);
    }
}

async function copy_tags(tagGroupType, tagGroups) {
    try {
        if (!tagGroupType) return false;
        if (tagGroupType == "picture") var path = "/gallery/";
        else if (tagGroupType == "model") var path = "/tag/";
        console.log(path);
        var $ = await commonController.copyHtml(branch.pcCopyUrl, path, branch.charset);
        var tagGroupDivs = $(".tag_div");
        for (var i = 0; i < tagGroupDivs.length; i++) {
            try {
                var tagGroupDiv = tagGroupDivs[i];
                var tagItems = $(tagGroupDiv).find("a");
                var savedTagGroup = await tagSequelize.findOneTagGroup({
                    branchId: branch.branchId,
                    type: tagGroupType,
                    name: tagGroups[i][0]
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

exports.copy_all_pictures = async function(tagGroupId, tagId) {
    try {
        for (var i = 0; i < branch.pictureTagGroups.length; i++) {
            var tagGroup = branch.pictureTagGroups[i];
            if (tagGroupId && tagGroup.tagGroupId != tagGroupId) continue;
            for (var j = 0; j < tagGroup.tags.length; j++) {
                if (branch.isTest && j > 2) break;
                var tag = tagGroup.tags[j];
                if (tagId && tag.tagId != tagId) continue;
                try {
                    console.log(tag);
                    await copy_category_pictures(tag);
                } catch (err) {
                    console.log("获取分类totalPage失败", category, err);
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
}


async function copy_category_pictures(tag, startIndex, endIndex, isUpdate) {
    try {
        if (!startIndex) startIndex = 1;
        var index = startIndex;
        if (!endIndex) endIndex = 100;
        if (branch.isTest) endIndex = startIndex + 2;
        var stop = false;
        do {
            try {
                var path = "/gallery/";
                if (tag) path = path + tag.originId + "/";
                if (index > 1) path += index + ".html";
                console.log(path);
                var $ = await commonController.copyHtml(branch.pcCopyUrl, path, branch.charset);
                if (tag && index == 1 && !tag.remark) {
                    var tagRemark = $("#ddesc").text();
                    if (tagRemark) {
                        await tagSequelize.update({
                            remark: tagRemark
                        }, {
                            tagId: tag.tagId
                        })
                    }
                }
                var targetItems = $("#listdiv").find("li.galleryli");
                for (var i = 0; i < targetItems.length; i++) {
                    try {
                        var item = targetItems[i];
                        var bookHref = $(item).find("a").attr("href");
                        var originId = bookHref.match(/\d+/g)[0];
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
                                cover: $(item).find("img").attr("data-original"),
                                title: $(item).find("a.caption").text(),
                                originId: originId,
                                orderIndex: parseInt(originId)
                            }
                            picture.imgHost = picture.cover.match(/http(s?):\/\/[^\/]+/g)[0];
                            picture.cover = picture.cover.replace(picture.imgHost, "");
                            // if (/^(https)/.test(picture.cover)) picture.cover = picture.cover.replace(/https:\/\/[^\/]+/, "");
                            // else if (/^(http)/.test(picture.cover)) picture.cover = picture.cover.replace(/http:\/\/[^\/]+/, "");
                            savedPicture = await create_picture(originId, picture, tag);
                        }
                        if (tag && savedPicture && (!savedPicture.tags || _.findIndex(savedPicture.tags, {
                                tagId: tag.tagId
                            }) == -1)) {
                            await savedPicture.addTags([tag.tagId], {
                                through: {
                                    pictureLastUpdatedAt: savedPicture.lastUpdatedAt,
                                    orderIndex: parseInt(savedPicture.originId)
                                    // originId: savedPicture.originId
                                }
                            });
                        }
                    } catch (err) {
                        console.log(index, i, originId);
                        console.log(err);
                    }
                }
                var pages = $("#listdiv").find(".pagesYY a");
                if ($(pages[pages.length - 1]).hasClass("cur")) stop = true;
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

async function create_picture(originId, picture, tag) {
    try {
        var bookHref = "/g/" + originId + "/";
        console.log(bookHref);
        var $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
        if (!picture) picture = {
            branchId: branch.branchId,
            // cover: $(item).find("img").attr("data-original"),
            title: $("#htilte").text(),
            originId: originId,
            orderIndex: parseInt(originId)
        };
        picture.count = parseInt($("#dinfo").text().match(/\d+/)[0]);
        picture.lastUpdatedAt = new Date($("#dinfo").text().match(/\d{4}\/\d{1,2}\/\d{1,2}/)[0]);
        picture.abstractContent = $("#ddesc").text();
        picture.pictureList = [];
        picture.pictureHdList = [];
        var pics = $("#hgallery").find("img");
        var picUrl = $(pics[0]).attr("src");
        if (!picture.imgHost) picture.imgHost = picUrl.match(/http(s?):\/\/[^\/]+/g)[0];
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
        var savedPicture = await pictureSequelize.findOne({
            branchId: branch.branchId,
            originId: originId
        })
        if (!savedPicture) {
            savedPicture = await pictureSequelize.create(picture);
        } else {
            savedPicture = await pictureSequelize.update(picture, {
                pictureId: savedPicture.pictureId
            }, true);
        }
        if (!savedPicture) {
            savedPicture = await pictureSequelize.findOne({
                branchId: branch.branchId,
                originId: originId
            })
        }

        var utags = $("#utag").find("li a");
        var girlIds = [];
        var tagIds = [];
        for (var i = 0; i < utags.length; i++) {
            var utag = utags[i];
            var tagHref = $(utag).attr("href");
            var tagName = $(utag).text();
            var tagOriginId = tagHref.split("/")[2];
            if (tagHref.match(/\/girl\//g) && tagHref.match(/\/girl\//g).length) {
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
                if (!picture.cover) {
                    savedPicture.set("cover", "/gallery/" + tagOriginId + "/" + originId + "/cover/0.jpg");
                    await savedPicture.save();
                }
            } else {
                var savedTag = await tagSequelize.findOneTag({
                    branchId: branch.branchId,
                    originId: tagOriginId,
                    name: tagName
                })
                if (!savedTag) {
                    var otherGroup = _.find(branch.pictureTagGroups, {
                        name: "其他"
                    });
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
        if (girlIds.length) await savedPicture.addModels(_.uniq(girlIds));
        if (tagIds.length) {
            if (tag && _.indexOf(tagIds, tag.tagId) == -1) tagIds.push(tag.tagId);
            await savedPicture.addTags(_.uniq(tagIds), {
                through: {
                    pictureLastUpdatedAt: savedPicture.lastUpdatedAt,
                    orderIndex: parseInt(savedPicture.originId)
                }
            });
        }
        return savedPicture;
    } catch (err) {
        console.log(err);
        var savedPicture = await pictureSequelize.findOne({
            branchId: branch.branchId,
            originId: originId
        })
        if (!savedPicture && picture) {
            var savedPicture = await pictureSequelize.create(picture);
        }
        return false;
    }
}

exports.create_picture = create_picture;

exports.copy_all_tag_models = async function(tagGroupId) {
    try {
        for (var i = 0; i < branch.modelTagGroups.length; i++) {
            var tagGroup = branch.modelTagGroups[i];
            if (tagGroupId && tagGroup.tagGroupId != tagGroupId) continue;
            for (var j = 0; j < tagGroup.tags.length; j++) {
                if (branch.isTest && j > 2) break;
                var tag = tagGroup.tags[j];
                try {
                    console.log(tag);
                    await copy_category_models(tag);
                } catch (err) {
                    console.log("获取分类totalPage失败", category, err);
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
}

async function copy_category_models(tag, startIndex, endIndex, isUpdate) {
    try {
        if (!startIndex) startIndex = 1;
        var index = 1;
        if (!endIndex) endIndex = 10000;
        if (branch.isTest) endIndex = startIndex + 2;
        var stop = false;
        do {
            try {
                var path = "/tag/";
                if (tag) path = path + tag.originId + "/";
                if (index > 1) path += index + ".html";
                console.log(path);
                var $ = await commonController.copyHtml(branch.pcCopyUrl, path, branch.charset);
                if (tag && index == 1 && !tag.remark) {
                    var tagRemark = $("#ddesc").text();
                    if (tagRemark) {
                        await tagSequelize.update({
                            remark: tagRemark
                        }, {
                            tagId: tag.tagId
                        })
                    }
                }
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
                            if (savedModel && isUpdate) {
                                stop = true;
                                break;
                            }
                            if (!savedModel) {
                                savedModel = await modelSequelize.create({
                                    branchId: branch.branchId,
                                    originId: originId
                                })
                            }
                            if (tag && savedModel && (!savedModel.tags || _.findIndex(savedModel.tags, {
                                    tagId: tag.tagId
                                }) == -1)) {
                                await savedModel.addTags([tag.tagId], {
                                    through: {
                                        modelOriginId: savedModel.originId
                                    }
                                });
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
                console.log(tag, index);
                console.log(err);
            }
            index++;
        } while (index <= endIndex && !stop);
    } catch (err) {
        console.log(err);
    }
}

exports.copy_one_model = async function(originId) {
    try {
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
        await complete_one_model_info(savedModel);
    } catch (err) {
        console.log(err);
    }
}

exports.copy_category_models = copy_category_models;

exports.complete_all_model_info = async function() {
    try {
        var models = await modelSequelize.findAll({
            branchId: branch.branchId,
            statusId: 1
        })
        for (var i = 0; i < models.length; i++) {
            // if (branch.isTest && i > 10) break;
            var model = models[i];
            await complete_one_model_info(model)
        }
    } catch (err) {
        console.log(err);
    }
}

exports.complete_all_model_othername = async function() {
    try {
        var models = await modelSequelize.findAllWithoutTags({
            branchId: branch.branchId,
            statusId: 2
        }, ["modelId", "originId", "othername"]);
        for (var i = 0; i < models.length; i++) {
            if (branch.isTest && i > 10) break;
            var model = models[i];
            var bookHref = "/girl/" + model.originId + "/";
            console.log(bookHref);
            var $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
            var othername = $(".div_h1").find("h1").text().replace(/\s+/g, "").replace(")", "").split("(")[1];
            if (othername) {
                console.log(othername);
                model.set("othername", othername);
                await model.save();
            }
        }
    } catch (err) {
        console.log(err);
    }
}

async function complete_one_model_info(model, $) {
    try {
        var bookHref = "/girl/" + model.originId + "/";
        console.log(bookHref);
        if (!$) $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
        var cover = $(".infoleft_imgdiv a").attr("href");
        if (/^(https)/.test(cover)) cover = cover.replace(/https:\/\/[^\/]+/, "");
        else if (/^(http)/.test(cover)) cover = cover.replace(/http:\/\/[^\/]+/, "");
        var otherInfo = {
            cover: cover,
            name: $(".div_h1").find("h1").text().replace(/\s+/g, "").replace(")", "").split("(")[0],
            othername: $(".div_h1").find("h1").text().replace(/\s+/g, "").replace(")", "").split("(")[1],
            remark: $(".infocontent p").text()
        };
        var targetItems = $(".infodiv tr");
        _.forEach(targetItems, function(item) {
            var itemValue = $(item).text().replace(/\s+/g, "").split("：");
            otherInfo[itemValue[0]] = itemValue[1];
        })
        if (otherInfo["别名"]) model.set("nickname", otherInfo["别名"]);
        if (otherInfo["年龄"]) otherInfo["属相"] = otherInfo["年龄"].slice(-2).slice(0, 1);
        if (otherInfo["属相"]) model.set("zodiac", otherInfo["属相"]);
        if (otherInfo["生日"]) {
            var birthday = moment(otherInfo["生日"]);
            model.set("birthyear", birthday.year());
            model.set("birthday", otherInfo["生日"]);
        }
        if (otherInfo["星座"]) model.set("constellation", otherInfo["星座"]);
        if (otherInfo["血型"]) model.set("bloodType", otherInfo["血型"]);
        if (otherInfo["身高"]) model.set("height", parseInt(otherInfo["身高"]));
        if (otherInfo["体重"]) model.set("weight", parseInt(otherInfo["体重"]));
        if (otherInfo["三围"]) {
            var lines = otherInfo["三围"].match(/\d+/g);
            model.set("bustline", lines[0]);
            model.set("waistline", lines[1]);
            model.set("hipline", lines[2]);
            if (otherInfo["三围"].match(/\(\w+\)/)) {
                model.set("cup", otherInfo["三围"].match(/\(\w+\)/)[0].match(/\w/)[0]);
            }
        }
        if (otherInfo["出生"]) model.set("birthIn", otherInfo["出生"]);
        if (otherInfo["职业"]) model.set("job", otherInfo["职业"]);
        if (otherInfo["兴趣"]) model.set("interests", otherInfo["兴趣"]);
        if (otherInfo.cover) model.set("cover", otherInfo.cover);
        if (otherInfo.name) model.set("name", otherInfo.name);
        if (otherInfo.othername) model.set("othername", otherInfo.othername);
        if (otherInfo.remark) model.set("remark", otherInfo.remark);
        // if ($(".archive_more").length) await copy_model_pictures(null, model.originId);
        // else {
        var targetItems = $(".photo_ul").find("li.igalleryli");
        for (var i = 0; i < targetItems.length; i++) {
            try {
                var item = targetItems[i];
                var bookHref = $(item).find("a").attr("href");
                var originId = bookHref.match(/\d+/g)[0];
                var savedPicture = await pictureSequelize.findOne({
                    branchId: branch.branchId,
                    originId: originId
                })
                if (!savedPicture) {
                    var picture = {
                        branchId: branch.branchId,
                        cover: $(item).find("img").attr("data-original"),
                        title: $(item).find("a.caption").text(),
                        originId: originId,
                        orderIndex: parseInt(originId)
                    }
                    picture.imgHost = picture.cover.match(/http(s?):\/\/[^\/]+/g)[0];
                    picture.cover = picture.cover.replace(picture.imgHost, "");
                    // if (/^(https)/.test(picture.cover)) picture.cover = picture.cover.replace(/https:\/\/[^\/]+/, "");
                    // else if (/^(http)/.test(picture.cover)) picture.cover = picture.cover.replace(/http:\/\/[^\/]+/, "");
                    var savedPicture = await create_picture(originId, picture);
                }
                if (savedPicture && (!savedPicture.models || _.findIndex(savedPicture.models, {
                        modelId: model.modelId
                    }) == -1)) {
                    await savedPicture.addModels([model.modelId]);
                }
            } catch (err) {
                console.log(err);
            }
        }
        if ($("li.favli").length) {
            var relatedModelIds = [];
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
                        if (savedModel) relatedModelIds.push(savedModel.modelId);
                    }
                } catch (err) {
                    console.log(err);
                }
            }
            if (relatedModelIds.length) model.set("relatedModelIds", relatedModelIds);
        }
        model.set("statusId", 2);
        await model.save();
    } catch (err) {
        console.log(err);
        await model.destroy();
    }
}

exports.complete_one_model_info = complete_one_model_info;

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
                var targetItems = $("#photo_list").find("li.igalleryli");
                for (var i = 0; i < targetItems.length; i++) {
                    try {
                        var item = targetItems[i];
                        var bookHref = $(item).find("a").attr("href");
                        var originId = bookHref.match(/\d+/g)[0];
                        var savedBook = await pictureSequelize.findOne({
                            branchId: branch.branchId,
                            originId: originId
                        })
                        if (!savedBook) {
                            var picture = {
                                branchId: branch.branchId,
                                cover: $(item).find("img").attr("src"),
                                title: $(item).find("a.caption").text(),
                                originId: originId,
                                orderIndex: parseInt(originId)
                            }
                            picture.imgHost = picture.cover.match(/http(s?):\/\/[^\/]+/g)[0];
                            picture.cover = picture.cover.replace(picture.imgHost, "");
                            // if (/^(https)/.test(picture.cover)) picture.cover = picture.cover.replace(/https:\/\/[^\/]+/, "");
                            // else if (/^(http)/.test(picture.cover)) picture.cover = picture.cover.replace(/http:\/\/[^\/]+/, "");
                            var result = await create_picture(originId, picture);
                        }
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

exports.copy_articles = async function(isUpdate) {
    try {
        var index = 1;
        var endIndex = 10000;
        if (branch.isTest) endIndex = 3
        var stop = false;
        do {
            try {
                var path = "/article/";
                if (index > 1) path += index + ".html";
                console.log(path);
                var $ = await commonController.copyHtml(branch.pcCopyUrl, path, branch.charset);
                var targetItems = $("li.other_girlli");
                for (var i = 0; i < targetItems.length; i++) {
                    try {
                        var item = targetItems[i];
                        var bookHref = $(item).find("a").attr("href");
                        var originId = bookHref.match(/\d+/g)[0];
                        var savedBook = await articleSequelize.findOne({
                            branchId: branch.branchId,
                            originId: originId
                        })
                        if (savedBook && isUpdate) {
                            stop = true;
                            break;
                        }
                        if (!savedBook) {
                            savedBook = await create_article(originId);
                        }
                    } catch (err) {
                        console.log(index, i, originId);
                        console.log(err);
                    }
                }
                var pages = $(".post_entry").find(".pagesYY a");
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

async function create_article(originId) {
    try {
        var bookHref = "/article/" + originId + "/";
        console.log(bookHref);
        var $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
        var article = {
            branchId: branch.branchId,
            cover: "/article/" + originId + "/01.jpg",
            title: $(".article_title_div h1").text(),
            keywords: $('meta[name="keywords"]').attr("content"),
            description: $('meta[name="description"]').attr("content"),
            lastUpdatedAt: new Date($(".article_updatetime_div").text()),
            originId: originId,
            content: []
        }
        var relatedModels = [];
        var relatedModelIds = [];
        if ($("li.girlli").length) {
            var targetItems = $("li.girlli");
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
                        if (savedModel) {
                            relatedModels.push(savedModel);
                            relatedModelIds.push(savedModel.modelId);
                        }
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        }
        if (relatedModelIds.length) article.relatedModelIds = relatedModelIds;
        var girlEles = $("#articleDiv").find("a");
        _.forEach(girlEles, function(girlEle) {
            var href = $(girlEle).attr("href");
            if (href.match(/\/girl\//g) && href.match(/\/girl\//g).length) {
                var originId = href.split("/girl/")[1].replace("/", "");
                var model = _.find(relatedModels, {
                    originId: originId
                });
                if (model) {
                    $(girlEle).attr("href", "/model/" + model.modelId);
                }
            } else if (href.match(/\/gallery\//g) && href.match(/\/gallery\//g).length) {
                var originId = href.split("/gallery/")[1].replace("/", "");
                var pictureTag = _.find(branch.pictureTags, {
                    originId: originId
                });
                if (pictureTag) {
                    $(girlEle).attr("href", "/galleryList/" + pictureTag.tagId);
                }
            } else if (href.match(/\/tag\//g) && href.match(/\/tag\//g).length) {
                var originId = href.split("/tag/")[1].replace("/", "");
                var modelTag = _.find(branch.modelTags, { originId: originId });
                if (modelTag) {
                    $(girlEle).attr("href", "/modelList/" + modelTag.tagId);
                }
            }
        })
        var content = $("#articleDiv").html();
        content = content.replace(/https:\/\/img\.xiublog\.com:85/g, "****pictureUrl***");
        article.content.push(content);
        var pages = $("#articlePage").find(".pagesYY a");
        for (var i = 1; i < pages.length; i++) {
            bookHref = "/article/" + article.originId + "/" + (i + 1) + ".html";
            var $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
            var girlEles = $("#articleDiv").find("a");
            _.forEach(girlEles, function(girlEle) {
                var href = $(girlEle).attr("href");
                if (href.match(/\/girl\//g) && href.match(/\/girl\//g).length) {
                    var originId = href.split("/girl/")[1].replace("/", "");
                    var model = _.find(relatedModels, {
                        originId: originId
                    });
                    if (model) {
                        $(girlEle).attr("href", "/model/" + model.modelId);
                    }
                } else if (href.match(/\/gallery\//g) && href.match(/\/gallery\//g).length) {
                    var originId = href.split("/gallery/")[1].replace("/", "");
                    var pictureTag = _.find(branch.pictureTags, {
                        originId: originId
                    });
                    if (pictureTag) {
                        $(girlEle).attr("href", "/galleryList/" + pictureTag.tagId);
                    }
                } else if (href.match(/\/tag\//g) && href.match(/\/tag\//g).length) {
                    var originId = href.split("/tag/")[1].replace("/", "");
                    var modelTag = _.find(branch.modelTags, { originId: originId });
                    if (modelTag) {
                        $(girlEle).attr("href", "/modelList/" + modelTag.tagId);
                    }
                }
            })
            var content = $("#articleDiv").html();
            content = content.replace(/https:\/\/img\.xiublog\.com:85/g, "****pictureUrl***");
            article.content.push(content);
        }
        var savedArticle = await articleSequelize.create(article);
        if (relatedModelIds.length) savedArticle.addModels(relatedModelIds);
        return savedArticle;
    } catch (err) {
        console.log(err);
        return false;
    }
}

exports.create_article = create_article;


exports.copy_all_model_ranks = async function(originId) {
    try {
        var path = "/rank/sum/";
        console.log(path);
        var $ = await commonController.copyHtml(branch.pcCopyUrl, path, branch.charset);
        var targetItems = $("#sidebar").find("li.other_girlli");
        for (var i = 0; i < targetItems.length; i++) {
            try {
                var item = targetItems[i];
                var rankHref = $(item).find("a").attr("href");
                var rankName = $(item).find("a").text();
                var originId = rankHref.split("/")[2];
                var savedRank = await rankSequelize.findOne({
                    branchId: branch.branchId,
                    originId: originId
                })
                if (!savedRank) {
                    savedRank = await rankSequelize.create({
                        branchId: branch.branchId,
                        originId: originId,
                        name: rankName,
                        orderIndex: i
                    })
                }
            } catch (err) {
                console.log(index, i, originId);
                console.log(err);
            }
        }
        var savedRank = await rankSequelize.findOne({
            branchId: branch.branchId,
            originId: "homepage"
        })
        if (!savedRank) {
            savedRank = await rankSequelize.create({
                branchId: branch.branchId,
                originId: "homepage",
                name: "首页"
            })
        }
    } catch (err) {
        console.log(err);
    }
}

async function copy_rank_models(originId) {
    try {
        var ranks = await rankSequelize.findAll({
            branchId: branch.branchId
        })
        if (originId) ranks = _.filter(ranks, {
            originId: originId
        });
        for (var i = 0; i < ranks.length; i++) {
            try {
                // if (branch.isTest && i > 2) break;
                var savedRank = ranks[i];
                if (savedRank.originId == "homepage") continue;
                var rankModelIds = [];
                var index = 1;
                var stop = false;
                do {
                    try {
                        var path = "/rank/" + savedRank.originId + "/";
                        if (index > 1) path += index + ".html";
                        console.log(path);
                        var $ = await commonController.copyHtml(branch.pcCopyUrl, path, branch.charset);
                        var targetItems = $("div.rankli_imgdiv");
                        for (var j = 0; j < targetItems.length; j++) {
                            try {
                                var item = targetItems[j];
                                var modelHref = $(item).find("a").attr("href");
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
                                if (savedModel) rankModelIds.push(savedModel.modelId);
                            } catch (err) {
                                console.log(err);
                            }
                        }
                        var pages = $(".pagesYY a");
                        if ($(pages[pages.length - 1]).hasClass("cur")) stop = true;
                    } catch (err) {
                        console.log(err);
                        stop = true;
                    }
                    index++;
                } while (!stop);
                if (rankModelIds.length) {
                    savedRank.set("rankModelIds", rankModelIds);
                    await savedRank.save();
                }
            } catch (err) {
                console.log(err);
            }
        }
        var path = "/";
        console.log(path);
        var $ = await commonController.copyHtml(branch.pcCopyUrl, path, branch.charset);
        var targetItems = $("#tabs .tab-inside").find("li");
        var rankModelIds = [];
        for (var i = 0; i < targetItems.length; i++) {
            try {
                var item = targetItems[i];
                var href = $(item).find("a").attr("href");
                // var rankName = $(item).find("a").text();
                var originId = href.split("/")[2];
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
                if (savedModel) {
                    rankModelIds.push(savedModel.modelId);
                }
            } catch (err) {
                console.log(err);
            }
        }
        if (rankModelIds.length) {
            var savedRank = _.find(ranks, { originId: "homepage" });
            if (savedRank) {
                savedRank.set("rankModelIds", rankModelIds);
                await savedRank.save();
            }
        }
    } catch (err) {
        console.log(err);
    }
}

exports.copy_rank_models = copy_rank_models;

exports.check_all_models = async function() {
    try {
        var path = "/find/";
        console.log(path);
        var $ = await commonController.copyHtml(branch.pcCopyUrl, path, branch.charset);
        var checkModelItems = {
            country: [],
            isretire: [0, 1],
            professional: []
        }
        var items = $("#selCountry").find("option");
        _.forEach(items.slice(1), function(item) {
            var value = $(item).attr("value");
            if (value) checkModelItems.country.push(value);
        })
        if (checkModelItems.country[1] == "台湾" && checkModelItems.country[2] == "台湾") checkModelItems.country[2] = "香港";
        var items = $("#selProfessional").find("option");
        _.forEach(items.slice(1), function(item) {
            var value = $(item).attr("value");
            if (value) checkModelItems.professional.push(value);
        })
        console.log(checkModelItems);
        for (var key in checkModelItems) {
            for (var i = 0; i < checkModelItems[key].length; i++) {
                var body = {
                    curpage: 1,
                    pagesize: 20
                }
                body[key] = checkModelItems[key][i];
                console.log(body);
                var stop = false;
                var endIndex = 10000;
                if (branch.isTest) endIndex = 3;
                do {
                    try {
                        var path = "/ajax/girl_query_total.ashx";
                        console.log(path, mapObjToHrefSearch(body));
                        var $ = await commonController.copyHtmlFragment(branch.pcCopyUrl, path, branch.charset, mapObjToHrefSearch(body));
                        var targetItems = $("li.girlli");
                        for (var j = 0; j < targetItems.length; j++) {
                            try {
                                var item = targetItems[j];
                                var modelHref = $(item).find("a").attr("href");
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
                            } catch (err) {
                                console.log(err);
                            }
                        }
                        var pages = $(".pagesYY a");
                        if ($(pages[pages.length - 1]).hasClass("cur")) stop = true;
                    } catch (err) {
                        console.log(err);
                    }
                    body.curpage++;
                } while (body.curpage <= endIndex && !stop);
            }
        }

    } catch (err) {
        console.log(err);
    }
}

function mapObjToHrefSearch(obj) {
    var str = [];
    for (var key in obj) {
        str.push([key, encodeURIComponent(obj[key])].join("="))
    }
    return str.join("&");
}