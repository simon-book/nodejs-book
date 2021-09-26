var express = require('express');
var schedule = require('node-schedule');
var router = express.Router();
var baiduController = require('./seo/baiduController.js');
var googleController = require('./seo/googleController.js');

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
router.post('/submitGoogleSitemapFiles', async function(req, res) {
    await googleController.createSitemapFiles(req.body.site);
    res.send(true);
})

schedule.scheduleJob('0 0 1 * * *', async function() {
    console.log("提交更新到Google！");
    await googleController.createSitemapFiles("www.99amn.com");
});

module.exports = router;