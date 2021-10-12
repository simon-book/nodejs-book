var express = require('express');
var router = express.Router();
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
router.post('/copy_all_pictures', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_all_pictures(req.body.tagId);
    res.send(true);
})

router.post('/update_all_pictures', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_all_pictures({
        tagId: "",
        originPath: "xin",
        originId: 1
    }, null, null, true);
    res.send(true);
})


module.exports = router;