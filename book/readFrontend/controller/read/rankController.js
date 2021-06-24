var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var rankSequelize = require('../../data/sequelize/rank/rankSequelize.js');
var pageSequelize = require('../../data/sequelize/rank/pageSequelize.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');

// exports.listRank = async function(branchId, recommend, rank) {
//     try {
//         var list = await rankSequelize.findAll({
//             branchId: branchId
//         });
//         for (var i = 0; i < list.length; i++) {
//             if (list[i].rankBookIds && list[i].rankBookIds.length) {
//                 list[i].books = await bookSequelize.findAll({
//                     bookId: {
//                         [Op.in]: list[i].rankBookIds.slice(0, 30)
//                     }
//                 }, true);
//             }
//             // if (recommend) {
//             //     list[i].books = await bookSequelize.findAll({
//             //         bookId: {
//             //             [Op.in]: list[i].recommendBookIds
//             //         }
//             //     }, true);
//             // } else if (rank) {
//             //     list[i].books = await bookSequelize.findAll({
//             //         bookId: {
//             //             [Op.in]: list[i].rankBookIds
//             //         }
//             //     }, true);
//             // }
//         }
//         _.remove(list, function(item) {
//             return !item.books || !item.books.length;
//         })
//         return list;
//     } catch (err) {
//         console.error(err);
//         return [];
//     }
// }

exports.listPaihang = async function(rankId, page, pageSize) {
    try {
        if (!page) page = 1;
        if (!pageSize) pageSize = 20;
        var rank = await rankSequelize.findOne({
            rankId: rankId
        });
        rank.list = await bookSequelize.findAll({
            bookId: {
                [Op.in]: rank.rankBookIds.slice((page - 1) * pageSize, page * pageSize)
            }
        }, true);
        rank.pagination = {
            totalNum: rank.rankBookIds.length,
            totalPage: Math.ceil(rank.rankBookIds.length / pageSize),
            page: page,
            pageSize: pageSize
        }
        // rank.totalPage = Math.ceil(rank.rankBookIds.length / pageSize);
        // rank.totalNum = rank.rankBookIds.length;
        return rank;
    } catch (err) {
        console.error(err);
        return null;
    }
}

exports.listPage = async function(branchId, recommend, rank) {
    try {
        var list = await pageSequelize.findAll({
            branchId: branchId
        });
        for (var i = 0; i < list.length; i++) {
            if (list[i].recommendBookIds && list[i].recommendBookIds.length) {
                list[i].recommendBooks = await bookSequelize.findAll({
                    bookId: {
                        [Op.in]: list[i].recommendBookIds
                    }
                }, true);
            }
            if (list[i].rankBookIds && list[i].rankBookIds.length) {
                list[i].rankBooks = await bookSequelize.findAll({
                    bookId: {
                        [Op.in]: list[i].rankBookIds
                    }
                }, true);
            }
            if (list[i].hotBookIds && list[i].hotBookIds.length) {
                list[i].hotBooks = await bookSequelize.findAll({
                    bookId: {
                        [Op.in]: list[i].hotBookIds
                    }
                }, true);
            }
        }
        return list;
    } catch (err) {
        console.error(err);
        return [];
    }
}