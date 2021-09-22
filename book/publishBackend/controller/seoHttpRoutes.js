var express = require('express');
var router = express.Router();
var baiduController = require('./seo/baiduController.js');

router.post('/createSitemapFiles', async function(req, res) {
    await baiduController.createSitemapFiles(req.body.site);
    res.send(true);
})
router.post('/submitNew', async function(req, res) {
    await baiduController.submitNew(req.body.site, req.body.startDate, req.body.endDate);
    res.send(true);
});
router.post('/submitNewBook', async function(req, res) {
    await baiduController.submitNewBook(req.body.bookId);
    res.send(true);
});

module.exports = router;