var express = require('express');
var router = express.Router();
var publicPath = __dirname.slice(0,__dirname.length-6) + "public/";
/* GET home page. */
router.get('/', function(req, res, next) {
	res.type('text/html'); 
	res.status(200); 
	res.sendFile(publicPath + 'index.html');
});

router.get('/admin', function(req, res, next){
	res.type('text/html'); 
	res.status(200); 
	res.sendFile(publicPath + 'admin.html');
});

module.exports = router;
