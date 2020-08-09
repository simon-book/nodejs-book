var express = require('express');
var router = express.Router();
var homeController = require('./read/homeController.js');
var bookController = require('./read/bookController.js');
var readController = require('./read/readController.js');
// var chargeController = require('./read/chargeController.js');

router.get('/:branchId/home/index', homeController.index);
router.get('/:branchId/blockBooks', homeController.blockBooks);
router.get('/:branchId/rankBooks', homeController.rankBooks);
router.get('/:branchId/vipBlockBooks', homeController.vipBlockBooks);

router.get('/:branchId/category', bookController.listCategory);
router.get('/:branchId/tag', bookController.listTag);
router.get('/:branchId/categoryAndTag', bookController.listCategoryAndTag);
router.get('/:branchId/book', bookController.listBook);

router.get('/:branchId/book/:bookId/detail', readController.bookDeail);
router.get('/:branchId/book/:bookId/chapters', readController.bookChapters);
router.get('/:branchId/chapter/:chapterId/detail', readController.chapterDetail);

// router.get('/:branchId/chargeItems', chargeController.listChargeItems);
// router.get('/:branchId/user/chargePay', chargeController.chargePay);
// router.get('/:branchId/user/chargePaySuccess', chargeController.chargePaySuccess);


module.exports = router;