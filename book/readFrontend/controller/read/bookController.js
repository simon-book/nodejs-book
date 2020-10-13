var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var bookCategorySequelize = require('../../data/sequelize/book/bookCategorySequelize.js');
var tagSequelize = require('../../data/sequelize/book/tagSequelize.js');
var bookSequelize = require('../../data/sequelize/book/bookSequelize.js');
var bookChapterSequelize = require('../../data/sequelize/book/bookChapterSequelize.js');

exports.listCategory = async function(branchId) {
    try {
        var list = await bookCategorySequelize.findAll({
            branchId: branchId
        });
        return list;
    } catch (err) {
        console.error(err);
        return [];
    }
}

exports.listTag = async function(branchId) {
    try {
        var list = await tagSequelize.findAll({
            branchId: branchId
        });
        return list;
    } catch (err) {
        console.error(err);
        return [];
    }
}

exports.listCategoryAndTag = async function(branchId) {
    try {
        var categoryList = await bookCategorySequelize.findAll({
            branchId: branchId
        });
        var tagList = await tagSequelize.findAll({
            branchId: branchId
        });
        return {
            categoryList: categoryList,
            tagList: tagList
        };
    } catch (err) {
        console.error(err);
        return [];
    }
}

exports.listBook = async function(body) {
    try {
        if (!body || !body.branchId) throw new Error("缺少branchId");
        var pageSize = body.pageSize || 20;
        var page = body.page || 1;
        var offset = pageSize * (page - 1);
        var where = {
            branchId: body.branchId
        }
        if (body.categoryId) where.categoryId = body.categoryId;
        if (body.bookType) where.bookType = body.bookType;
        if (body.publishStatus) where.publishStatus = body.publishStatus;
        if (body.chargeType) where.chargeType = body.chargeType;
        if (body.searchContent) where[Op.or] = [{
            title: {
                [Op.like]: '%' + body.searchContent + '%'
            }
        }, {
            writer: {
                [Op.like]: '%' + body.searchContent + '%'
            }
        }];
        if (body.tagId) {
            var tagWhere = {
                tagId: body.tagId
            }
        }
        var list = await bookSequelize.findAndCountAll(where, offset, pageSize, null, tagWhere);
        return {
            list: _.map(list[1], function(book) {
                // book = book.get();
                // book.categoryName = book.category ? book.category.name : "";
                // delete book.category;
                book.tags = _.map(book.tags, function(tag) {
                    tag = tag.get();
                    delete tag.book_tags;
                    return tag;
                })
                return book;
            }),
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