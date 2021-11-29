var _ = require('lodash');
var schedule = require('node-schedule');
var moment = require('moment');
var copyController = require("../copy_invshen/copyController.js");
var copyImgController = require("../copy_invshen/copyImgController.js");
var syncDataController1 = require("../copy_invshen/syncDataController1.js");
var baiduController = require("../seo/baiduController.js");
var googleController = require("../seo/googleController.js");

var copyDa12Controller = require("../copy_da12/copyController.js");

exports.auto_schedule_invshen = function() {
    //每日更新
    schedule.scheduleJob('0 0 0 * * *', async function() {
        var branchInfo = await copyController.queryBranchInfo();
        await copyController.copy_articles(true);
        await copyController.copy_category_pictures(null, null, null, true);
        await copyController.copy_category_models(null, null, null, true);
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
    });
    schedule.scheduleJob('0 0 4 * * *', async function() {
        var branchInfo = await copyController.queryBranchInfo();
        await copyController.copy_articles(true);
        await copyController.copy_category_pictures(null, null, null, true);
        await copyController.copy_category_models(null, null, null, true);
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
    });
    schedule.scheduleJob('0 0 8 * * *', async function() {
        var branchInfo = await copyController.queryBranchInfo();
        await copyController.copy_articles(true);
        await copyController.copy_category_pictures(null, null, null, true);
        await copyController.copy_category_models(null, null, null, true);
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
    });
    schedule.scheduleJob('0 0 12 * * *', async function() {
        var branchInfo = await copyController.queryBranchInfo();
        await copyController.copy_articles(true);
        await copyController.copy_category_pictures(null, null, null, true);
        await copyController.copy_category_models(null, null, null, true);
        await copyController.copy_rank_models();
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
        if (branchInfo.submitUrlToBaidu) await baiduController.submitNew("www.99nvshen.com");
        if (branchInfo.submitUrlToGoogle) await googleController.createSitemapFiles("www.99nvshen.com");
    });
}


exports.trigger_invshen_scheduele = async function() {
    console.log("手动触发更新最近1天数据！");
    var branchInfo = await copyController.queryBranchInfo();
    await copyController.copy_articles(true);
    await copyController.copy_category_pictures(null, null, null, true);
    await copyController.copy_category_models(null, null, null, true);
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
    if (branchInfo.submitUrlToBaidu) await baiduController.submitNew("www.99nvshen.com");
    if (branchInfo.submitUrlToGoogle) await googleController.createSitemapFiles("www.99nvshen.com");
}


exports.auto_schedule_da12 = function() {
    //每日更新
    schedule.scheduleJob('0 0 0 * * *', async function() {
        console.log("更新最近1天数据！");
        await copyDa12Controller.queryBranchInfo();
        copyDa12Controller.copy_all_pictures(null, true);
        copyDa12Controller.copy_home_rank();
        // await baiduController.submitNew("www.99nvshen.com");
        // await googleController.createSitemapFiles("www.99nvshen.com");
    });
}