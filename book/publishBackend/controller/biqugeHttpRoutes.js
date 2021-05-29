var express = require('express');
var router = express.Router();
var copyBiqugeController = require('./copy_biqu/copyBiqugeController.js');
var commonController = require('./copy_biqu/commonController.js');

router.post('/copy_categorys', async function(req, res) {
    await copyBiqugeController.queryBranchInfo();
    await copyBiqugeController.copy_book_category();
    await copyBiqugeController.copy_book_rank_category();
    res.send(true);
})
router.post('/copy_books', async function(req, res) {
    await copyBiqugeController.queryBranchInfo();
    copyBiqugeController.copy_all_books(req.body.date);
    res.send(true);
})
// router.post('/update_books', async function(req, res) {
//     await copyBiqugeController.queryBranchInfo();
//     copyBiqugeController.update_all_books(1, 100);
//     copyBiqugeController.update_all_books(101, 200);
//     copyBiqugeController.update_all_books(201, 300);
//     copyBiqugeController.update_all_books(301, 400);
//     res.send(true);
// })
router.post('/copy_page', async function(req, res) {
    await copyBiqugeController.queryBranchInfo();
    await copyBiqugeController.copy_page();
    res.send(true);
})
router.post('/copy_rank', async function(req, res) {
    await copyBiqugeController.queryBranchInfo();
    copyBiqugeController.copy_rank();
    res.send(true);
})
router.post('/copy_book', async function(req, res) {
    await copyBiqugeController.queryBranchInfo();
    await copyBiqugeController.create_book(req.body.originId);
    res.send(true);
})

router.post('/updateBookLastChapterId', async function(req, res) {
    await commonController.updateBookLastChapterId(req.body.branchId);
    res.send(true);
})

router.post('/updateBookCover', async function(req, res) {
    await commonController.updateBookCover(req.body.branchId, req.body.oldUrl, req.body.newUrl);
    res.send(true);
})

module.exports = router;