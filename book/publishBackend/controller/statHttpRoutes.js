var express = require('express');
var router = express.Router();
var statController = require('./stat/statController.js');

router.get('/pv/', statController.getPV);
router.get('/pv/:page', statController.getPV);

module.exports = router;