var express = require('express');
var router = express.Router();
var page = require('./page/index.js');

router.use(function(req, res, next) {
    // req.currentUser = manager;
    req.branchInfo = __HOSTMAP__[req.hostname];
    next();
});

router.get('/', page.home);
router.get('/category', page.category);
router.get('/category/:page', page.category);
router.get('/category/:categoryId/:page', page.category);
router.get('/quanben', page.quanben);
router.get('/history', page.history);
router.get('/book', page.book);
router.get('/chapter', page.chapter);
router.get('/search', page.search);

router.get('/register', page.register);
router.get('/login', page.login);


module.exports = router;