var express = require('express');
var router = express.Router();
var bookSequelize = require('../data/sequelize/book/bookSequelize.js');
var copyDashenController = require('./copy_dashen/copyDashenController.js');
// var commonController = require('./copy_dashen/commonController.js');

copyDashenController.queryBranchInfo();
router.post('/copy_categorys', async function(req, res) {
    await copyDashenController.queryBranchInfo();
    await copyDashenController.copy_book_category();
    res.send(true);
})
router.post('/copy_books', async function(req, res) {
    await copyDashenController.queryBranchInfo();
    copyDashenController.copy_all_books(req.body.date);
    res.send(true);
})

router.post('/copy_book', async function(req, res) {
    await copyDashenController.create_book(req.body.originId);
    res.send(true);
})

router.post('/update_book', async function(req, res) {
    if (!req.body.bookId) res.send(false);
    var book = await bookSequelize.findOneBook({
        bookId: parseInt(req.body.bookId)
    });
    if (!book) res.send(false);
    copyDashenController.update_book(book);
    res.send(true);
})

module.exports = router;