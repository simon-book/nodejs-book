var Sequelize = require('sequelize');
var _ = require('lodash');
var Op = Sequelize.Op;
var fs = require('fs');
var fsPromises = fs.promises;
var moment = require('moment');
var cheerio = require('cheerio');
var http = require('https');
var util = require('../../util/index.js');
var httpGateway = require('../../data/http/httpGateway.js')
var commonController = require('./commonController.js')
var copyController = require('./copyController.js')
var branchSequelize = require('../../data/sequelize/branch/branchSequelize.js');
var modelSequelize = require('../../data/sequelize/picture/modelSequelize.js');
var pictureSequelize = require('../../data/sequelize/picture/pictureSequelize.js');
var articleSequelize = require('../../data/sequelize/picture/articleSequelize.js');

exports.check_all_models = async function(maxId) {
    try {
        var branch = await copyController.queryBranchInfo();
        for (var i = maxId; i > 0; i--) {
            var originId = i;
            await check_one_models(originId, branch);
        }
    } catch (err) {
        console.log(err);
    }
}

async function check_one_models(originId, branch) {
    try {
        if (!branch) branch = await copyController.queryBranchInfo();
        var savedModel = await modelSequelize.findOneModel({
            branchId: branch.branchId,
            originId: originId.toString()
        })
        if (savedModel && savedModel.statusId == 2) {
            console.log(originId, "exist!");
            return;
        }
        if (savedModel && savedModel.statusId == 3) {
            console.log(originId, "exist but not invalid !");
            return;
        }
        if (savedModel && savedModel.statusId == 1) {
            console.log(originId, "exist to complete !");
            return;
        }
        var bookHref = "/girl/" + originId + "/";
        var html = await httpGateway.htmlStartReq(branch.pcCopyUrl, bookHref, branch.charset);
        var $ = cheerio.load(html, {
            decodeEntities: false
        });
        if (!savedModel) {
            savedModel = await modelSequelize.create({
                branchId: branch.branchId,
                originId: originId
            })
            console.log(originId, "added!");
        }
        // await copyController.complete_one_model_info(savedModel);
    } catch (err) {
        console.log(originId, err);
    }
}

exports.check_one_models = check_one_models


exports.check_all_pictures = async function(maxId) {
    try {
        var branch = await copyController.queryBranchInfo();
        for (var i = maxId; i > 0; i--) {
            var originId = i;
            await check_one_pictures(originId, branch);
        }
    } catch (err) {
        console.log(err);
    }
}

async function check_one_pictures(originId, branch) {
    try {
        if (!branch) branch = await copyController.queryBranchInfo();
        var savedPicture = await pictureSequelize.findOne({
            branchId: branch.branchId,
            originId: originId.toString()
        })
        if (savedPicture) {
            console.log(originId, "exist!");
            return;
        }
        var bookHref = "/g/" + originId + "/";
        var html = await httpGateway.htmlStartReq(branch.pcCopyUrl, bookHref, branch.charset);
        var $ = cheerio.load(html, {
            decodeEntities: false
        });
        await copyController.create_picture(originId);
        console.log(originId, "added!");
    } catch (err) {
        console.log(originId, err);
    }
}

exports.check_one_pictures = check_one_pictures;