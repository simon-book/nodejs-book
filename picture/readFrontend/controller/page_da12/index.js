var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var moment = require('moment');
var util = require("../../util/index.js");
var branchSequelize = require('../../data/sequelize/branch/branchSequelize.js');
var tagSequelize = require('../../data/sequelize/picture/tagSequelize.js');
var pictureSequelize = require('../../data/sequelize/picture/pictureSequelize.js');
var auth = require('../user/auth.js');

exports.home = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var rank = _.find(branchInfo.rankMap, { originId: "homepage" });
        var rankPictures = [];
        if (rank.rankPictureIds && rank.rankPictureIds.length) {
            rankPictures = await pictureSequelize.findAllWithTags({
                pictureId: {
                    [Op.in]: rank.rankPictureIds
                }
            }, null, null, null);
            rankPictures = _.map(rankPictures, function(picture) {
                return picture.get();
            })
            rankPictures = _.sortBy(rankPictures, function(picture) {
                return _.indexOf(rank.rankPictureIds, picture.pictureId);
            })
        }
        var newPictures = await pictureSequelize.findAll({
            branchId: branchInfo.branchId
        }, 0, 36)
        newPictures = _.map(newPictures, function(picture) {
            return picture.get();
        })
        res.render('home', {
            title: branchInfo.title,
            keywords: null,
            description: null,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "home",
            rankPictures: rankPictures,
            newPictures: newPictures,
            moment: moment
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: "",
            pageTitle: "资源错误",
            books: [],
            pagination: null
        });
    }
};

function getSiblingPages(currentPage, totalPage, halfNum) {
    if (!halfNum) halfNum = 3;
    var pages = [currentPage];
    var halfPages1 = [];
    var halfPages2 = [];
    var halfNum1 = halfNum;
    var halfNum2 = halfNum;
    if (currentPage - halfNum < 1 && currentPage + halfNum < totalPage) {
        halfNum2 = halfNum2 + Math.min(halfNum - currentPage + 1, totalPage - currentPage - halfNum);
    }
    if (currentPage + halfNum > totalPage && currentPage - halfNum > 1) {
        halfNum1 = halfNum1 + Math.min(currentPage + halfNum - totalPage, currentPage - halfNum - 1);
    }
    var i = 1;
    while (currentPage - i >= 1 && i <= halfNum1) {
        halfPages1.splice(0, 0, currentPage - i);
        i++;
    }
    var i = 1;
    while (currentPage + i <= totalPage && i <= halfNum2) {
        halfPages2.push(currentPage + i);
        i++;
    }
    // console.log(halfNum1, halfPages1);
    // console.log(halfNum2, halfPages2);
    return halfPages1.concat(pages).concat(halfPages2);
}

async function getSiblings(allIds, length) {
    if (!length) length = 20;
    var articleIds = [];
    for (var i = 0; i < length; i++) {
        articleIds.push(allIds[parseInt(Math.random() * allIds.length)]);
    }
    return _.uniq(articleIds);
}

exports.tagList = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var tags = await tagSequelize.findAll({
            branchId: branchInfo.branchId
        }, null, null, [
            ["orderIndex", "asc"]
        ]);
        var tagNames = [];
        _.forEach(tags, function(tag) {
            tagNames.push(tag.name);
        })
        var totalCount = _.reduce(tags, function(sum, tag) { return sum + tag.pictureCount; }, 0)
        res.render('tagList', {
            title: "图片分类-" + branchInfo.shorttitle,
            keywords: "美女摄影机构,美女摄影平台,嫩模写真网,秀人网旗下,日韩写真杂志",
            description: "各大摄影机构美女写真套图:" + tagNames.slice(0, 12).join(",") + "等",
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: "美女图片",
            currentRender: "tagList",
            tags: tags,
            totalCount: totalCount
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: "",
            pageTitle: "资源错误",
            books: [],
            pagination: null
        });
    }
}

exports.galleryList = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var tagId = parseInt(req.params.tagId);
        var currentPage = parseInt(req.params.page || 1);
        var pageSize = 36;
        var offset = (currentPage - 1) * pageSize;
        if (!tagId) {
            var result = await pictureSequelize.findAndCountAll({
                branchId: branchInfo.branchId
            }, offset, pageSize);
            var count = result.count;
            var rows = result.rows;
        } else {
            var tag = _.find(branchInfo.tags, { tagId: tagId });
            if (!tag) throw new Error("找不到资源");
            var result = await pictureSequelize.findAndCountAllPictureTag({
                tagId: tagId
            }, offset, pageSize);
            var count = result.count;
            var rows = _.map(result.rows, function(row) {
                return row.picture;
            });
        }
        res.render('galleryList', {
            title: (tag ? tag.name : "最近更新") + "-" + branchInfo.shorttitle,
            keywords: tag ? tag.name + "," + tag.name + "套图," + tag.name + "写真," + tag.name + "模特" : "性感美女图片,性感写真,性感模特",
            description: tag ? tag.remark : "分享各类性感美女图片，美女写真集，美女套图",
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: tag ? tag.name : "美女图片",
            tag: tag,
            pictures: rows,
            currentRender: tag ? "tagList" : "galleryList",
            pagination: {
                totalNum: count,
                currentPage: currentPage,
                pages: getSiblingPages(currentPage, Math.ceil(count / pageSize), 6),
                totalPage: Math.ceil(count / pageSize)
            }
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: "",
            pageTitle: "资源错误",
            books: [],
            pagination: null
        });
    }
};

exports.gallery = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var pictureId = parseInt(req.params.pictureId);
        var picture = await pictureSequelize.findByPk(pictureId);
        var currentPage = parseInt(req.params.page || 1);
        var pageSize = 10;
        if (!picture) throw new Error("找不到资源");
        var allIds = await pictureSequelize.findAllIds({
            branchId: branchInfo.branchId
        });
        var relatedIds = await getSiblings(allIds);
        var recommendPictures = await pictureSequelize.findAll({
            pictureId: {
                [Op.in]: relatedIds
            }
        }, 0, 12)
        var tag = picture.tags[0];
        res.render('gallery', {
            title: picture.title + "-" + branchInfo.shorttitle,
            keywords: (tag ? tag.name + "," : "") + picture.title,
            description: picture.abstractContent || tag.remark,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: picture.title,
            picture: picture.get(),
            pics: picture.pictureList.slice((currentPage - 1) * pageSize, currentPage * pageSize),
            startIndex: (currentPage - 1) * pageSize,
            currentRender: "gallery",
            recommendPictures: recommendPictures,
            moment: moment,
            pagination: {
                totalNum: picture.pictureList.length,
                currentPage: currentPage,
                pages: getSiblingPages(currentPage, Math.ceil(picture.pictureList.length / pageSize), 6),
                totalPage: Math.ceil(picture.pictureList.length / pageSize)
            }
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: "",
            pageTitle: "资源错误",
            books: [],
            pagination: null
        });
    }
};

exports.searchGallery = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var currentPage = parseInt(req.params.page || 1);
        var pageSize = 32;
        var offset = (currentPage - 1) * pageSize;
        var searchContent = req.query.keyword.replace(/^\s+|\s+$/g, "");
        var result = await pictureSequelize.findAndCountAll({
            branchId: branchInfo.branchId,
            title: {
                [Op.like]: '%' + searchContent + '%'
            }
        }, offset, pageSize)
        res.render('searchGallery', {
            title: "包含" + searchContent + "的美女图片-" + branchInfo.shorttitle,
            keywords: searchContent + "写真," + searchContent + "套图,有关" + searchContent + "的美女图片",
            description: "有关" + searchContent + "的美女图片和美女写真",
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "searchGallery",
            pageTitle: "搜索 " + searchContent + " 的结果",
            pictureCount: result.count,
            pictures: result.rows,
            searchContent: searchContent,
            pagination: {
                totalNum: result.count,
                currentPage: currentPage,
                pages: getSiblingPages(currentPage, Math.ceil(result.count / pageSize)),
                totalPage: Math.ceil(result.count / pageSize)
            }
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: "",
            pageTitle: "资源错误",
            books: [],
            pagination: null
        });
    }
};

exports.error = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: "",
            pageTitle: "资源错误",
            books: [],
            pagination: null
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            message: "请求错误！",
            error: err ? JSON.stringify(err) : ""
        });
    }
};