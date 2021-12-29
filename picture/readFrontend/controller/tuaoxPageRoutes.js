var express = require('express');
var router = express.Router();
var moment = require('moment');
var page = require('./page_tuaox/index.js');
var branchMap = require('./page_tuaox/branchMap.js');
var visitStatSequelize = require('../data/sequelize/visitStatSequelize.js');

var branchVisitStat = {};

router.use(function(req, res, next) {
    req.branchInfo = branchMap.hostMap[req.hostname];
    if (!req.branchInfo) {
        res.send(false);
        return;
    }
    var sUserAgent = req.headers["user-agent"].toLowerCase();
    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
    // var bIsMidp = sUserAgent.match(/midp/i) == "midp";
    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
    var bIsAndroid = sUserAgent.match(/android/i) == "android";
    // var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
    // var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
    var isLocalhost = /^(localhost)/.test(req.hostname);
    var isM = /^(m\.)/.test(req.hostname);
    var isMobileDevice = bIsIpad || bIsIphoneOs || bIsUc7 || bIsUc || bIsAndroid;
    // if (isMobileDevice && !isM && !isLocalhost) {
    //     res.redirect(req.protocol + "://" + req.hostname.replace(/^(www)/, "m") + req.originalUrl)
    // } else {
    req.branchInfo.isMobileDevice = isMobileDevice;
    next();
    // }
});

router.get('/branchVisitStat', async function(req, res) {
    var branchInfo = req.branchInfo;
    var date = moment().format("YYYY-MM-DD");
    if (!branchVisitStat[req.hostname] || branchVisitStat[req.hostname].date != date) {
        var record = await visitStatSequelize.findOrCreate({
            hostname: req.hostname,
            date: date
        }, {
            branchId: branchInfo.branchId,
            date: date,
            hostname: req.hostname
        });
        branchVisitStat[req.hostname] = record;
    }
    if (branchVisitStat[req.hostname]) {
        visitStatSequelize.increment({
            id: branchVisitStat[req.hostname].id
        })
    }
    res.send(true);
});

router.get('/', page.home);
router.get('/tagList/', page.tagList);
router.get('/galleryList/', page.galleryList);
router.get('/galleryList/:page', page.galleryList);
router.get('/galleryList/:tagId/:page', page.galleryList);
router.get('/gallery/:pictureId/', page.gallery);
router.get('/gallery/:pictureId/:page', page.gallery);

router.get('/search', page.searchGallery);
router.get('/search/:page', page.searchGallery);
router.get('/error', page.error);

module.exports = router;