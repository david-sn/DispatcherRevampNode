var express = require('express');
var router = express.Router();

var businessDispatcher = require('../controller/businessDispatcher')

/* GET home page. */
router.post('/Dispatcher', businessDispatcher.doServerlt);

module.exports = router;
