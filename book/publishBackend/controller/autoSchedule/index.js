var _ = require('lodash');
var schedule = require('node-schedule');
var moment = require('moment');
var copyBiqugeController = require("../copy_biqu/copyBiqugeController.js");
var copyDashenController = require("../copy_dashen/copyDashenController.js");
var copyIbsController = require("../copy_ibs/copyIbsController.js");

exports.auto_schedule_biqu = function() {
    //每日更新
    schedule.scheduleJob('0 0 16 * * *', async function() {
        console.log("更新biqu最近2天数据！");
        await copyBiqugeController.queryBranchInfo();
        copyBiqugeController.copy_all_books();
    });
    schedule.scheduleJob('0 0 4 * * *', async function() {
        console.log("更新biqu主页数据！");
        await copyBiqugeController.queryBranchInfo();
        copyBiqugeController.copy_page();
    });

    //每周更新
    schedule.scheduleJob('0 0 0 * * 1', async function() {
        console.log("更新biqu rank数据！");
        await copyBiqugeController.queryBranchInfo();
        copyBiqugeController.copy_rank();
    });

    //每月全部更新
    schedule.scheduleJob('0 0 12 15 * *', async function() {
        console.log("全量更新biqu数据！");
        await copyBiqugeController.queryBranchInfo();
        copyBiqugeController.copy_all_books(-1);
    });
}

exports.auto_schedule_dashen = function() {
    //每日更新
    schedule.scheduleJob('0 0 16 * * *', async function() {
        console.log("更新dashen最近2天数据！");
        await copyDashenController.queryBranchInfo();
        copyDashenController.copy_all_books();
    });

    schedule.scheduleJob('0 0 12 15 * *', async function() {
        console.log("全量更新dashen数据！");
        await copyDashenController.queryBranchInfo();
        copyDashenController.copy_all_books(-1);
    });
}

exports.auto_schedule_ibs = function() {
    //每日更新
    schedule.scheduleJob('0 0 16 * * *', async function() {
        console.log("更新ibs最近2天数据！");
        await copyIbsController.queryBranchInfo();
        copyIbsController.copy_all_books();
    });


    //每月全部更新
    schedule.scheduleJob('0 0 12 15 * *', async function() {
        console.log("全量更新ibs数据！");
        await copyIbsController.queryBranchInfo();
        copyIbsController.copy_all_books(-1);
    });
}