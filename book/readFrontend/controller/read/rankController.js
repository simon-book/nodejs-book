var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var rankSequelize = require('../../data/sequelize/rank/rankSequelize.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');

exports.listRank = async function(branchId, recommend, rank) {
    try {
        var list = await rankSequelize.findAll({
            branchId: branchId
        });
        for (var i = 0; i < list.length; i++) {
            if (recommend) {
                list[i].books = await bookSequelize.findAll({
                    bookId: {
                        [Op.in]: list[i].recommendBookIds
                    }
                }, true);
            } else if (rank) {
                list[i].books = await bookSequelize.findAll({
                    bookId: {
                        [Op.in]: list[i].rankBookIds
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