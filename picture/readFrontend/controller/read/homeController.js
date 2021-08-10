var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var branchSequelize = require('../../data/sequelize/branch/branchSequelize.js');
var pageBlockSequelize = require('../../data/sequelize/pageBlock/pageBlockSequelize.js');
var chargeItemSequelize = require('../../data/sequelize/charge/chargeItemSequelize.js');
var bookCategorySequelize = require('../../data/sequelize/book/bookCategorySequelize.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');
var tagSequelize = require('../../data/sequelize/book/tagSequelize.js');

exports.index = async function(branchId) {
    try {
        //可在管理后台一键生成首页内容，缩短数据查询时间
        var blocks = await pageBlockSequelize.findAll({
            branchId: branchId
        });
        var list = await pageBlockSequelize.findIndexBlocksBooks(blocks);
        _.forEach(blocks, function(block, index) {
            // block = block.get();
            block.books = _.map(list[index], "book");
        })
        return blocks;
    } catch (err) {
        console.error(err);
        return [];
    }
}

exports.blockBooks = async function(body) {
    try {
        if (!body || !body.blockId) throw new Error("缺少blockId");
        var pageSize = body.pageSize || 20;
        var page = body.page || 1;
        var offset = pageSize * (page - 1);
        var list = await pageBlockSequelize.findBlockBooks(body.blockId, offset, pageSize);
        return {
            list: _.map(list.rows, "book"),
            pagination: {
                totalNum: list.count,
                page: page,
                pageSize: pageSize
            }
        }
    } catch (err) {
        console.error(err);
        return [];
    }
}

exports.rankBooks = async function(body) {
    try {
        if (!body || !body.branchId) throw new Error("缺少branchId");
        var pageSize = body.pageSize || 20;
        var page = body.page || 1;
        var offset = pageSize * (page - 1);
        var list = await bookSequelize.findAndCountAll({
            branchId: body.branchId
        }, offset, pageSize, [
            ["readCount", "DESC"]
        ]);
        return {
            list: list[1],
            pagination: {
                totalNum: list[0],
                page: page,
                pageSize: pageSize
            }
        }
    } catch (err) {
        console.error(err);
        return [];
    }
}

exports.vipBlockBooks = async function(body) {
    try {
        if (!body || !body.branchId) throw new Error("缺少branchId");
        var pageSize = body.pageSize || 20;
        var page = body.page || 1;
        var offset = pageSize * (page - 1);
        var list = await bookSequelize.findAndCountAll({
            branchId: body.branchId,
            vipOnly: true
        }, offset, pageSize, [
            ["updatedAt", "DESC"]
        ]);
        return {
            list: list[1],
            pagination: {
                totalNum: list[0],
                page: page,
                pageSize: pageSize
            }
        }
    } catch (err) {
        console.error(err);
        return [];
    }
}