var express = require('express');
var router = express.Router();
var copyDashenController = require('./copy_dashen/copyDashenController.js');
// var commonController = require('./copy_dashen/commonController.js');

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

// router.post('/update_books', async function(req, res) {
//     await copyDashenController.queryBranchInfo();
//     copyDashenController.update_all_books();
//     res.send(true);
// })

router.post('/copy_book', async function(req, res) {
    await copyDashenController.queryBranchInfo();
    await copyDashenController.create_book(req.body.originId);
    res.send(true);
})

module.exports = router;