var _ = require('lodash');
var schedule = require('node-schedule');
var moment = require('moment');
var copyBiqugeController = require("../copy_biqu/copyBiqugeController.js");

function auto_schedule() {
    schedule.scheduleJob('0 0 4 * * *', async function() {
        await copyBiqugeController.queryBranchInfo();
        copyBiqugeController.update_all_books(1, 100);
        copyBiqugeController.update_all_books(101, 200);
        copyBiqugeController.update_all_books(201, 300);
        copyBiqugeController.update_all_books(301, 400);
    });
    schedule.scheduleJob('0 0 16 * * *', async function() {
        await copyBiqugeController.queryBranchInfo();
        copyBiqugeController.update_all_books(1, 100);
        copyBiqugeController.update_all_books(101, 200);
        copyBiqugeController.update_all_books(201, 300);
        copyBiqugeController.update_all_books(301, 400);
    });
}

module.exports = auto_schedule;