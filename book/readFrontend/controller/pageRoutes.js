var express = require('express');
var router = express.Router();
var page = require('./page/index.js');
var branchMap = require('./common/branchMap.js');

router.use(function(req, res, next) {
    // req.currentUser = manager;
    req.branchInfo = branchMap.hostMap[req.hostname];
    next();
});

router.get('/', page.home);
router.get('/category', page.category);
router.get('/category/:page', page.category);
router.get('/category/:categoryId/:page', page.category);

router.get('/quanben', page.quanben);
router.get('/history', page.history);

router.get('/book/:bookId', page.book);
router.get('/book/:bookId/mulu', page.mulu);
router.get('/book/:bookId/mulu/:page', page.mulu);
router.get('/book/:bookId/:number', page.chapter);

router.get('/search', page.search);

module.exports = router;