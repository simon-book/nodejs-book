var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var moment = require('moment');

var adminHttpResult = require('../../util/adminHttpResult.js');
var errHandler = require('../../util/errHandler.js');
var util = require('../../util/index.js');
var pageBlockSequelize = require('../../data/sequelize/pageBlock/pageBlockSequelize.js');

exports.create = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.body;
        if (!body || !body.name) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        body.branchId = currentUser.branchId;
        var added = await pageBlockSequelize.create(body);
        adminHttpResult.jsonSuccOut(req, res, added);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.update = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.body;
        if (!body || !body.blockId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var pageBlock = await pageBlockSequelize.findByPk(body.blockId);
        if (!pageBlock || pageBlock.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "PAGE_BLOCK_ERROR", "pageBlock不存在");
            return;
        }
        if (body.name) pageBlock.set("name", body.name);
        if (body.carousel) pageBlock.set("carousel", body.carousel);
        if (body.orderIndex) pageBlock.set("orderIndex", body.orderIndex);
        if (body.label) pageBlock.set("label", body.label);
        await pageBlock.save();
        adminHttpResult.jsonSuccOut(req, res, true);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.delete = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.params;
        if (!body || !body.blockId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var pageBlock = await pageBlockSequelize.findByPk(body.blockId);
        if (!pageBlock || pageBlock.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "PAGE_BLOCK_ERROR", "pageBlock不存在");
            return;
        }
        pageBlock.set("statusId", 0);
        await pageBlock.save();
        adminHttpResult.jsonSuccOut(req, res, true);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.list = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        // var body = req.body;
        // if (!body) body = {};
        // var pageSize = body.pageSize || 20;
        // var page = body.page || 1;
        // var offset = pageSize * (page - 1);
        var list = await pageBlockSequelize.findAll({
            branchId: currentUser.branchId,
        });
        adminHttpResult.jsonSuccOut(req, res, list);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.addBooks = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.body;
        if (!body || !body.blockId || !body.bookIds || !body.bookIds.length) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var pageBlock = await pageBlockSequelize.findByPk(body.blockId);
        if (!pageBlock || pageBlock.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "PAGE_BLOCK_ERROR", "pageBlock不存在");
            return;
        }
        await pageBlock.addBooks(body.bookIds);
        adminHttpResult.jsonSuccOut(req, res, true);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.deleteBooks = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.body;
        if (!body || !body.blockId || !body.bookIds || !body.bookIds.length) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var pageBlock = await pageBlockSequelize.findByPk(body.blockId);
        if (!pageBlock || pageBlock.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "PAGE_BLOCK_ERROR", "pageBlock不存在");
            return;
        }
        await pageBlock.removeBooks(body.bookIds);
        adminHttpResult.jsonSuccOut(req, res, true);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.listBooks = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.params;
        if (!body || !body.blockId) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var pageBlock = await pageBlockSequelize.findByPk(body.blockId);
        if (!pageBlock || pageBlock.branchId != currentUser.branchId) {
            adminHttpResult.jsonFailOut(req, res, "PAGE_BLOCK_ERROR", "pageBlock不存在");
            return;
        }
        var list = await pageBlock.getBooks();
        list = _.sortBy(list, function(book) {
            return book.page_block_books.orderIndex;
        })
        adminHttpResult.jsonSuccOut(req, res, list);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}

exports.orderBooks = async function(req, res) {
    try {
        var currentUser = req.currentUser;
        var body = req.body;
        if (!body || !body.id || !body.orderIndex) {
            adminHttpResult.jsonFailOut(req, res, "PARAM_INVALID");
            return;
        }
        var pageBlockBook = await pageBlockSequelize.findBlockBookByPk(body.id);
        if (!pageBlockBook) {
            adminHttpResult.jsonFailOut(req, res, "PAGE_BLOCK_ERROR", "关联关系不存在！");
            return;
        }
        pageBlockBook.set("orderIndex", body.orderIndex);
        await pageBlockBook.save();
        adminHttpResult.jsonSuccOut(req, res, true);
    } catch (err) {
        errHandler.setHttpError(req.originalUrl, req.body, err);
        adminHttpResult.jsonFailOut(req, res, "SERVICE_INVALID", null, err);
        return;
    }
}