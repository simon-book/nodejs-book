var express = require('express');
var router = express.Router();
var branchController = require('./branch/branchController.js');

var MossClient = require('../service/mossConn.js');

router.post('/create_brand', branchController.createBranch);
router.post('/update_brand', branchController.updateBranch);
router.post('/get_brand', branchController.getBranch);

router.post('/moss/put', async function(req, res) {
    var result = await MossClient.put("test", "1/t-" + new Date().getTime(), req.body.content);
    res.send(result);
})

router.get('/moss/get', async function(req, res) {
    var result = await MossClient.get("test", req.query.key);
    res.send(result);
})


module.exports = router;