var express = require('express');
var router = express.Router();
var branchController = require('./branch/branchController.js');
var modelSequelize = require('../data/sequelize/picture/modelSequelize.js');
var pictureSequelize = require('../data/sequelize/picture/pictureSequelize.js');
var articleSequelize = require('../data/sequelize/picture/articleSequelize.js');
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

router.post('/get_one_picture', async function(req, res) {
    var result = await pictureSequelize.findByPk(req.body.id);
    res.send(result);
});
router.post('/get_one_model', async function(req, res) {
    var result = await modelSequelize.findByPk(req.body.id);
    res.send(result);
});
router.post('/get_one_article', async function(req, res) {
    var result = await articleSequelize.findByPk(req.body.id);
    res.send(result);
});

module.exports = router;