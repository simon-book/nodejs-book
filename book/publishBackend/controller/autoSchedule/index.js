var _ = require('lodash');
var schedule = require('node-schedule');
var moment = require('moment');
var copyBiqugeController = require("../copy_biqu/copyBiqugeController.js");
var copyDashenController = require("../copy_dashen/copyDashenController.js");

function auto_schedule() {
    //每日更新
    schedule.scheduleJob('0 0 16 * * *', async function() {
        if (moment().isoWeekday() == 1) return false;
        console.log("更新biqu最近2天数据！");
        await copyBiqugeController.queryBranchInfo();
        copyBiqugeController.copy_all_books();
    });
    schedule.scheduleJob('0 0 16 * * *', async function() {
        if (moment().isoWeekday() == 2) return false;
        console.log("更新dashen最近2天数据！");
        await copyDashenController.queryBranchInfo();
        copyDashenController.copy_all_books();
    });

    //每周全部更新
    schedule.scheduleJob('0 0 12 * * 1', async function() {
        console.log("全量更新biqu数据！");
        await copyBiqugeController.queryBranchInfo();
        copyBiqugeController.copy_all_books(-1);
    });
    schedule.scheduleJob('0 0 12 * * 2', async function() {
        console.log("全量更新dashen数据！");
        await copyDashenController.queryBranchInfo();
        copyDashenController.copy_all_books(-1);
    });
}

module.exports = auto_schedule;