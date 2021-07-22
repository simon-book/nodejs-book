var express = require('express');
var router = express.Router();
var bookSequelize = require('../data/sequelize/book/bookSequelize.js');
var copyController = require('./copy_biqu/copyController.js');
var commonController = require('./copy_biqu/commonController.js');

copyController.queryBranchInfo();
router.post('/copy_categorys', async function(req, res) {
    await copyController.queryBranchInfo();
    await copyController.copy_book_category();
    await copyController.copy_book_rank_category();
    res.send(true);
})
router.post('/copy_books', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_all_books(req.body.date);
    res.send(true);
})
router.post('/update_book', async function(req, res) {
    if (!req.body.bookId) res.send(false);
    var book = await bookSequelize.findOneBook({
        bookId: parseInt(req.body.bookId)
    });
    if (!book) res.send(false);
    copyController.update_book(book);
    res.send(true);
})
router.post('/copy_page', async function(req, res) {
    await copyController.queryBranchInfo();
    await copyController.copy_page();
    res.send(true);
})
router.post('/copy_rank', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_rank();
    res.send(true);
})
router.post('/copy_book', async function(req, res) {
    await copyController.create_book(req.body.originId);
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

router.post('/updateBrnchCopyUrl', commonController.updateBrnchCopyUrl)

module.exports = router;