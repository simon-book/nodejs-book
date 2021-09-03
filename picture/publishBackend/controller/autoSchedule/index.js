var _ = require('lodash');
var schedule = require('node-schedule');
var moment = require('moment');
var copyController = require("../copy_invshen/copyController.js");

exports.auto_schedule_invshen = function() {
    //每日更新
    schedule.scheduleJob('0 0 0 * * *', async function() {
        console.log("更新最近1天数据！");
        await copyController.copy_articles(true);
        await copyController.copy_category_pictures(null, null, null, true);
        await copyController.copy_category_models(null, null, null, true);
        await copyController.complete_all_model_info();
    });
}


exports.trigger_invshen_scheduele = async function() {
    console.log("手动触发更新最近1天数据！");
    await copyController.copy_articles(true);
    await copyController.copy_category_pictures(null, null, null, true);
    await copyController.copy_category_models(null, null, null, true);
    await copyController.complete_all_model_info();
}