var express = require('express');
var router = express.Router();
var branchController = require('./branch/branchController.js');
var loginController = require('./manager/loginController.js');

var bookCategoryController = require('./book/bookCategoryController.js');
var bookController = require('./book/bookController.js');
var tagController = require('./book/tagController.js');
var bookChapterController = require('./book/bookChapterController.js');
var pageBlockController = require('./pageBlock/pageBlockController.js');
var chargeItemController = require('./charge/chargeItemController.js');

// var JFUM = require('jfum');
// var jfum = new JFUM({
//     minFileSize: 2048, // 2 kB
//     maxFileSize: 5242880, // 5 mB
//     acceptFileTypes: /\.(gif|jpe?g|png)$/i // gif, jpg, jpeg, png
// });

// router.post('/brand/updateLogo/:brandId', jfum.postHandler.bind(jfum), brandController.updateLogo);

router.post('/create_brand', branchController.createBranch);
router.post('/update_brand', branchController.updateBranch);

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

router.post('/create_book', bookController.create);
router.post('/update_book', bookController.update);
router.get('/delete_book/:bookId', bookController.delete);
router.post('/list_book', bookController.list);

router.post('/create_book_chapter', bookChapterController.create);
router.post('/update_book_chapter', bookChapterController.update);
router.get('/get_book_chapter_detail/:chapterId', bookChapterController.detail);
router.get('/delete_book_chapter/:chapterId', bookChapterController.delete);
router.post('/list_book_chapter', bookChapterController.list);

router.post('/create_page_block', pageBlockController.create);
router.post('/update_page_block', pageBlockController.update);
router.get('/delete_page_block/:blockId', pageBlockController.delete);
router.get('/list_page_block', pageBlockController.list);

router.post('/add_books_to_block', pageBlockController.addBooks);
router.post('/delete_books_from_block', pageBlockController.deleteBooks);
router.post('/list_books_of_block/:blockId', pageBlockController.listBooks);
router.post('/update_book_order_in_block', pageBlockController.orderBooks);

router.post('/create_charge_item', chargeItemController.create);
router.post('/update_charge_item', chargeItemController.update);
router.get('/delete_charge_item/:chargeItemId', chargeItemController.delete);
router.get('/list_charge_item', chargeItemController.list);

module.exports = router;