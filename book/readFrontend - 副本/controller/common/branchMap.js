var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var util = require('../../util/index.js');
var branchSequelize = require('../../data/sequelize/branch/branchSequelize.js');
var bookCategorySequelize = require('../../data/sequelize/book/bookCategorySequelize.js');
var tagSequelize = require('../../data/sequelize/book/tagSequelize.js');
var rankSequelize = require('../../data/sequelize/rank/rankSequelize.js');

var hostMap = {
    "localhost": {
        branchId: 1,
        title: "笔趣阁_书友最值得收藏的网络小说阅读网",
        shorttitle: "笔趣阁",
        keywords: "笔趣阁,网络小说,小说阅读网,免费小说,小说,biquge",
        description: "笔趣阁是广大书友最值得收藏的网络小说阅读网，网站收录了当前最火热的网络小说，免费提供高质量的小说最新章节，是广大网络小说爱好者必备的小说阅读网。",
        // categoryMap: [
        //     ["玄幻小说", 1],
        //     ["修真小说", 2],
        //     ["都市小说", 5],
        //     ["穿越小说", 4],
        //     ["网游小说", 3],
        //     ["科幻小说", 6]
        // ],
        // rankMap: [
        //     ["总点击榜", 1],
        //     ["周点击榜", 2],
        //     ["月点击榜", 3],
        //     ["周推荐榜", 4],
        //     ["月推荐榜", 5],
        //     ["总推荐榜", 6],
        //     ["总收藏榜", 7],
        //     ["总字数榜", 8],
        //     ["最新入库", 9],
        //     ["最近更新", 10],
        //     ["新书榜单", 11]
        // ]
    }
};

exports.hostMap = hostMap;
exports.queryBranchInfo = async function() {
    try {
        for (var url in hostMap) {
            var branchId = hostMap[url].branchId;
            var savedBranch = await branchSequelize.findOneById(branchId);
            if (savedBranch && savedBranch.copyParams) {
                hostMap[url].branchId = savedBranch.branchId;
                hostMap[url].copyUrl = savedBranch.copyParams.copyUrl;
                hostMap[url].pcCopyUrl = savedBranch.copyParams.pcCopyUrl;
                hostMap[url].charset = savedBranch.copyParams.charset;
                hostMap[url].categoryPage = savedBranch.copyParams.categoryPage;
                hostMap[url].rankPage = savedBranch.copyParams.rankPage;
                hostMap[url].categoryMap = [];
                hostMap[url].rankMap = [];
                var categories = await bookCategorySequelize.findAll({
                    branchId: hostMap[url].branchId
                })
                categories = _.sortBy(categories, function(item) {
                    return item.orderIndex || 0;
                })
                _.forEach(categories, function(item) {
                    hostMap[url].categoryMap.push([item.name, item.categoryId]);
                })
                var ranks = await rankSequelize.findAll({
                    branchId: hostMap[url].branchId
                })
                ranks = _.sortBy(ranks, function(item) {
                    return item.orderIndex || 0;
                })
                _.forEach(ranks, function(item) {
                    hostMap[url].rankMap.push([item.name, item.rankId])
                })
            }
        }
    } catch (err) {
        console.log(err);
    }
}