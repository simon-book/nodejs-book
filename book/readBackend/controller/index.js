var express = require('express');
var router = express.Router();
var userController = require('./user/userController.js');
var homeController = require('./common/homeController.js');
var bookController = require('./common/bookController.js');
var readController = require('./common/readController.js');
var chargeController = require('./common/chargeController.js');

router.get('/user/register', userController.register);
router.get('/user/login', userController.login);

// router.use(userController.isLogin);
router.get('/user/logout', userController.logout);
router.get('/:branchId/user/info', userController.getUserInfo);

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


router.get('/:branchId/chargeItems', chargeController.listChargeItems);
// router.get('/:branchId/user/chargePay', chargeController.chargePay);
// router.get('/:branchId/user/chargePaySuccess', chargeController.chargePaySuccess);


module.exports = router;