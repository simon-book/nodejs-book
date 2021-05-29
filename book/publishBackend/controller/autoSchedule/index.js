var _ = require('lodash');
var schedule = require('node-schedule');
var moment = require('moment');
var copyBiqugeController = require("../copy_biqu/copyBiqugeController.js");
var copyDashenController = require("../copy_dashen/copyDashenController.js");

function auto_schedule() {
    //每日更新
    schedule.scheduleJob('0 0 4 * * *', async function() {
        await copyBiqugeController.queryBranchInfo();
        copyBiqugeController.copy_all_books();
    });
    schedule.scheduleJob('0 0 4 * * *', async function() {
        await copyDashenController.queryBranchInfo();
        copyDashenController.copy_all_books();
    });

    //每周全部更新
    schedule.scheduleJob('0 0 0 * * 1', async function() {
        await copyBiqugeController.queryBranchInfo();
        copyBiqugeController.copy_all_books(-1);
    });
    schedule.scheduleJob('0 0 8 * * 1', async function() {
        await copyDashenController.queryBranchInfo();
        copyDashenController.copy_all_books(-1);
    });
}

module.exports = auto_schedule;