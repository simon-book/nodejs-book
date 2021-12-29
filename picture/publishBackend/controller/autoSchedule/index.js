var _ = require('lodash');
var schedule = require('node-schedule');
var moment = require('moment');
var copyController = require("../copy_invshen/copyController.js");
var copyImgController = require("../copy_invshen/copyImgController.js");
var syncDataController1 = require("../copy_invshen/syncDataController1.js");
var invshenBaiduController = require("../copy_invshen/baiduController.js");
var invshenGoogleController = require("../copy_invshen/googleController.js");

var copyDa12Controller = require("../copy_da12/copyController.js");
var da12GoogleController = require("../copy_da12/googleController.js");

var copyTuaoxController = require("../copy_tuaox/copyController.js");
var copyTuaoxImgController = require("../copy_tuaox/copyImgController.js");

exports.auto_schedule_invshen = function() {
    setInterval(async function() {
        var branchInfo = await copyController.queryBranchInfo();
        await copyController.copy_articles(true);
        await copyController.copy_category_pictures(null, null, null, true);
        await copyController.copy_all_tag_models(null, true);
        await copyController.complete_all_model_info();
        if (branchInfo.copyPictureToOss) {
            await copyImgController.copy_articles_img();
            await copyImgController.copy_models_img();
            await copyImgController.copy_gallerys_img();
        }
        if (branchInfo.copyPictureFromRemoteOss) {
            await syncDataController1.get_remote_oss_data({
                copySrc: "fnvshen",
                getHost: branchInfo.copyPictureFromRemoteOss,
                getPort: "4800",
                copyArticle: true,
                copyModel: true,
                copyPicture: true,
                startDate: "2021-11-10"
            })
        }
    }, 12 * 60 * 60 * 1000)
    schedule.scheduleJob('0 0 12 * * *', async function() {
        var branchInfo = await copyController.queryBranchInfo();
        await copyController.copy_rank_models();
        if (branchInfo.submitUrlToBaidu) await invshenBaiduController.submitNew(branchInfo.domain);
        if (branchInfo.submitUrlToGoogle) await invshenGoogleController.createSitemapFiles(branchInfo.domain);
    });
}


exports.trigger_invshen_scheduele = async function() {
    console.log("手动触发更新最近1天数据！");
    var branchInfo = await copyController.queryBranchInfo();
    await copyController.copy_articles(true);
    await copyController.copy_category_pictures(null, null, null, true);
    await copyController.copy_all_tag_models(null, true);
    // await copyController.copy_rank_models();
    await copyController.complete_all_model_info();
    if (branchInfo.copyPictureToOss) {
        await copyImgController.copy_articles_img();
        await copyImgController.copy_models_img();
        await copyImgController.copy_gallerys_img();
    }
    if (branchInfo.copyPictureFromRemoteOss) {
        await syncDataController1.get_remote_oss_data({
            copySrc: "fnvshen",
            getHost: branchInfo.copyPictureFromRemoteOss,
            getPort: "4800",
            copyArticle: true,
            copyModel: true,
            copyPicture: true,
            startDate: "2021-11-10"
        })
    }
    if (branchInfo.submitUrlToBaidu) await invshenBaiduController.submitNew(branchInfo.domain);
    if (branchInfo.submitUrlToGoogle) await invshenGoogleController.createSitemapFiles(branchInfo.domain);
}


exports.auto_schedule_da12 = function() {
    setInterval(async function() {
        await copyDa12Controller.queryBranchInfo();
        copyDa12Controller.copy_all_pictures(null, true);
    }, 12 * 60 * 60 * 1000)
    schedule.scheduleJob('0 0 0 * * *', async function() {
        console.log("更新最近1天数据！");
        await copyDa12Controller.queryBranchInfo();
        copyDa12Controller.copy_home_rank();
        await da12GoogleController.createSitemapFiles("www.9iktb.com");
    });
}

exports.auto_schedule_tuaox = function() {
    schedule.scheduleJob('0 0 2 * * *', async function() {
        console.log("更新最近1天数据！");
        var branchInfo = await copyTuaoxController.queryBranchInfo();
        copyTuaoxController.copy_all_pictures(null, true);
        if (branchInfo.copyPictureToOss) {
            await copyTuaoxImgController.copy_gallerys_img();
        }
    });
}