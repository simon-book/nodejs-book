var express = require('express');
var router = express.Router();
// var page_routes = require('./page_routes');
var brandController = require('./brand/brandController.js');
var perfectDataController = require('./brand/perfectDataController.js');
// var brandConfigController = require('./brand/brandConfigController.js');
var managerController = require('./manager/managerController.js');
var forgetPwdController = require('./manager/forgetPwdController.js');
var JFUM = require('jfum');
var jfum = new JFUM({
    minFileSize: 2048, // 2 kB
    maxFileSize: 5242880, // 5 mB
    acceptFileTypes: /\.(gif|jpe?g|png)$/i // gif, jpg, jpeg, png
});

// router.get('/', page_routes.index);
router.post('/create_brand', brandController.createBrand);
router.post('/create_brand_account', brandController.createBrandAccount);
router.get('/getArea', brandController.getArea);
router.get('/perfect_brand_goods/:brandId', perfectDataController.perfectBrandGoods);

router.post('/login', managerController.login);
router.get('/getUser', managerController.getUser);
router.post('/forget_password/send_vcode', forgetPwdController.forgetPwdSendVerCode);
router.post('/forget_password/new_password', forgetPwdController.forgetPwdResetPwd);
router.post('/:brandId/uploadImage', jfum.postHandler.bind(jfum), managerController.uploadImage);

// router.use(managerController.isLogin);
// router.get('/me', page_routes.me);

// router.get('/memberRunning/:brandId/configInfo', brandConfigController.brandDetail);
// router.get('/orderRunning/:brandId/shopConfigInfo/:shopId', brandConfigController.shopDetail);
router.get('/brand/:brandId', brandController.brandDetail);
router.post('/brand/updateInfo', brandController.updateInfo); //修改品牌信息
// router.post('/brand/updateLogo/:brandId', brandController.updateLogo); //修改品牌LOGO
// router.options('/brand/updateLogo/:brandId',jfum.optionsHandler.bind(jfum));
router.post('/brand/updateLogo/:brandId', jfum.postHandler.bind(jfum), brandController.updateLogo);


module.exports = router;