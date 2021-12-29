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
    copySrc: "tuaox", //www.tuaox.cc/
    originPictureTagGroups: [
        ["分类", "category"],
        ["标签", "tag"]
    ]
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
            branch.domain = savedBranch.domain || false;

            branch.pictureCategoryGroup = null;
            branch.pictureTagGroup = null;
            branch.pictureCategories = [];
            branch.pictureTags = [];
            var TagGroups = await tagSequelize.findAllTagGroup({
                branchId: branch.branchId
            })
            _.forEach(TagGroups, function(tagGroup) {
                var group = {
                    tagGroupId: tagGroup.tagGroupId,
                    name: tagGroup.name,
                    type: tagGroup.type
                }
                var tags = _.map(tagGroup.tags, function(tag) {
                    return {
                        tagId: tag.tagId,
                        name: tag.name,
                        remark: tag.remark,
                        originId: tag.originId
                    }
                })
                if (group.type == "category") {
                    branch.pictureCategoryGroup = group;
                    branch.pictureCategories = _.concat(branch.pictureCategories, tags);
                } else if (group.type == "tag") {
                    branch.pictureTagGroup = group;
                    branch.pictureTags = _.concat(branch.pictureTags, tags);
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
                type: branch.originPictureTagGroups[i][1],
                name: branch.originPictureTagGroups[i][0]
            })
            if (!savedTagGroup) {
                savedTagGroup = await tagSequelize.createTagGroup({
                    branchId: branch.branchId,
                    name: branch.originPictureTagGroups[i][0],
                    type: branch.originPictureTagGroups[i][1],
                    orderIndex: i,
                    originId: i
                })
            }
        }
    } catch (err) {
        console.log(err);
    }
}

exports.copy_categoryies = async function() {
    try {
        var path = "";
        console.log(path);
        var $ = await commonController.copyHtml(branch.pcCopyUrl, path, branch.charset);
        var tagItems = $("#header .menu").find("a").slice(1, -1);
        for (var j = 0; j < tagItems.length; j++) {
            var item = tagItems[j];
            var originId = $(item).attr("href").match(/category-.*/g)[0].match(/\d+/g)[0];
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
                    tagGroupId: branch.pictureCategoryGroup.tagGroupId
                })
            }
        }
        var tagItems = $("#divTags .tags-box").find("a");
        for (var j = 0; j < tagItems.length; j++) {
            var item = tagItems[j];
            var originId = $(item).attr("href").match(/tags-.*/g)[0].match(/\d+/g)[0];
            var name = $(item).text().replace(/^\s+|\s+$/g, "");
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
                    tagGroupId: branch.pictureTagGroup.tagGroupId
                })
            }
        }
    } catch (err) {
        console.log(err);
    }
}


async function copy_all_pictures(startIndex, endIndex, isUpdate) {
    try {
        if (!startIndex) startIndex = 1;
        var index = startIndex;
        if (!endIndex) endIndex = 1000;
        if (branch.isTest) endIndex = startIndex + 1;
        var stop = false;
        do {
            try {
                var path = "/page_" + index + ".html";
                console.log(path);
                var $ = await commonController.copyHtml(branch.pcCopyUrl, path, branch.charset);
                var targetItems = $("#container").find("article");
                for (var i = 0; i < targetItems.length; i++) {
                    try {
                        var item = targetItems[i];
                        var bookHref = $(item).find("a").attr("href");
                        var originId = bookHref.match(/\d+/g)[bookHref.match(/\d+/g).length - 1];
                        var savedPicture = await pictureSequelize.findOne({
                            branchId: branch.branchId,
                            originId: originId
                        })
                        if (savedPicture && isUpdate) {
                            stop = true;
                            break;
                        }
                        var picture = {
                            branchId: branch.branchId,
                            cover: $(item).find("img").attr("src"),
                            title: $(item).find("a").attr("title"),
                            originId: originId,
                            orderIndex: parseInt(originId)
                        }
                        picture.imgHost = picture.cover.match(/http(s?):\/\/[^\/]+/g)[0];
                        picture.cover = picture.cover.replace(picture.imgHost, "");
                        if (!savedPicture) {
                            savedPicture = await create_picture(originId, picture);
                        } else {
                            await update_picture(originId, picture)
                        }
                    } catch (err) {
                        console.log(index, i, originId);
                        console.log(err);
                    }
                }
                var pages = $(".pagenavi").children();
                if ($(pages[pages.length - 1]).hasClass("now-page")) stop = true;
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

exports.copy_all_pictures = copy_all_pictures;

async function create_picture(originId, picture) {
    try {
        var savedPicture = await pictureSequelize.findOne({
            branchId: branch.branchId,
            originId: originId
        })
        if (savedPicture && savedPicture.local) return savedPicture;
        if (savedPicture && !savedPicture.horiCover && savedPicture.lastUpdatedAt) return savedPicture;
        if (!savedPicture || !savedPicture.lastUpdatedAt) {
            var bookHref = "/post/" + originId + ".html";
            console.log(bookHref);
            var $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
            if (!picture) picture = {
                branchId: branch.branchId,
                // cover: $(item).find("img").attr("src"),
                title: $("#container").find("h1.title").text(),
                originId: originId,
                orderIndex: parseInt(originId)
            };
            picture.lastUpdatedAt = new Date($($("#container").find(".postmeta").find("span")[0]).text().replace(/\D+/g, "-").replace(/-$/, ""));
            var pic = $("#container .entry").find("img");
            var picUrl = $(pic).attr("src");
            if (!picture.imgHost) picture.imgHost = picUrl.match(/http(s?):\/\/[^\/]+/g)[0];
            picUrl = picUrl.replace(picture.imgHost, "");
            if (!picture.cover) picture.cover = picUrl;
            picture.pictureList = [];
            picture.pictureList.push(picUrl);
            var pages = $("#dm-fy").find("li");
            picture.count = pages.length - 2;
            picture.horiCover = "1";
            savedPicture = await pictureSequelize.create(picture);

            var tagIds = [];
            var originCategory = $("#container").find(".postmeta").find("a");
            var originCategoryId = $(originCategory).attr("href").match(/category-.*/g)[0].match(/\d+/g)[0];
            var originCategoryName = $(originCategory).text();
            var savedCategory = _.find(branch.pictureCategories, { originId: originCategoryId });
            if (!savedCategory && originCategoryId && originCategoryName) {
                savedCategory = await tagSequelize.create({
                    branchId: branch.branchId,
                    originId: originCategoryId,
                    name: originCategoryName,
                    tagGroupId: branch.pictureCategoryGroup.tagGroupId
                })
                branch.pictureCategories.push({
                    tagId: savedCategory.tagId,
                    name: savedCategory.name,
                    remark: savedCategory.remark,
                    originId: savedCategory.originId
                })
            }
            if (savedCategory) tagIds.push(savedCategory.tagId);
            var originTags = $("#container").find(".tags").find("a")
            for (var i = 0; i < originTags.length; i++) {
                originTag = originTags[i];
                var tagOriginId = $(originTag).attr("href").match(/tags-.*/g)[0].match(/\d+/g)[0];
                var savedTag = _.find(branch.pictureTags, { originId: tagOriginId });
                if (!savedTag) {
                    savedTag = await tagSequelize.create({
                        branchId: branch.branchId,
                        originId: tagOriginId,
                        name: $(originTag).text(),
                        tagGroupId: branch.pictureTagGroup.tagGroupId
                    })
                    branch.pictureTags.push({
                        tagId: savedTag.tagId,
                        name: savedTag.name,
                        remark: savedTag.remark,
                        originId: savedTag.originId
                    })
                }
                if (savedTag) tagIds.push(savedTag.tagId);
            }
            // if (!tagIds.length) {
            //     var tag = _.find(branch.pictureTags, { name: originCategoryName });
            //     if (tag) tagIds.push(tag.tagId);
            // }
            if (tagIds.length) {
                await savedPicture.addTags(_.uniq(tagIds), {
                    through: {
                        pictureLastUpdatedAt: savedPicture.lastUpdatedAt,
                        orderIndex: parseInt(savedPicture.originId)
                    }
                });
            }

        }

        picture = {};
        picture.pictureList = savedPicture.pictureList || [];
        var start = picture.pictureList.length + 1;
        var end = savedPicture.count;
        try {
            for (var i = start; i <= end; i++) {
                var bookHref = "/post/" + originId + ".html?page=" + i;
                console.log(bookHref);
                var $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
                var pic = $("#container .entry").find("img");
                var picUrl = $(pic).attr("src");
                if (!picUrl) continue;
                picUrl = picUrl.replace(savedPicture.imgHost, "");
                picture.pictureList.push(picUrl);
            }
            picture.horiCover = null;
        } catch (err) {
            console.log(err);
            console.log("获取图片列表中断！", originId);
        }
        await pictureSequelize.update(picture, {
            pictureId: savedPicture.pictureId
        });
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

async function update_picture(originId, picture) {
    try {
        var savedPicture = await pictureSequelize.findOne({
            branchId: branch.branchId,
            originId: originId
        })
        if (savedPicture && savedPicture.local) return savedPicture;
        if (savedPicture && !savedPicture.horiCover && savedPicture.lastUpdatedAt) {
            if (picture && picture.cover) savedPicture.set("cover", picture.cover);
            await savedPicture.save();
            // return savedPicture;
        };
        if (!savedPicture.lastUpdatedAt) {
            var bookHref = "/post/" + originId + ".html";
            console.log(bookHref);
            var $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
            if (!picture) picture = {
                branchId: branch.branchId,
                // cover: $(item).find("img").attr("src"),
                title: $("#container").find("h1.title").text(),
                originId: originId,
                orderIndex: parseInt(originId)
            };
            picture.lastUpdatedAt = new Date($($("#container").find(".postmeta").find("span")[0]).text().replace(/\D+/g, "-").replace(/-$/, ""));
            var pic = $("#container .entry").find("img");
            var picUrl = $(pic).attr("src");
            if (!picture.imgHost) picture.imgHost = picUrl.match(/http(s?):\/\/[^\/]+/g)[0];
            picUrl = picUrl.replace(picture.imgHost, "");
            if (!picture.cover) picture.cover = picUrl;
            picture.pictureList = [];
            picture.pictureList.push(picUrl);
            var pages = $("#dm-fy").find("li");
            picture.count = pages.length - 2;
            picture.horiCover = "1";
            if (!savedPicture.lastUpdatedAt) savedPicture.set("lastUpdatedAt", picture.lastUpdatedAt);
            if (!savedPicture.imgHost) savedPicture.set("lastUpdatedAt", picture.imgHost);
            if (!savedPicture.cover) savedPicture.set("lastUpdatedAt", picture.cover);
            if (!savedPicture.pictureList) savedPicture.set("lastUpdatedAt", picture.pictureList);
            if (!savedPicture.count) savedPicture.set("lastUpdatedAt", picture.count);
            if (!savedPicture.horiCover) savedPicture.set("lastUpdatedAt", picture.horiCover);
            await savedPicture.save();


            var tagIds = [];
            var originCategory = $("#container").find(".postmeta").find("a");
            var originCategoryId = $(originCategory).attr("href").match(/category-.*/g)[0].match(/\d+/g)[0];
            var originCategoryName = $(originCategory).text();
            var savedCategory = _.find(branch.pictureCategories, { originId: originCategoryId });
            if (!savedCategory && originCategoryId && originCategoryName) {
                savedCategory = await tagSequelize.create({
                    branchId: branch.branchId,
                    originId: originCategoryId,
                    name: originCategoryName,
                    tagGroupId: branch.pictureCategoryGroup.tagGroupId
                })
                branch.pictureCategories.push({
                    tagId: savedCategory.tagId,
                    name: savedCategory.name,
                    remark: savedCategory.remark,
                    originId: savedCategory.originId
                })
            }
            if (savedCategory) tagIds.push(savedCategory.tagId);
            var originTags = $("#container").find(".tags").find("a")
            for (var i = 0; i < originTags.length; i++) {
                originTag = originTags[i];
                var tagOriginId = $(originTag).attr("href").match(/tags-.*/g)[0].match(/\d+/g)[0];
                var savedTag = _.find(branch.pictureTags, { originId: tagOriginId });
                if (!savedTag) {
                    savedTag = await tagSequelize.create({
                        branchId: branch.branchId,
                        originId: tagOriginId,
                        name: $(originTag).text(),
                        tagGroupId: branch.pictureTagGroup.tagGroupId
                    })
                    branch.pictureTags.push({
                        tagId: savedTag.tagId,
                        name: savedTag.name,
                        remark: savedTag.remark,
                        originId: savedTag.originId
                    })
                }
                if (savedTag) tagIds.push(savedTag.tagId);
            }
            // if (!tagIds.length) {
            //     var tag = _.find(branch.pictureTags, { name: originCategoryName });
            //     if (tag) tagIds.push(tag.tagId);
            // }
            if (tagIds.length) {
                await savedPicture.addTags(_.uniq(tagIds), {
                    through: {
                        pictureLastUpdatedAt: savedPicture.lastUpdatedAt,
                        orderIndex: parseInt(savedPicture.originId)
                    }
                });
            }

        }
        if (!savedPicture.count) {
            var bookHref = "/post/" + originId + ".html";
            console.log(bookHref);
            var $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
            var pages = $("#dm-fy").find("li");
            savedPicture.set("count", pages.length - 2);
            await savedPicture.save();
        }
        if (!savedPicture.pictureList || !savedPicture.pictureList.length || savedPicture.pictureList.length < savedPicture.count) {
            picture = {};
            picture.pictureList = savedPicture.pictureList || [];
            var start = picture.pictureList.length + 1;
            var end = savedPicture.count;
            try {
                for (var i = start; i <= end; i++) {
                    var bookHref = "/post/" + originId + ".html?page=" + i;
                    console.log(bookHref);
                    var $ = await commonController.copyHtml(branch.pcCopyUrl, bookHref, branch.charset);
                    var pic = $("#container .entry").find("img");
                    var picUrl = $(pic).attr("src");
                    picUrl = picUrl.replace(savedPicture.imgHost, "");
                    picture.pictureList.push(picUrl);
                }
                picture.horiCover = null;
            } catch (err) {
                console.log(err);
                console.log("获取图片列表中断！", originId);
            }
            await pictureSequelize.update(picture, {
                pictureId: savedPicture.pictureId
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

function mapObjToHrefSearch(obj) {
    var str = [];
    for (var key in obj) {
        str.push([key, encodeURIComponent(obj[key])].join("="))
    }
    return str.join("&");
}