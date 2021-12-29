var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var util = require('../../util/index.js');
var branchSequelize = require('../../data/sequelize/branch/branchSequelize.js');
var tagSequelize = require('../../data/sequelize/picture/tagSequelize.js');
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
                hostMap[url].copySrc = savedBranch.copySrc;
                hostMap[url].qq = savedBranch.qq;
                hostMap[url].email = savedBranch.email;
                hostMap[url].copyUrl = savedBranch.copyParams.copyUrl;
                hostMap[url].pictureUrl = savedBranch.copyParams.pictureUrl;
                hostMap[url].pictureUrl1 = savedBranch.copyParams.pictureUrl1;
                hostMap[url].pcCopyUrl = savedBranch.copyParams.pcCopyUrl;
                hostMap[url].charset = savedBranch.copyParams.charset;

                hostMap[url].rankMap = [];
                hostMap[url].tags = [];
                var tags = await tagSequelize.findAll({
                    branchId: hostMap[url].branchId
                }, 0, 1000, [
                    ["orderIndex", "asc"]
                ])
                _.forEach(tags, function(tag) {
                    hostMap[url].tags.push({
                        tagId: tag.tagId,
                        name: tag.name,
                        remark: tag.remark,
                        originId: tag.originId,
                        orderIndex: tag.orderIndex,
                        pictureCount: tag.pictureCount || 0
                    });
                })
                var ranks = await rankSequelize.findAll({
                    branchId: hostMap[url].branchId
                })
                ranks = _.sortBy(ranks, function(item) {
                    return item.orderIndex || 0;
                })
                _.forEach(ranks, function(item) {
                    hostMap[url].rankMap.push({
                        rankId: item.rankId,
                        name: item.name,
                        originId: item.originId,
                        rankModelIds: item.rankModelIds,
                        rankPictureIds: item.rankPictureIds,
                        orderIndex: item.orderIndex,
                    })
                })
            }
        }
    } catch (err) {
        console.log(err);
    }
}