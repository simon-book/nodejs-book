var express = require('express');
var router = express.Router();
var branchController = require('./branch/branchController.js');
var loginController = require('./manager/loginController.js');
// var JFUM = require('jfum');
// var jfum = new JFUM({
//     minFileSize: 2048, // 2 kB
//     maxFileSize: 5242880, // 5 mB
//     acceptFileTypes: /\.(gif|jpe?g|png)$/i // gif, jpg, jpeg, png
// });

router.post('/create_brand', branchController.createBranch);
router.post('/update_brand', branchController.updateBranch);

router.post('/login', loginController.login);

router.use(loginController.isLogin);
router.get('/logout', loginController.logout);
router.get('/getUser', loginController.getUser);


// router.post('/brand/updateLogo/:brandId', jfum.postHandler.bind(jfum), brandController.updateLogo);


module.exports = router;