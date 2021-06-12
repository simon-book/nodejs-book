var express = require('express');
var router = express.Router();
var copyIbsController = require('./copy_ibs/copyIbsController.js');

router.post('/copy_categorys', async function(req, res) {
    await copyIbsController.queryBranchInfo();
    await copyIbsController.copy_book_category();
    res.send(true);
})
router.post('/copy_books', async function(req, res) {
    await copyIbsController.queryBranchInfo();
    copyIbsController.copy_all_books(req.body.date);
    res.send(true);
})

router.post('/copy_book', async function(req, res) {
    await copyIbsController.queryBranchInfo();
    await copyIbsController.create_book(req.body.originId);
    res.send(true);
})

module.exports = router;