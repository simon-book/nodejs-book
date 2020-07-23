var express = require('express');
var router = express.Router();
var branchController = require('./branch/branchController.js');
var loginController = require('./manager/loginController.js');
var bookCategoryController = require('./book/bookCategoryController.js');
var bookController = require('./book/bookController.js');
var tagController = require('./book/tagController.js');
var bookChapterController = require('./book/bookChapterController.js');
var copy35xsController = require('./copy/copy35xsController.js');

var MossClient = require('../service/mossConn.js');

router.post('/create_brand', branchController.createBranch);
router.post('/update_brand', branchController.updateBranch);

// router.post('/login', loginController.login);
router.use(loginController.isLogin);
// router.get('/logout', loginController.logout);
// router.get('/getUser', loginController.getUser);

router.post('/create_book_category', bookCategoryController.create);
router.post('/update_book_category', bookCategoryController.update);
router.get('/delete_book_category/:categoryId', bookCategoryController.delete);
router.get('/list_book_category', bookCategoryController.list);

router.post('/create_book_tag', tagController.create);
router.post('/update_book_tag', tagController.update);
router.get('/delete_book_tag/:tagId', tagController.delete);
router.get('/list_book_tag', tagController.list);

router.get('/get_book_detail/:bookId', bookController.detail);
router.post('/list_book', bookController.list);

router.post('/get_book_chapter_detail', bookChapterController.detail);
router.post('/list_book_chapter', bookChapterController.list);


router.get('/copy_35xiaoshuo_book', function(req, res) {
    copy35xsController.copy_book();
    res.send(true);
})

router.post('/moss/put', async function(req, res) {
    var result = await MossClient.put("test", "1/t-" + new Date().getTime(), req.body.content);
    res.send(result);
})

router.get('/moss/get', async function(req, res) {
    var result = await MossClient.get("test", req.query.key);
    res.send(result);
})


module.exports = router;