var express = require('express');
var router = express.Router();
var copyController = require('./copy_invshen/copyController.js');
var commonController = require('./copy_invshen/commonController.js');

// copyController.queryBranchInfo();
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
router.post('/copy_all_models', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_all_models(req.body.tagGroupId);
    res.send(true);
})

module.exports = router;