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

// var isProd = true;
var isProd = false;

var hostMap = isProd ? prodMap.hostMap : testMap.hostMap;
exports.hostMap = hostMap;
exports.queryBranchInfo = async function() {
    try {
        var includeBranches = await branchSequelize.findAll()
        hostMap.includeBranches = {};
        _.forEach(includeBranches, function(branch) {
            hostMap.includeBranches[branch.branchId] = {
                branchId: branch.branchId,
                name: branch.name,
                copySrc: branch.copySrc,
                charset: branch.charset,
                copyUrl: branch.copyParams.copyUrl,
                pictureUrl: branch.copyParams.pictureUrl,
                pcCopyUrl: branch.copyParams.pcCopyUrl
            }
        })
        for (var url in hostMap) {
            var branchId = hostMap[url].branchId;
            var savedBranch = await branchSequelize.findOneById(branchId);
            if (savedBranch && savedBranch.copyParams) {
                hostMap[url].branchId = savedBranch.branchId;
                hostMap[url].copySrc = savedBranch.copySrc;
                hostMap[url].copyUrl = savedBranch.copyParams.copyUrl;
                hostMap[url].pictureUrl = savedBranch.copyParams.pictureUrl;
                hostMap[url].pcCopyUrl = savedBranch.copyParams.pcCopyUrl;
                hostMap[url].charset = savedBranch.copyParams.charset;

                hostMap[url].pictureTagGroups = [];
                hostMap[url].modelTagGroups = [];
                hostMap[url].pictureTags = [];
                hostMap[url].modelTags = [];
                var TagGroups = await tagSequelize.findAllTagGroup({
                    branchId: hostMap[url].branchId
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
                        hostMap[url].pictureTagGroups.push(group);
                        hostMap[url].pictureTags = _.concat(hostMap[url].pictureTags, group.tags);
                    } else if (group.type == "model") {
                        hostMap[url].modelTagGroups.push(group);
                        hostMap[url].modelTags = _.concat(hostMap[url].modelTags, group.tags);
                    }
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
                hostMap[url].includeBranches = hostMap.includeBranches;
            }
        }
    } catch (err) {
        console.log(err);
    }
}