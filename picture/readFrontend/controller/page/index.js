var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var _ = require('lodash');
var moment = require('moment');
var util = require("../../util/index.js");
// var httpGateway = require("../../data/http/httpGateway.js");
var branchSequelize = require('../../data/sequelize/branch/branchSequelize.js');
var tagSequelize = require('../../data/sequelize/picture/tagSequelize.js');
var modelSequelize = require('../../data/sequelize/picture/modelSequelize.js');
var pictureSequelize = require('../../data/sequelize/picture/pictureSequelize.js');
var articleSequelize = require('../../data/sequelize/picture/articleSequelize.js');
var rankSequelize = require('../../data/sequelize/rank/rankSequelize.js');

// var homeController = require("../read/homeController.js");
// var bookController = require("../read/bookController.js");
// var readController = require("../read/readController.js");
// var rankController = require("../read/rankController.js");
// var chargeController = require("../read/chargeController.js");
// var userController = require("../user/userController.js");
var auth = require('../user/auth.js');

exports.home = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var newArticles = await articleSequelize.findAll({
            branchId: branchInfo.branchId
        }, 0, 10, null, ["articleId", "title"]);
        var newModels = await modelSequelize.findAll({
            branchId: branchInfo.branchId,
            statusId: 2
        }, 0, 15, null, ["modelId", "name", "othername", "birthday", "job"]);
        var rank = await await rankSequelize.findOne({
            branchId: branchInfo.branchId,
            originId: "homepage"
        })
        if (rank.rankModelIds && rank.rankModelIds.length) {
            rank.models = await modelSequelize.findAll({
                modelId: {
                    [Op.in]: rank.rankModelIds.
                }
            }, null, null, null, ["modelId", "name", "othername", "birthday", "job"]);
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
        }, 0, 10, null, ["modelId", "name", "othername", "birthday", "job"]);
        var modelTags = _.filter(branchInfo.modelTags, function(tag) {
            return _.indexOf(["taiwan", "neidi", "hanguo", "yujie"], tag.originId) > -1;
        })
        for (var i = 0; i < modelTags.length; i++) {
            var modelTag = modelTags[i];
            modelTag.firstModels = await modelSequelize.findTagModels({
                tagId: modelTag.tagId
            });
        }
        res.send({
            title: "首页_" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "home",
            newArticles: newArticles,
            newModels: newModels,
            homeRank: rank,
            todayModels: todayModels,
            modelTags: modelTags
        })
        // res.render('home', {
        //     title: "首页_" + branchInfo.title,
        //     branchInfo: branchInfo,
        //     user: auth.getUser(req, res),
        //     currentRender: "home",
        //     newArticles: newArticles,
        //     newModels: newModels,
        //     homeRank: rank,
        //     todayModels: todayModels,
        //     modelTags: modelTags
        // });
    } catch (err) {
        console.log(err);
        res.render('error', {
            message: "请求错误！",
            error: err ? JSON.stringify(err) : ""
        });
    }
};

exports.articleList = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var currentPage = parseInt(req.params.page || 1);
        var pageSize = 30;
        var offset = (currentPage - 1) * pageSize;
        var result = await articleSequelize.findAndCountAll({
            branchId: branchInfo.branchId
        }, offset, pageSize, null, ["articleId", "title", "lastUpdatedAt"])
        res.send({
            title: "女神情报_" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: "女神情报",
            books: result.rows,
            currentRender: "articleList",
            pagination: {
                totalNum: result.count,
                currentPage: currentPage,
                totalPage: Math.ceil(result.count / pageSize)
            }
        })
        // res.render('articleList', {
        //     title: "女神情报_" + branchInfo.title,
        //     branchInfo: branchInfo,
        //     user: auth.getUser(req, res),
        //     pageTitle: "女神情报",
        //     books: result.rows,
        //     currentRender: "articleList",
        //     pagination: {
        //         totalNum: result.count,
        //         currentPage: currentPage,
        //         totalPage: Math.ceil(result.count / pageSize)
        //     }
        // });
    } catch (err) {
        console.log(err);
        res.render('error', {
            message: "请求错误！",
            error: err ? JSON.stringify(err) : ""
        });
    }
};


exports.article = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var articleId = parseInt(req.params.articleId);
        var article = await articleSequelize.findByPk(articleId);
        if (!article) throw new Error("找不到资源");
        res.send({
            title: article.title + "_" + branchInfo.shorttitle,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "article",
            keywords: article.keywords,
            description: article.description,
            pageTitle: article.title,
            article: article,
        })
        // res.render('article', {
        //     title: article.title + "_" + branchInfo.shorttitle,
        //     branchInfo: branchInfo,
        //     user: auth.getUser(req, res),
        //     currentRender: "article",
        //     keywords: article.keywords,
        //     description: article.description,
        //     pageTitle: article.title,
        //     article: article,
        // });
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

exports.pictureTag = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var pictureTagGroups = branchInfo.pictureTagGroups;
        var tagId = parseInt(req.params.tagId);
        var tag = _.find(branchInfo.pictureTags, { tagId: tagId });
        if (!tag) throw new Error("找不到资源");
        var currentPage = parseInt(req.params.page || 1);
        var pageSize = 30;
        var offset = (currentPage - 1) * pageSize;
        if (!tagId) {
            var result = await pictureSequelize.findAndCountAll({
                branchId: branchInfo.branchId
            }, offset, pageSize);
            var count = result.count;
            var rows = result.rows;
        } else {
            var result = await pictureSequelize.findAndCountAllPictureTag({
                tagId: tagId
            }, offset, pageSize);
            var count = result.count;
            var rows = _.map(result.rows, function(row) {
                return row.picture;
            });
        }
        res.send({
            title: tag.name + "_" + branchInfo.shorttitle,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: tag.name,
            tags: branchInfo.pictureTags,
            tag: tag,
            pictures: rows,
            currentRender: "pictureTag",
            pagination: {
                totalNum: count,
                currentPage: currentPage,
                totalPage: Math.ceil(count / pageSize)
            }
        })
        // res.render('pictureTag', {
        //     title: tag.name + "_" + branchInfo.shorttitle,
        //     branchInfo: branchInfo,
        //     user: auth.getUser(req, res),
        //     pageTitle: tag.name,
        //     tags: branchInfo.pictureTags,
        //     tag: tag,
        //     pictures: rows,
        //     currentRender: "pictureTag",
        //     pagination: {
        //         totalNum: count,
        //         currentPage: currentPage,
        //         totalPage: Math.ceil(count / pageSize)
        //     }
        // });
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

exports.picture = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var pictureId = parseInt(req.params.pictureId);
        var picture = await pictureSequelize.findByPk(pictureId);
        if (!picture) throw new Error("找不到资源");
        res.send({
            title: picture.title + "_" + branchInfo.shorttitle,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: picture.title,
            picture: picture,
            currentRender: "picture"
        })
        // res.render('picture', {
        //     title: picture.title + "_" + branchInfo.shorttitle,
        //     branchInfo: branchInfo,
        //     user: auth.getUser(req, res),
        //     pageTitle: picture.title,
        //     picture: picture,
        //     currentRender: "picture"
        // });
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

exports.modelTag = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var pictureTagGroups = branchInfo.pictureTagGroups;
        var tagId = parseInt(req.params.tagId);
        var tag = _.find(branchInfo.modelTags, { tagId: tagId });
        if (!tag) throw new Error("找不到资源");
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
            var result = await modelSequelize.findAndCountAllPictureTag({
                tagId: tagId
            }, offset, pageSize);
            var count = result.count;
            var rows = _.map(result.rows, function(row) {
                return row.picture;
            });
        }
        res.send({
            title: tag.name + "_" + branchInfo.shorttitle,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: tag.name,
            tags: branchInfo.modelTags,
            tag: tag,
            models: rows,
            currentRender: "pictureTag",
            pagination: {
                totalNum: count,
                currentPage: currentPage,
                totalPage: Math.ceil(count / pageSize)
            }
        })
        // res.render('pictureTag', {
        //     title: tag.name + "_" + branchInfo.shorttitle,
        //     branchInfo: branchInfo,
        //     user: auth.getUser(req, res),
        //     pageTitle: tag.name,
        //     tags: branchInfo.modelTags,
        //     tag: tag,
        //     models: rows,
        //     currentRender: "pictureTag",
        //     pagination: {
        //         totalNum: count,
        //         currentPage: currentPage,
        //         totalPage: Math.ceil(count / pageSize)
        //     }
        // });
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

exports.model = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var pictureId = parseInt(req.params.modelId);
        var model = await modelSequelize.findByPk(modelId);
        if (!model) throw new Error("找不到资源");
        res.send({
            title: model.name + "_" + branchInfo.shorttitle,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: model.name,
            model: model,
            currentRender: "model"
        })
        // res.render('model', {
        //     title: model.name + "_" + branchInfo.shorttitle,
        //     branchInfo: branchInfo,
        //     user: auth.getUser(req, res),
        //     pageTitle: model.name,
        //     model: model,
        //     currentRender: "model"
        // });
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

exports.todayModel = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var todayModels = await modelSequelize.findAll({
            branchId: branchInfo.branchId,
            birthday: {
                [Op.endsWith]: moment().format("MM-DD")
            },
            statusId: 2
        }, 0, 10000, null, ["modelId", "name", "othername", "birthday", "job"]);
        res.send({
            title: "今日女神_" + branchInfo.shorttitle,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: "今日女神",
            models: todayModels,
            currentRender: "todayModels"
        })
        // res.render('todayModels', {
        //     title: "今日女神_" + branchInfo.shorttitle,
        //     branchInfo: branchInfo,
        //     user: auth.getUser(req, res),
        //     pageTitle: "今日女神",
        //     models: todayModels,
        //     currentRender: "todayModels"
        // });
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

exports.rankMainPage = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var ranks = await rankSequelize.findAll({
            branchId: branchInfo.branchId
        });
        var result = [];
        var moreRanks = [];
        for (var i = 0; i < ranks.length; i++) {
            var rank = ranks[i].get();
            if (i >= 18) moreRanks.push(rank);
            else {
                rank.models = await modelSequelize.findAll({
                    modelId: {
                        [Op.in]: rank.rankModelIds.slice(0, 10)
                    }
                }, 0, 10, null, ["modelId", "name", "othername", "birthday", "job"]);
                result.push(rank);
            }
        }
        res.send({
            title: "宅男女神排行榜_" + branchInfo.shorttitle,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: "宅男女神排行榜",
            ranks: result,
            moreRanks: moreRanks,
            currentRender: "rankMainPage"
        })
        // res.render('rankMainPage', {
        //     title: "宅男女神排行榜_" + branchInfo.shorttitle,
        //     branchInfo: branchInfo,
        //     user: auth.getUser(req, res),
        //     pageTitle: "宅男女神排行榜",
        //     ranks: result,
        //     moreRanks: moreRanks,
        //     currentRender: "rankMainPage"
        // });
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

exports.rankModelList = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var ranks = await rankSequelize.findAll({
            branchId: branchInfo.branchId
        });
        var rankId = parseInt(req.params.rankId);
        var currentPage = parseInt(req.params.page || 1);
        var pageSize = 30;
        var offset = (currentPage - 1) * pageSize;
        var rank = _.find(ranks, { rankId: rankId });
        if (!rank) throw new Error("找不到资源")
        rank.models = await modelSequelize.findAll({
            modelId: {
                [Op.in]: rank.rankModelIds.slice(offset, offset + 20)
            }
        }, 0, 10, null, ["modelId", "name", "othername", "birthday", "job"]);

        res.send({
            title: rank.name + "排行榜_" + branchInfo.shorttitle,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            pageTitle: rank.name,
            rank: rank,
            ranks: ranks,
            currentRender: "rankMainPage"
        })
        // res.render('rankMainPage', {
        //     title: "宅男女神排行榜_" + branchInfo.shorttitle,
        //     branchInfo: branchInfo,
        //     user: auth.getUser(req, res),
        //     pageTitle: "宅男女神排行榜",
        //     ranks: result,
        //     moreRanks: moreRanks,
        //     currentRender: "rankMainPage"
        // });
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

exports.findModel = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        var body = req.body;
        var currentPage = parseInt(req.body.page || 1);
        var pageSize = parseInt(req.body.pageSize || 30);
        var offset = (currentPage - 1) * pageSize;
        var where = {};
        if (body.country) where.birthIn = {
            [Op.like]: '%' + body.country + '%'
        }
        if (body.constellation) where.constellation = body.constellation;
        if (body.bloodType) where.bloodType = body.bloodType;
        if (body.job) where.job = {
            [Op.like]: '%' + body.job + '%'
        };
        if (body.age) {
            var start = moment().year() - body.age[0];
            var end = moment().year() - body.age[1];
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
        res.send({
            title: "找女神_" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "findModel",
            pageTitle: "找女神",
            models: models,
            pagination: {
                totalNum: result.count,
                currentPage: currentPage,
                totalPage: Math.ceil(result.count / pageSize)
            }
        });
        // res.render('findModel', {
        //     title: "找女神_" + branchInfo.title,
        //     branchInfo: branchInfo,
        //     user: auth.getUser(req, res),
        //     currentRender: "findModel",
        //     pageTitle: "找女神",
        //     models: models,
        //     pagination: {
        //         totalNum: result.count,
        //         currentPage: currentPage,
        //         totalPage: Math.ceil(result.count / pageSize)
        //     }
        // });
    } catch (err) {
        console.log(err);
        res.render('error', {
            message: "请求错误！",
            error: err ? JSON.stringify(err) : ""
        });
    }
};

exports.search = async function(req, res) {
    try {
        var branchInfo = req.branchInfo;
        if (!req.query.keyword) {
            res.render('search', {
                title: "输入名称关键字_" + branchInfo.title,
                branchInfo: branchInfo,
                user: auth.getUser(req, res),
                currentRender: "search",
                keywords: "",
                pageTitle: "无搜索内容，搜索请输入名称关键字",
                books: [],
                pagination: null
            });
            return;
        }
        var searchContent = req.query.keyword.replace(/^\s+|\s+$/g, "");
        var models = await modelSequelize.findAll({
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
        })
        var pictures = await pictureSequelize.findAll({
            branchId: branchInfo.branchId,
            title: {
                [Op.like]: '%' + searchContent + '%'
            }
        }, ["pictureId", "title"])
        res.send({
            title: "搜索_" + searchContent + "_" + branchInfo.title,
            branchInfo: branchInfo,
            user: auth.getUser(req, res),
            currentRender: "search",
            pageTitle: "搜索 " + searchContent + " 的结果",
            models: models,
            pictures: pictures,
            keywords: searchContent
        });
        // res.render('search', {
        //     title: "搜索_" + searchContent + "_" + branchInfo.title,
        //     branchInfo: branchInfo,
        //     user: auth.getUser(req, res),
        //     currentRender: "search",
        //     pageTitle: "搜索 " + searchContent + " 的结果",
        //     models: models,
        //     pictures: pictures,
        //     keywords: searchContent
        // });
    } catch (err) {
        console.log(err);
        res.render('error', {
            message: "请求错误！",
            error: err ? JSON.stringify(err) : ""
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