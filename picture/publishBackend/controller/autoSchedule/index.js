var _ = require('lodash');
var schedule = require('node-schedule');
var moment = require('moment');
var copyController = require("../copy_invshen/copyController.js");

exports.auto_schedule_invshen = function() {
    //每日更新
    // schedule.scheduleJob('0 0 16 * * *', async function() {
    //     console.log("更新biqu最近2天数据！");
    //     await copyController.queryBranchInfo();
    //     copyController.copy_all_books();
    // });
    // schedule.scheduleJob('0 0 4 * * *', async function() {
    //     console.log("更新biqu主页数据！");
    //     await copyController.queryBranchInfo();
    //     copyController.copy_page();
    // });

    // //每周更新
    // schedule.scheduleJob('0 0 0 * * 1', async function() {
    //     console.log("更新biqu rank数据！");
    //     await copyController.queryBranchInfo();
    //     copyController.copy_rank();
    // });

    // //每月全部更新
    // schedule.scheduleJob('0 0 12 15 * *', async function() {
    //     console.log("全量更新biqu数据！");
    //     await copyController.queryBranchInfo();
    //     copyController.copy_all_books(-1);
    // });
}