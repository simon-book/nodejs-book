var express = require('express');
var router = express.Router();
var bookSequelize = require('../data/sequelize/book/bookSequelize.js');
var copyBiqugeController = require('./copy_biqu/copyBiqugeController.js');
var commonController = require('./copy_biqu/commonController.js');

copyBiqugeController.queryBranchInfo();
router.post('/copy_categorys', async function(req, res) {
    await copyBiqugeController.copy_book_category();
    await copyBiqugeController.copy_book_rank_category();
    res.send(true);
})
router.post('/copy_books', async function(req, res) {
    copyBiqugeController.copy_all_books(req.body.date);
    res.send(true);
})
router.post('/update_book', async function(req, res) {
    if (!req.body.bookId) res.send(false);
    var book = await bookSequelize.findOneBook({
        bookId: parseInt(req.body.bookId)
    });
    if (!book) res.send(false);
    copyBiqugeController.update_book(book);
    res.send(true);
})
router.post('/copy_page', async function(req, res) {
    await copyBiqugeController.copy_page();
    res.send(true);
})
router.post('/copy_rank', async function(req, res) {
    copyBiqugeController.copy_rank();
    res.send(true);
})
router.post('/copy_book', async function(req, res) {
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

router.post('/updateBookCover', commonController.updateBrnchCopyUrl)

module.exports = router;