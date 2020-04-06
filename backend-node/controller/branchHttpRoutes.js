/**
 * Routers
 * @Author  Simon
 * @Date    2019-7-15 
 */
var express = require('express');
var router = express.Router();
var branchController = require('./branch/branchController.js');
var managerController = require('./manager/managerController.js');

router.post('/create', branchController.createBranch);

router.post('/login', managerController.login);
router.get('/getManager', managerController.getManager);



module.exports = router;