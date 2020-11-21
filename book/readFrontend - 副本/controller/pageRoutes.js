var express = require('express');
var router = express.Router();
var page = require('./page/index.js');
var branchMap = require('./common/branchMap.js');
var userController = require("./user/userController.js");

router.use(function(req, res, next) {
    // req.currentUser = manager;
    req.branchInfo = branchMap.hostMap[req.hostname];
    next();
});

router.get('/', page.home);
router.get('/login', page.login);
router.get('/register', page.register);
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

// router.get('/rank', page.rank);
router.get('/rank', page.paihang);
router.get('/rank/:rankId/:page', page.paihang);
router.get('/search', page.search);

router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/logout', userController.logout);

router.post('/addBookMark', userController.addBookMark);
router.get('/deleteBookMark', userController.deleteBookMark);
router.get('/deleteAllBookMark', userController.deleteAllBookMark);

module.exports = router;