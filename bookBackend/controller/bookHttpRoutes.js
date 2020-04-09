var express = require('express');
var router = express.Router();
var bookCategoryController = require('./book/bookCategoryController.js');
var bookController = require('./book/bookController.js');
var bookChapterController = require('./book/bookChapterController.js');

router.post('/create_book_category', bookCategoryController.create);
router.post('/update_book_category', bookCategoryController.update);
router.get('/delete_book_category/:categoryId', bookCategoryController.delete);
router.get('/list_category', bookCategoryController.list);

router.post('/create_book', bookController.create);
router.post('/update_book', bookController.update);
router.get('/delete_book/:bookId', bookController.delete);
router.post('/list_book', bookController.list);

router.post('/create_book_chapter', bookChapterController.create);
router.post('/update_book_chapter', bookChapterController.update);
router.get('/delete_book_chapter/:chapterId', bookChapterController.delete);
router.post('/list_chapter', bookChapterController.list);



module.exports = router;