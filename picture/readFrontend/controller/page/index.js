var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var moment = require('moment');
var util = require("../../util/index.js");
var branchSequelize = require('../../data/sequelize/branch/branchSequelize.js');
var tagSequelize = require('../../data/sequelize/picture/tagSequelize.js');
var modelSequelize = require('../../data/sequelize/picture/modelSequelize.js');
var pictureSequelize = require('../../data/sequelize/picture/pictureSequelize.js');
var articleSequelize = require('../../data/sequelize/picture/articleSequelize.js');
var rankSequelize = require('../../data/sequelize/rank/rankSequelize.js');
var auth = require('../user/auth.js');

exports.home = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var newArticles = await articleSequelize.findAll({
            branchId: branchInfo.branchId
        }, 0, 11, null, ["articleId", "title", "cover"]);
        var newModels = await modelSequelize.findAll({
            branchId: branchInfo.branchId,
            statusId: 2
        }, 0, 18);
        var rank = _.find(branchInfo.rankMap, { originId: "homepage" });
        if (rank.rankModelIds && rank.rankModelIds.length) {
            rank.models = await modelSequelize.findAll({
                modelId: {
                    [Op.in]: rank.rankModelIds
                }
            });
            rank.models = _.sortBy(rank.models, function(model) {
                return _.indexOf(rank.rankModelIds, model.modelId);
            })
        }
        var todayModels = await modelSequelize.findAll({
            branchId: branchInfo.branchId,
            birthday: {
                [Op.endsWith]: moment().format("MM-DD")
            },
            statusId: 2
        }, 0, 7);
        var modelTags = _.filter(branchInfo.modelTags, function(tag) {
            return _.indexOf(["taiwan", "neidi", "qizhi", "mote"], tag.originId) > -1;
        })
        for (var i = 0; i < modelTags.length; i++) {
            var modelTag = modelTags[i];
            var result = await modelSequelize.findTagModels({
                tagId: modelTag.tagId
            }, 0, 10);
            modelTag.models = _.map(result.rows, function(row) {
                return row.model;
            });
        }
        res.render('home', {
            title: branchInfo.title,
            keywords: null,
            description: null,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "home",
            newArticles: newArticles,
            newModels: newModels,
            homeRank: rank,
            todayModels: todayModels,
            modelTags: modelTags,
            moment: moment
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: null,
            description: null,
            pageTitle: "资源错误"
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

exports.articleList = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var currentPage = parseInt(req.params.page || 1);
        var pageSize = 24;
        var offset = (currentPage - 1) * pageSize;
        var result = await articleSequelize.findAndCountAll({
            branchId: branchInfo.branchId
        }, offset, pageSize, null, ["articleId", "title", "cover", "lastUpdatedAt"])
        res.render('articleList', {
            title: "女神情报-" + branchInfo.shorttitle,
            keywords: "美女新闻,美女动态,美女GIF",
            description: "发布最新最新最全的美女新闻、美女动态、美女GIF",
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: "女神情报",
            articles: result.rows,
            currentRender: "articles",
            moment: moment,
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
            keywords: null,
            description: null,
            pageTitle: "资源错误"
        });
    }
};

async function getSiblings(allIds, length) {
    if (!length) length = 20;
    var articleIds = [];
    for (var i = 0; i < length; i++) {
        articleIds.push(allIds[parseInt(Math.random() * allIds.length)]);
    }
    return _.uniq(articleIds);
}

exports.article = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var articleId = parseInt(req.params.articleId);
        var article = await articleSequelize.findByPk(articleId);
        if (article.relatedModelIds) {
            var relatedModels = await modelSequelize.findAll({
                modelId: {
                    [Op.in]: article.relatedModelIds
                }
            });
            relatedModels = _.sortBy(relatedModels, function(model) {
                return _.indexOf(article.relatedModelIds, model.modelId);
            })
        }
        var prevArticle = await articleSequelize.findOne({
            branchId: branchInfo.branchId,
            lastUpdatedAt: {
                [Op.lt]: article.lastUpdatedAt
            }
        }, [
            ["lastUpdatedAt", "desc"]
        ], ["articleId", "title"]);
        var nextArticle = await articleSequelize.findOne({
            branchId: branchInfo.branchId,
            lastUpdatedAt: {
                [Op.gt]: article.lastUpdatedAt
            }
        }, [
            ["lastUpdatedAt", "asc"]
        ], ["articleId", "title"]);
        var allIds = await articleSequelize.findAllIds({
            branchId: branchInfo.branchId,
        });
        var relatedIds = await getSiblings(allIds);
        var recommendArticles = await articleSequelize.findAll({
            //branchId: branchInfo.branchId,
            articleId: {
                [Op.in]: relatedIds
            }
        }, 0, 15, null, ["articleId", "title", "cover"])
        if (!article) throw new Error("找不到资源");
        var currentPage = parseInt(req.params.page || 1);
        res.render('article', {
            title: article.title + "-" + branchInfo.shorttitle,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "article",
            keywords: article.keywords,
            description: article.description,
            pageTitle: article.title,
            article: article,
            relatedModels: relatedModels,
            recommendArticles: recommendArticles,
            prevArticle: prevArticle,
            nextArticle: nextArticle,
            currentPage: currentPage
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: null,
            description: null,
            pageTitle: "资源错误"
        });
    }
};

exports.galleryList = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var tagId = parseInt(req.params.tagId);
        var currentPage = parseInt(req.params.page || 1);
        var pageSize = 24;
        var offset = (currentPage - 1) * pageSize;
        if (!tagId) {
            var result = await pictureSequelize.findAndCountAll({
                branchId: branchInfo.branchId
            }, offset, pageSize);
            var count = result.count;
            var rows = result.rows;
        } else {
            var tag = _.find(branchInfo.pictureTags, { tagId: tagId });
            if (!tag) throw new Error("找不到资源");
            var result = await pictureSequelize.findAndCountAllPictureTag({
                tagId: tagId
            }, offset, pageSize);
            var count = result.count;
            var rows = _.map(result.rows, function(row) {
                return row.picture;
            });
        }
        _.remove(rows, { local: false });
        res.render('galleryList', {
            title: (tag ? tag.name : "") + "美女图片-" + branchInfo.shorttitle,
            keywords: tag ? tag.name + "美女," + tag.name + "美女图片," + tag.name + "美女写真," + tag.name + "模特" : "性感美女图片,性感写真,性感模特",
            description: tag ? tag.remark : "分享各类性感美女图片，美女写真集",
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: tag ? tag.name : "美女图片",
            tag: tag,
            pictures: rows,
            currentRender: "galleryList",
            isMobileDevice: req.isMobileDevice,
            pagination: {
                totalNum: count,
                currentPage: currentPage,
                pages: getSiblingPages(currentPage, Math.ceil(count / pageSize)),
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
            keywords: null,
            description: null,
            pageTitle: "资源错误"
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
        var tagNames = [];
        _.forEach(picture.models, function(model) {
            tagNames.push(model.name);
        })
        _.forEach(picture.tags, function(tag) {
            tagNames.push(tag.name);
        })
        res.render('gallery', {
            title: picture.title + "-" + branchInfo.shorttitle,
            keywords: tagNames.length ? tagNames.join(",") : picture.title,
            description: picture.abstractContent || "",
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: picture.title,
            picture: picture,
            pics: picture.pictureHdList.slice((currentPage - 1) * pageSize, currentPage * pageSize),
            startIndex: (currentPage - 1) * pageSize,
            currentRender: "gallery",
            recommendPictures: recommendPictures,
            moment: moment,
            pagination: {
                totalNum: picture.pictureList.length,
                currentPage: currentPage,
                pages: getSiblingPages(currentPage, Math.ceil(picture.pictureList.length / pageSize)),
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
            keywords: null,
            description: null,
            pageTitle: "资源错误"
        });
    }
};

exports.galleryImg = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var pictureId = parseInt(req.params.pictureId);
        var picture = await pictureSequelize.findByPk(pictureId);
        var currentPage = parseInt(req.params.page || 1);
        var pageSize = 1;
        if (!picture || !picture.pictureHdList || !picture.pictureHdList.length) throw new Error("找不到资源");
        if (!picture.pictureHdList[currentPage - 1] && picture.pictureHdList[0]) {
            res.redirect("/galleryImg/" + picture.pictureId + "/1");
            return;
        }
        var allIds = await pictureSequelize.findAllIds({
            branchId: branchInfo.branchId
        });
        var relatedIds = await getSiblings(allIds);
        var recommendPictures = await pictureSequelize.findAll({
            pictureId: {
                [Op.in]: relatedIds
            }
        }, 0, 12)
        var tagNames = [];
        var descriptions = [];
        _.forEach(picture.tags, function(tag) {
            tagNames.push(tag.name);
        })
        _.forEach(picture.models, function(model) {
            tagNames.push(model.name);
            descriptions.push(model.name + "的写真");
        })
        res.render('galleryImg', {
            title: "第" + currentPage + "张-" + picture.title + "-" + branchInfo.shorttitle,
            keywords: (tagNames.length ? tagNames.join(",") : picture.title) + ",高清美女图片,美女壁纸",
            description: (descriptions.length ? descriptions.join("，") + "，" : "") + "有关" + picture.title + "的高清大图，高清壁纸",
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: picture.title,
            picture: picture,
            pic: picture.pictureHdList[currentPage - 1] || picture.pictureHdList[0],
            currentRender: "galleryImg",
            recommendPictures: recommendPictures,
            moment: moment,
            pagination: {
                totalNum: picture.pictureHdList.length,
                currentPage: currentPage,
                pages: _.range(1, picture.pictureHdList.length + 1),
                totalPage: Math.ceil(picture.pictureHdList.length / pageSize)
            }
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: null,
            description: null,
            pageTitle: "资源错误"
        });
    }
};

exports.modelList = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var tagId = parseInt(req.params.tagId);
        var currentPage = parseInt(req.params.page || 1);
        var pageSize = 30;
        var offset = (currentPage - 1) * pageSize;
        if (!tagId) {
            var result = await modelSequelize.findAndCountAll({
                branchId: branchInfo.branchId
            }, offset, pageSize);
            var count = result.count;
            var rows = result.rows;
        } else {
            var tag = _.find(branchInfo.modelTags, { tagId: tagId });
            if (!tag) throw new Error("找不到资源");
            var result = await modelSequelize.findTagModels({
                tagId: tagId
            }, offset, pageSize);
            var count = result.count;
            var rows = _.map(result.rows, function(row) {
                return row.model;
            });
        }
        var tagNames = _.map(branchInfo.modelTagGroups[0].tags, function(tag) {
            return tag.name
        })
        _.remove(rows, function(row) {
            return !row;
        });
        var modelNames = _.map(rows, function(row) {
            return row ? row.name : "";
        })
        res.render('modelList', {
            title: (tag ? tag.name : "倾城美人榜") + "-" + branchInfo.shorttitle,
            keywords: tag ? tag.name.replace(/(美女)/g, "") + "," + tag.name.replace(/(美女)/g, "") + "美女," + tag.name.replace(/(美女)/g, "") + "模特" : "美女榜,美女列表,美女资料",
            description: (tag ? tag.name.replace(/(美女)/g, "") : "") + "美女资料，包含：" + modelNames.join("、") + "等",
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: tag ? tag.name : "倾城美人榜",
            tag: tag,
            models: rows,
            currentRender: "modelList",
            pagination: {
                totalNum: count,
                currentPage: currentPage,
                pages: getSiblingPages(currentPage, Math.ceil(count / pageSize)),
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
            keywords: null,
            description: null,
            pageTitle: "资源错误"
        });
    }
};

exports.model = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var modelId = parseInt(req.params.modelId);
        var model = await modelSequelize.findByPk(modelId);
        if (!model) throw new Error("找不到资源");
        var relatedModels = [];
        if (model.relatedModelIds) {
            relatedModels = await modelSequelize.findAll({
                modelId: {
                    [Op.in]: model.relatedModelIds
                }
            });
            relatedModels = _.sortBy(relatedModels, function(model) {
                return _.indexOf(model.relatedModelIds, model.modelId);
            })
        }
        if (model.pictures) {
            model.pictures = _.map(model.pictures, function(picture) {
                return picture.get();
            })
            model.pictures = _.orderBy(model.pictures, "lastUpdatedAt", "desc");
        }
        var allIds = await articleSequelize.findAllIds({
            branchId: branchInfo.branchId
        });
        var relatedIds = await getSiblings(allIds);
        var recommendArticles = await articleSequelize.findAll({
            //branchId: branchInfo.branchId,
            articleId: {
                [Op.in]: relatedIds
            }
        }, 0, 10, null, ["articleId", "title", "cover"])
        res.render('model', {
            title: model.name + "的资料和写真合集-" + branchInfo.shorttitle,
            keywords: model.name + "," + (model.othername ? model.othername + "," : "") + (model.nickname ? model.nickname + "," : "") + model.name + "资料," + model.name + "写真,套图" + (model.job ? "," + model.job.replace(/、/g, ",") : ""),
            description: model.remark,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: model.name,
            model: model,
            relatedModels: relatedModels,
            relatedArticles: model.articles,
            relatedPictures: model.pictures.slice(0, 12),
            relatedPicturesCount: model.pictures.length,
            recommendArticles: recommendArticles,
            currentRender: "model",
            moment: moment
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: null,
            description: null,
            pageTitle: "资源错误"
        });
    }
};

exports.modelAlbum = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var modelId = parseInt(req.params.modelId);
        var currentPage = parseInt(req.params.page || 1);
        var pageSize = 24;
        var model = await modelSequelize.findByPk(modelId);
        if (!model) throw new Error("找不到资源");
        var allIds = await pictureSequelize.findAllIds({
            branchId: branchInfo.branchId
        });
        var relatedIds = await getSiblings(allIds);
        var recommendPictures = await pictureSequelize.findAll({
            pictureId: {
                [Op.in]: relatedIds
            }
        }, 0, 12)
        if (model.pictures) {
            model.pictures = _.map(model.pictures, function(picture) {
                return picture.get();
            })
            model.pictures = _.orderBy(model.pictures, "lastUpdatedAt", "desc");
        }
        res.render('modelAlbum', {
            title: model.name + "的写真集-" + branchInfo.shorttitle,
            keywords: model.name + "," + model.name + "写真集," + (model.othername ? model.othername + "写真集," : "") + (model.nickname ? model.nickname + "写真集," : "") + model.name + "套图",
            description: model.name + "的写真合集" + ",出道至今的高清写真套图共" + model.pictures.length + "部",
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: model.name,
            model: model,
            pictures: model.pictures.slice((currentPage - 1) * pageSize, currentPage * pageSize),
            relatedPicturesCount: model.pictures.length,
            recommendPictures: recommendPictures,
            currentRender: "modelAlbum",
            pagination: {
                totalNum: model.pictures.length,
                currentPage: currentPage,
                pages: getSiblingPages(currentPage, Math.ceil(model.pictures.length / pageSize)),
                totalPage: Math.ceil(model.pictures.length / pageSize)
            }
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: null,
            description: null,
            pageTitle: "资源错误"
        });
    }
};

exports.todayModelList = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var todayModels = await modelSequelize.findAll({
            branchId: branchInfo.branchId,
            birthday: {
                [Op.endsWith]: moment().format("MM-DD")
            },
            statusId: 2
        }, 0, 10000);
        res.render('todayModel', {
            title: "今日女神-" + branchInfo.shorttitle,
            keywords: "今日女神、性感美女、性感女神",
            description: "今天过生日的女神,今天过生日的美女,今天过生日的正妹！",
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: "今日女神",
            models: todayModels,
            currentRender: "todayModel",
            moment: moment
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: null,
            description: null,
            pageTitle: "资源错误"
        });
    }
};

exports.paihang = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var ranks = await rankSequelize.findAll({
            branchId: branchInfo.branchId,
            originId: {
                [Op.not]: "homepage"
            }
        });
        var result = [];
        var moreRanks = [];
        for (var i = 0; i < ranks.length; i++) {
            var rank = ranks[i];
            if (i >= 18) moreRanks.push(rank);
            else {
                var models = await modelSequelize.findAll({
                    modelId: {
                        [Op.in]: rank.rankModelIds.slice(0, 10)
                    }
                }, 0, 10);
                rank.models = _.sortBy(models, function(model) {
                    return _.indexOf(rank.rankModelIds.slice(0, 10), model.modelId);
                })
                result.push(rank);
            }
        }
        var rankNames = _.map(ranks, function(rank) {
            return rank.name;
        })
        res.render('paihangs', {
            title: "宅男女神排行榜-" + branchInfo.shorttitle,
            keywords: "美女排行榜,性感女神排行榜,性感美女排行榜,性感模特排行榜",
            description: rankNames.join(","),
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: "宅男女神排行榜",
            ranks: result,
            moreRanks: moreRanks,
            moment: moment,
            currentRender: "paihang"
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: null,
            description: null,
            pageTitle: "资源错误"
        });
    }
};

exports.rankModelList = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var ranks = await rankSequelize.findAll({
            branchId: branchInfo.branchId,
            originId: {
                [Op.not]: "homepage"
            }
        });
        var rankId = parseInt(req.params.rankId);
        var currentPage = parseInt(req.params.page || 1);
        var pageSize = 20;
        var offset = (currentPage - 1) * pageSize;
        var rank = _.find(ranks, { rankId: rankId });
        if (!rank) throw new Error("找不到资源")
        var models = await modelSequelize.findAll({
            modelId: {
                [Op.in]: rank.rankModelIds.slice(offset, offset + pageSize)
            }
        }, 0, pageSize, null, ["modelId", "name", "othername", "birthyear", "birthday", "birthIn", "job", "originId", "cover", "cup", "bustline", "waistline", "hipline"]);
        var modelNames = _.map(models, function(model) {
            return model.name
        })
        res.render('paihang', {
            title: rank.name + "-" + branchInfo.shorttitle,
            keywords: rank.name + "," + rank.name.replace("排行榜", "排名"),
            description: rank.name + ":" + modelNames.join(","),
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: rank.name,
            rank: rank,
            ranks: ranks,
            models: _.sortBy(models, function(model) {
                return _.indexOf(rank.rankModelIds.slice(offset, offset + pageSize), model.modelId);
            }),
            currentRender: "paihang",
            moment: moment,
            pagination: {
                totalNum: rank.rankModelIds.length,
                currentPage: currentPage,
                pageSize: pageSize,
                pages: getSiblingPages(currentPage, Math.ceil(rank.rankModelIds.length / pageSize)),
                totalPage: Math.ceil(rank.rankModelIds.length / pageSize)
            }
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: null,
            description: null,
            pageTitle: "资源错误"
        });
    }
};

exports.findModel = async function(req, res) {
    var branchInfo = req.branchInfo;
    res.render('findModel', {
        title: "找女神-" + branchInfo.title,
        keywords: "搜索美女,美女资料搜索,找美女",
        description: "根据美女年龄,美女身高,美女体重,美女cup,美女罩杯,美女胸围,美女腰围,美女臀围,美女国家,美女职业,美女血型,美女星座来搜索美女",
        branchInfo: branchInfo,
        user: auth.getUser(req, res),
        currentRender: "findModel",
        pageTitle: "找女神",
    });
}

exports.findModelList = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var body = req.body;
        var currentPage = parseInt(req.body.page || 1);
        var pageSize = parseInt(req.body.pageSize || 30);
        var offset = (currentPage - 1) * pageSize;
        var where = {
            branchId: branchInfo.branchId
        };
        if (body.country) where.birthIn = {
            [Op.like]: '%' + body.country + '%'
        }
        if (body.constellation) where.constellation = body.constellation;
        if (body.bloodType) where.bloodType = body.bloodType;
        if (body.job) where.job = {
            [Op.like]: '%' + body.job + '%'
        };
        if (body.age) {
            var start = moment().year() - body.age[1];
            var end = moment().year() - body.age[0];
            where.birthyear = {
                [Op.between]: [start, end]
            };
        }
        if (body.height) {
            where.height = {
                [Op.between]: [body.height[0], body.height[1]]
            };
        }
        if (body.bustline) {
            where.bustline = {
                [Op.between]: [body.bustline[0], body.bustline[1]]
            };
        }
        if (body.waistline) {
            where.waistline = {
                [Op.between]: [body.waistline[0], body.waistline[1]]
            };
        }
        if (body.hipline) {
            where.hipline = {
                [Op.between]: [body.hipline[0], body.hipline[1]]
            };
        }
        if (body.cup) {
            var str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var start = str.indexOf(body.cup[0]);
            var end = str.indexOf(body.cup[1]);
            where.cup = {
                [Op.in]: str.slice(start, end + 1).split("")
            };
        }
        var result = await modelSequelize.findAndCountAll(where, offset, pageSize);
        res.render('common/findModelModel', {
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            models: result.rows,
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
            keywords: null,
            description: null,
            pageTitle: "资源错误"
        });
    }
};

exports.search = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        if (!req.query.keyword) throw new Error("缺少搜索参数");
        var searchContent = req.query.keyword.replace(/^\s+|\s+$/g, "");
        var modelResult = await modelSequelize.findAndCountAll({
            branchId: branchInfo.branchId,
            [Op.or]: [{
                name: {
                    [Op.like]: '%' + searchContent + '%'
                }
            }, {
                othername: {
                    [Op.like]: '%' + searchContent + '%'
                }
            }, {
                nickname: {
                    [Op.like]: '%' + searchContent + '%'
                }
            }]
        }, 0, 24)
        var pictureResult = await pictureSequelize.findAndCountAll({
            branchId: branchInfo.branchId,
            title: {
                [Op.like]: '%' + searchContent + '%'
            }
        }, 0, 24)
        res.render('search', {
            title: "搜索" + searchContent + "-" + branchInfo.shorttitle,
            keywords: searchContent + ",搜索" + searchContent + ",包含" + searchContent + "的结果",
            description: "包含" + searchContent + "的美女资料" + ",包含" + searchContent + "的图片、写真",
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            pageTitle: "搜索 " + searchContent + " 的结果",
            modelCount: modelResult.count,
            models: modelResult.rows,
            pictureCount: pictureResult.count,
            pictures: pictureResult.rows,
            searchContent: searchContent
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: null,
            description: null,
            pageTitle: "资源错误"
        });
    }
};

exports.searchModel = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var currentPage = parseInt(req.params.page || 1);
        var pageSize = 24;
        var offset = (currentPage - 1) * pageSize;
        var searchContent = req.query.keyword.replace(/^\s+|\s+$/g, "");
        var result = await modelSequelize.findAndCountAll({
            branchId: branchInfo.branchId,
            [Op.or]: [{
                name: {
                    [Op.like]: '%' + searchContent + '%'
                }
            }, {
                othername: {
                    [Op.like]: '%' + searchContent + '%'
                }
            }, {
                nickname: {
                    [Op.like]: '%' + searchContent + '%'
                }
            }]
        }, offset, pageSize);
        res.render('searchModel', {
            title: "包含" + searchContent + "的美女-" + branchInfo.shorttitle,
            keywords: searchContent + "美女," + searchContent + "模特,有关" + searchContent + "的美女",
            description: "有关" + searchContent + "的美女、模特列表",
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "searchModel",
            pageTitle: "搜索 " + searchContent + " 的结果",
            modelCount: result.count,
            models: result.rows,
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
            keywords: null,
            description: null,
            pageTitle: "资源错误"
        });
    }
};

exports.searchGallery = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var currentPage = parseInt(req.params.page || 1);
        var pageSize = 24;
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
            keywords: searchContent + "写真," + searchContent + "图片,有关" + searchContent + "的美女图片",
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
            keywords: null,
            description: null,
            pageTitle: "资源错误"
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
            keywords: null,
            description: null,
            pageTitle: "资源错误"
        });
    } catch (err) {
        console.log(err);
        res.render('error', {
            title: "资源错误" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            keywords: null,
            description: null,
            pageTitle: "资源错误"
        });
    }
};