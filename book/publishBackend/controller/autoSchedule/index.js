var _ = require('lodash');
var schedule = require('node-schedule');
var moment = require('moment');
var copyBiqugeController = require("../copy_biqu/copyBiqugeController.js");
var copyDashenController = require("../copy_dashen/copyDashenController.js");

function auto_schedule() {
    //每日更新
    schedule.scheduleJob('0 0 16 * * *', async function() {
        console.log("更新biqu最近2天数据！");
        await copyBiqugeController.queryBranchInfo();
        copyBiqugeController.copy_all_books();
    });
    schedule.scheduleJob('0 0 16 * * *', async function() {
        console.log("更新dashen最近2天数据！");
        await copyDashenController.queryBranchInfo();
        copyDashenController.copy_all_books();
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
    schedule.scheduleJob('0 0 12 10 * *', async function() {
        console.log("全量更新biqu数据！");
        await copyBiqugeController.queryBranchInfo();
        copyBiqugeController.copy_all_books(-1);
    });
    schedule.scheduleJob('0 0 12 25 * *', async function() {
        console.log("全量更新dashen数据！");
        await copyDashenController.queryBranchInfo();
        copyDashenController.copy_all_books(-1);
    });
}

module.exports = auto_schedule;