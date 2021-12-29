var express = require('express');
var router = express.Router();
var _ = require('lodash');
var auto_schedule = require('./autoSchedule/index.js');
var autoSchedule = require('./autoSchedule/index.js');
var copyController = require('./copy_tuaox/copyController.js');
var copyImgController = require('./copy_tuaox/copyImgController.js');
var commonController = require('./copy_tuaox/commonController.js');

// copyController.queryBranchInfo();
router.post('/query_branch_info', async function(req, res) {
    var result = await copyController.queryBranchInfo();
    res.send(result);
})
router.post('/create_tag_groups', async function(req, res) {
    await copyController.queryBranchInfo();
    await copyController.create_tag_groups();
    res.send(true);
})

router.post('/copy_categoryies', async function(req, res) {
    await copyController.queryBranchInfo();
    await copyController.copy_categoryies(req.body.tagId);
    res.send(true);
})

router.post('/copy_all_pictures', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_all_pictures(req.body.startIndex, req.body.endIndex);
    res.send(true);
})

router.post('/create_picture', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.create_picture(req.body.originId);
    res.send(true);
})

router.post('/copy_gallerys_img', async function(req, res) {
    copyImgController.copy_gallerys_img(req.body.pictureId, req.body.startIndex);
    res.send(true);
})

if (_.indexOf(__G__.copySrcs, "tuaox") > -1) auto_schedule.auto_schedule_tuaox();

module.exports = router;