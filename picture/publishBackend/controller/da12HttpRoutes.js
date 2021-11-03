var express = require('express');
var router = express.Router();
var auto_schedule = require('./autoSchedule/index.js');
var autoSchedule = require('./autoSchedule/index.js');
var copyController = require('./copy_da12/copyController.js');
var commonController = require('./copy_invshen/commonController.js');

// copyController.queryBranchInfo();
router.post('/query_branch_info', async function(req, res) {
    var result = await copyController.queryBranchInfo();
    res.send(result);
})
router.post('/copy_tags', async function(req, res) {
    await copyController.queryBranchInfo();
    await copyController.copy_tags();
    res.send(true);
})

router.post('/count_tag_pictures', async function(req, res) {
    await copyController.queryBranchInfo();
    await copyController.count_tag_pictures(req.body.tagId);
    res.send(true);
})

router.post('/copy_all_pictures', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_all_pictures(req.body.tagId);
    res.send(true);
})

router.post('/create_picture', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.create_picture(req.body.originId, null, req.body.originTagId);
    res.send(true);
})

router.post('/update_all_pictures', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_all_pictures(req.body.tagId, true);
    res.send(true);
})

router.post('/count_tag_pictures', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.count_tag_pictures(req.body.tagId);
    res.send(true);
})

router.post('/fill_picture_tag_origin_id', async function(req, res) {
    copyController.fill_picture_tag_origin_id(req.body.branchId);
    res.send(true);
})

router.post('/copy_home_rank', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_home_rank();
    res.send(true);
})

auto_schedule.auto_schedule_da12();

module.exports = router;