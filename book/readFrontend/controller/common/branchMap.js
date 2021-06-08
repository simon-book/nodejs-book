var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var util = require('../../util/index.js');
var branchSequelize = require('../../data/sequelize/branch/branchSequelize.js');
var bookCategorySequelize = require('../../data/sequelize/book/bookCategorySequelize.js');
var tagSequelize = require('../../data/sequelize/book/tagSequelize.js');
var rankSequelize = require('../../data/sequelize/rank/rankSequelize.js');

var testMap = require('./testMap.js');
var prodMap = require('./prodMap.js');

var isProd = true;
// var isProd = false;

var hostMap = isProd ? prodMap.hostMap : testMap.hostMap;
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
                // hostMap[url].categoryPage = savedBranch.copyParams.categoryPage;
                // hostMap[url].rankPage = savedBranch.copyParams.rankPage;
                hostMap[url].categoryMap = [];
                hostMap[url].rankMap = [];
                var categories = await bookCategorySequelize.findAll({
                    branchId: hostMap[url].branchId
                })
                categories = _.sortBy(categories, function(item) {
                    return item.orderIndex || 0;
                })
                _.forEach(categories, function(item) {
                    hostMap[url].categoryMap.push([item.name, item.categoryId, item.relatedCategoryIds, item.name == "其他小说" ? false : true, item.recommendBooks ? item.recommendBooks.slice(0, 3000) : null]);
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