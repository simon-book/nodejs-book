 var express = require('express');
 var router = express.Router();
 var userController = require('./user/userController.js');
 var page = require('./page/index.js');


 router.get('/home', page.home);
 router.get('/category', page.category);
 router.get('/quanben', page.quanben);
 router.get('/history', page.history);
 router.get('/book', page.book);
 router.get('/chapter', page.chapter);
 router.get('/search', page.search);

 router.get('/register', page.register);
 router.get('/login', page.login);


 module.exports = router;