var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');
var modelSequelize = require('../../data/sequelize/picture/modelSequelize.js');
var pictureSequelize = require('../../data/sequelize/picture/pictureSequelize.js');
var rankSequelize = require('../../data/sequelize/rank/rankSequelize.js');

exports.listOneRank = async function(where, start, end) {
    try {
        var rank = await rankSequelize.findOne(where);
        if (start || end) {
            if (rank.rankModelIds && rank.rankModelIds.length) {
                rank.models = await modelSequelize.findAllWithoutTags({
                    modelId: {
                        [Op.in]: rank.rankModelIds.slice(start || 0, end || 10000)
                    }
                }, null, null, null, ["modelId", "name", "othername", "birthday", "job"]);
            }
        }
        return rank;
    } catch (err) {
        console.error(err);
        return [];
    }
}

// exports.listRank = async function(rankId, page, pageSize) {
//     try {
//         if (!page) page = 1;
//         if (!pageSize) pageSize = 20;
//         var rank = await rankSequelize.findOne({
//             rankId: rankId
//         });
//         rank.list = await bookSequelize.findAll({
//             bookId: {
//                 [Op.in]: rank.rankBookIds.slice((page - 1) * pageSize, page * pageSize)
//             }
//         }, true);
//         rank.pagination = {
//             totalNum: rank.rankBookIds.length,
//             totalPage: Math.ceil(rank.rankBookIds.length / pageSize),
//             page: page,
//             pageSize: pageSize
//         }
//         // rank.totalPage = Math.ceil(rank.rankBookIds.length / pageSize);
//         // rank.totalNum = rank.rankBookIds.length;
//         return rank;
//     } catch (err) {
//         console.error(err);
//         return null;
//     }
// }

// exports.listPage = async function(branchId, recommend, rank) {
//     try {
//         var list = await pageSequelize.findAll({
//             branchId: branchId
//         });
//         for (var i = 0; i < list.length; i++) {
//             if (list[i].recommendBookIds && list[i].recommendBookIds.length) {
//                 list[i].recommendBooks = await bookSequelize.findAll({
//                     bookId: {
//                         [Op.in]: list[i].recommendBookIds
//                     }
//                 }, true);
//             }
//             if (list[i].rankBookIds && list[i].rankBookIds.length) {
//                 list[i].rankBooks = await bookSequelize.findAll({
//                     bookId: {
//                         [Op.in]: list[i].rankBookIds
//                     }
//                 }, true);
//             }
//             if (list[i].hotBookIds && list[i].hotBookIds.length) {
//                 list[i].hotBooks = await bookSequelize.findAll({
//                     bookId: {
//                         [Op.in]: list[i].hotBookIds
//                     }
//                 }, true);
//             }
//         }
//         return list;
//     } catch (err) {
//         console.error(err);
//         return [];
//     }
// }