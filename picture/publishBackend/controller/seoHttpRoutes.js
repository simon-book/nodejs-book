var express = require('express');
var router = express.Router();
var invshenBaiduController = require('./copy_invshen/baiduController.js');
var invshenGoogleController = require('./copy_invshen/googleController.js');
var da12GoogleController = require('./copy_da12/googleController.js');

router.post('/createSitemapFiles', async function(req, res) {
    await invshenBaiduController.createSitemapFiles(req.body.site);
    res.send(true);
})
router.post('/submitAll', async function(req, res) {
    await invshenBaiduController.submitAll(req.body.site);
    res.send(true);
});
router.post('/submitNew', async function(req, res) {
    await invshenBaiduController.submitNew(req.body.site, req.body.startDate, req.body.endDate);
    res.send(true);
});

router.post('/submitGoogleSitemapFiles', async function(req, res) {
    await invshenGoogleController.createSitemapFiles(req.body.site);
    res.send(true);
})

router.post('/submitDa12GoogleSitemapFiles', async function(req, res) {
    await da12GoogleController.createSitemapFiles(req.body.site);
    res.send(true);
})

module.exports = router;