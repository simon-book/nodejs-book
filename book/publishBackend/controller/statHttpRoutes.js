var express = require('express');
var router = express.Router();
var statController = require('./stat/statController.js');

router.get('/uv/', statController.getUV);
router.get('/uv/:page', statController.getUV);

module.exports = router;