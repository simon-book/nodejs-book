var express = require('express');
var router = express.Router();
var moment = require('moment');
var page = require('./page/index.js');
var branchMap = require('./common/branchMap.js');
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
    if ((bIsIpad || bIsIphoneOs || bIsUc7 || bIsUc || bIsAndroid) && !isM && !isLocalhost) {
        res.redirect(req.protocol + "://" + req.hostname.replace(/^(www)/, "m") + req.originalUrl)
    } else {
        next();
    }
});

//ajax请求
// router.post('/login', userController.login);
// router.post('/register', userController.register);

// //登陆相关
// router.get('/login', page.login);
// router.get('/register', page.register);
// router.get('/logout', userController.logout);

//页面访问
router.use(async function(req, res, next) {
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
    next();
});

// router.get('/branchVisitStat', async function(req, res) {
//     var branchInfo = req.branchInfo;
//     var date = moment().format("YYYY-MM-DD");
//     if (!branchVisitStat[req.hostname] || branchVisitStat[req.hostname].date != date) {
//         var record = await visitStatSequelize.findOrCreate({
//             hostname: req.hostname,
//             date: date
//         }, {
//             branchId: branchInfo.branchId,
//             date: date,
//             hostname: req.hostname
//         });
//         branchVisitStat[req.hostname] = record;
//     }
//     if (branchVisitStat[req.hostname]) {
//         visitStatSequelize.increment({
//             id: branchVisitStat[req.hostname].id
//         })
//     }
//     res.send(true);
// });

router.get('/', page.home);
router.get('/article/', page.articleList);
router.get('/article/:page', page.articleList);
router.get('/article/:articleId/', page.article);

router.get('/pictureTag/', page.pictureList);
router.get('/pictureTag/:page', page.pictureList);
router.get('/pictureTag/:tagId/', page.pictureList);
router.get('/pictureTag/:tagId/:page', page.pictureList);
router.get('/picture/:pictureId/', page.picture);

router.get('/modelTag/', page.modelList);
router.get('/modelTag/:tagId/', page.modelList);
router.get('/modelTag/:tagId/:page', page.modelList);
router.get('/model/:modelId/', page.model);
router.get('/todayModel', page.todayModelList);
router.post('/findModel', page.findModelList);
// router.post('/findModel/:page', page.findModelList);

router.get('/modelRank/', page.rankMainPage);
router.get('/modelRank/:rankId/', page.rankModelList);
router.get('/modelRank/:rankId/:page', page.rankModelList);

router.get('/search', page.search);
router.get('/error', page.error);

module.exports = router;