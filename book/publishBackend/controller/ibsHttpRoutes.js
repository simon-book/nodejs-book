var express = require('express');
var router = express.Router();
var bookSequelize = require('../data/sequelize/book/bookSequelize.js');
var copyIbsController = require('./copy_ibs/copyIbsController.js');

copyIbsController.queryBranchInfo();
router.post('/copy_categorys', async function(req, res) {
    await copyIbsController.copy_book_category();
    res.send(true);
})
router.post('/copy_books', async function(req, res) {
    copyIbsController.copy_all_books(req.body.date);
    res.send(true);
})

router.post('/copy_book', async function(req, res) {
    await copyIbsController.create_book(req.body.originId);
    res.send(true);
})

router.post('/update_book', async function(req, res) {
    if (!req.body.bookId) res.send(false);
    var book = await bookSequelize.findOneBook({
        bookId: parseInt(req.body.bookId)
    });
    if (!book) res.send(false);
    copyIbsController.update_book(book);
    res.send(true);
})

module.exports = router;