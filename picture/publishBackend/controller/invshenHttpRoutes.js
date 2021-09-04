var express = require('express');
var router = express.Router();
var autoSchedule = require('./autoSchedule/index.js');
var copyController = require('./copy_invshen/copyController.js');
var commonController = require('./copy_invshen/commonController.js');

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
router.post('/copy_all_pictures', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_all_pictures(req.body.tagGroupId);
    res.send(true);
})
router.post('/copy_all_tag_models', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_all_tag_models(req.body.tagGroupId);
    res.send(true);
})
router.post('/complete_all_model_info', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.complete_all_model_info();
    res.send(true);
})
router.post('/copy_articles', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_articles();
    res.send(true);
})
router.post('/create_article', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.create_article(req.body.originId);
    res.send(true);
})
router.post('/copy_all_model_ranks', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_all_model_ranks();
    res.send(true);
})
router.post('/copy_rank_models', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_rank_models(req.body.originId);
    res.send(true);
})
router.post('/check_all_models', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.check_all_models();
    res.send(true);
})
router.post('/trigger_invshen_scheduele', async function(req, res) {
    autoSchedule.trigger_invshen_scheduele();
    res.send(true);
})

module.exports = router;