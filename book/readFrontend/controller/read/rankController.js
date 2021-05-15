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
        if (!page) page = 0;
        if (!pageSize) pageSize = 20;
        var rank = await rankSequelize.findOne({
            rankId: rankId
        });
        rank.books = await bookSequelize.findAll({
            bookId: {
                [Op.in]: rank.rankBookIds.slice(page, page + pageSize)
            }
        }, true);
        rank.totalPage = Math.ceil(rank.rankBookIds.length / 20);
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
            // if (recommend) {
            list[i].recommendBooks = await bookSequelize.findAll({
                bookId: {
                    [Op.in]: list[i].recommendBookIds
                }
            }, true);
            // } else if (rank) {
            list[i].rankBooks = await bookSequelize.findAll({
                bookId: {
                    [Op.in]: list[i].rankBookIds
                }
            }, true);
            // }
        }
        return list;
    } catch (err) {
        console.error(err);
        return [];
    }
}