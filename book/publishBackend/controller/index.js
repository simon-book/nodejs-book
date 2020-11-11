var express = require('express');
var router = express.Router();
var branchController = require('./branch/branchController.js');
var loginController = require('./manager/loginController.js');
var bookCategoryController = require('./book/bookCategoryController.js');
var bookController = require('./book/bookController.js');
var tagController = require('./book/tagController.js');
var pageBlockController = require('./pageBlock/pageBlockController.js');
var rankController = require('./rank/rankController.js');
var pageController = require('./rank/pageController.js');
var bookChapterController = require('./book/bookChapterController.js');
var copyBiqugeController = require('./copy/copyBiqugeController.js');

var MossClient = require('../service/mossConn.js');

router.post('/create_brand', branchController.createBranch);
router.post('/update_brand', branchController.updateBranch);

router.post('/copy_biquge_books', function(req, res) {
    copyBiqugeController.copy_all_books(req.body.categoryPageIndex);
    res.send(true);
})
router.post('/copy_biquge_book', function(req, res) {
    copyBiqugeController.create_book(req.body.originId);
    res.send(true);
})
router.post('/copy_biquge_book_rank', function(req, res) {
    copyBiqugeController.copy_page();
    copyBiqugeController.copy_rank();
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

router.post('/login', loginController.login);
router.use(loginController.isLogin);
router.get('/logout', loginController.logout);
router.get('/getUser', loginController.getUser);

router.post('/create_book_category', bookCategoryController.create);
router.post('/update_book_category', bookCategoryController.update);
router.get('/delete_book_category/:categoryId', bookCategoryController.delete);
router.get('/list_book_category', bookCategoryController.list);

router.post('/create_book_tag', tagController.create);
router.post('/update_book_tag', tagController.update);
router.get('/delete_book_tag/:tagId', tagController.delete);
router.get('/list_book_tag', tagController.list);

router.post('/create_page_block', pageBlockController.create);
router.post('/update_page_block', pageBlockController.update);
router.get('/delete_page_block/:blockId', pageBlockController.delete);
router.get('/list_page_block', pageBlockController.list);

router.post('/add_books_to_block', pageBlockController.addBooks);
router.post('/delete_books_from_block', pageBlockController.deleteBooks);
router.post('/list_books_of_block', pageBlockController.listBooks);
router.post('/update_book_order_in_block', pageBlockController.orderBooks);

router.post('/create_book', bookController.create);
router.post('/update_book', bookController.update);
router.get('/get_book_detail/:bookId', bookController.detail);
router.post('/list_book', bookController.list);

router.post('/create_book_chapter', bookChapterController.create);
router.post('/update_book_chapter', bookChapterController.update);
router.post('/get_book_chapter_detail', bookChapterController.detail);
router.post('/list_book_chapter', bookChapterController.list);

router.post('/create_rank', rankController.create);
router.post('/update_rank', rankController.update);
router.get('/delete_rank/:rankId', rankController.delete);
router.get('/list_rank', rankController.list);

router.post('/create_page', pageController.create);
router.post('/update_page', pageController.update);
router.get('/delete_page/:pageId', pageController.delete);
router.get('/list_page', pageController.list);





module.exports = router;