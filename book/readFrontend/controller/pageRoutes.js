var express = require('express');
var router = express.Router();
var moment = require('moment');
var page = require('./page/index.js');
var branchMap = require('./common/branchMap.js');
var userController = require("./user/userController.js");
var visitStatSequelize = require('../data/sequelize/visitStatSequelize.js');

var branchVisitStat = {};

router.use(function(req, res, next) {
    req.branchInfo = branchMap.hostMap[req.hostname];
    if (!req.branchInfo) {
        res.redirect("https://www.99amn.com");
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
router.post('/login', userController.login);
router.post('/register', userController.register);
router.post('/addBookMark', userController.addBookMark);
router.get('/deleteBookMark', userController.deleteBookMark);
router.get('/deleteAllBookMark', userController.deleteAllBookMark);

//登陆相关
router.get('/login', page.login);
router.get('/register', page.register);
router.get('/logout', userController.logout);

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
router.get('/', page.home);
router.get('/category', page.category);
router.get('/category/:page', page.category);
router.get('/category/:categoryId/:page', page.category);
router.get('/quanben', page.quanben);
router.get('/quanben/:page', page.quanben);
router.get('/quanben/:categoryId/:page', page.quanben);
router.get('/history', page.history);
router.get('/bookshelf', page.bookshelf);
router.get('/book/:bookId', page.book);
router.get('/book/:bookId/mulu', page.mulu);
router.get('/book/:bookId/mulu/:page', page.mulu);
router.get('/book/:bookId/:number', page.chapter);
router.get('/paihang', page.paihang);
router.get('/paihang/:rankId/:page', page.paihang);
router.get('/search', page.search);

module.exports = router;