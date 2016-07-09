var express = require('express');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var Q = require('q');
var User = require('./users.js');

var router = express.Router();
var publicPath = __dirname.slice(0,__dirname.length-6) + "public/";
var user = new User({});
var userToken;

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root',
	database : 'webanh'
});

connection.connect();

// Get USER INFO at the moment
router.post('/user/current/userInfo', function(req, res){
	res.json(JSON.stringify(req.session.user));
});

// For NOT admin user: HOME PAGE
router.get('/', function(req, res){
	if (req.session.user) {
		req.session.user.location = "<location> Home </location>";
	} else {
		var user = new User({});
		user.location = "<location> Home </location>";
	};
	res.send(publicPath + 'user-albumlist.html');
	// if (!req.session.user) {
	// 	var user = new User({});
	// 	user.location = "<location> Home </location>";
	// 	req.session.user = user;	
	// };
	// console.log('Send: user-albumlist.html');
	// res.sendFile(publicPath + 'user-albumlist.html');
});

// For NOT admin user: ALBUM LIST
router.get('/:albumName', function(req, res){
	if (!req.session.user) {
		var user = new User({});
		req.session.user = user;
		res.status(504).send('<h1>504 Bad Request.</h1>');
	} else {
		var albumName = req.params.albumName.replace('-', ' ');
		var user = req.session.user;
		console.log(user);
		user.location = "<location> <a href = "/" >Home</a> > " + albumName + " </location>";
		connection.query('SELECT * FROM PHOTOS WHERE PHOTOS.album=' + albumName +
			' WHERE (PHOTOS.id >= '+ req.body.currentPhotoIndex+ ') LIMIT 8 ORDER BY PHOTOS.name', 
			function(err, rows, fields){
				if (err) {def.reject(err)}
				else {
					def.resolve(res.json(JSON.stringify(rows)));
				}
		})
	};
	// console.log('Send: user-albumdetail.html');
	// res.sendFile(publicPath + 'user-albumdetail.html');
});

//  For NOT admin user: PHOTO LOAD USING AJAX
router.post('/photo/:albumName', function(req, res){
	var def = Q.defer();
	console.log('From Get Photo Ajax ',req.body);
	albumName = req.params.albumName.replace('-', ' ');
	connection.query('SELECT * FROM PHOTOS WHERE PHOTOS.album=' + albumName +
		' WHERE (PHOTOS.id >= '+ req.body.currentPhotoIndex+ ') LIMIT 8 ORDER BY PHOTOS.name', 
		function(err, rows, fields){
			if (err) {def.reject(err)}
			else {
				def.resolve(res.json(JSON.stringify(rows)));
			}
	})
	return def.promise;
});

router.post('/get-all-album', function(req, res){
	connection.query('SELECT PHOTOS.name as coverName, ALBUMS.name as albumName, ALBUMS.id FROM PHOTOS RIGHT JOIN ALBUMS ON ALBUMS.name = PHOTOS.album GROUP BY albumName', 
		// select PHOTOS.name as photoName, ALBUMS.name as albumName from PHOTOS left join ALBUMS on ALBUMS.name = PHOTOS.album group by albumName;
		function(err, rows, fields){
			if (err) { console.log(err)}
			else {
				if (rows.length == 0) {
					console.log('Get-all-album: Do not have any album.')
				}
				else {
					res.json(JSON.stringify(rows));
					console.log(rows);
					console.log('Get-all-album: Okay, albums are sent.')
				}
			}
	});
});

// For NOT admin user: ALBUM LOAD USING AJAX
router.post('/album/:owner/:startIndex/:endIndex',function(req, res){
	var def = Q.defer();

	connection.query('SELECT * FROM ALBUMS WHERE ALBUMS.owner = '+ req.params.owner +
		' WHERE (ALBUMS.id >= '+ req.params.startIndex +') AND ( ALBUMS.id < ' + req.params.endIndex + 
		') ORDER BY ALBUMS.numberOfPhoto', 
		function(err, rows, fields){
			if (err) {def.reject(err)}
			else {
				def.resolve(res.json(JSON.stringify(rows)));
			}
		}
	)
	return def.promise;
});

router.get('/admin', function(req, res){
	if (!req.storage.user) { // check if have last session is storaged
		if (!req.session.user) { // check this session have temp memory or not, if not create new User and attach to session
			var user = new User({});
			req.session.user = user;

		}
	} else {
		if (req.storage.user.logged) { // if have last session saved, redirect to admin
			req.storage.user.redirect(req, res, '/admin');
		};
	};
});
router.post('/admin/login', function(req, res){
	req.session.user.login(req, res);
});
router.get('/admin/logout', function(){});
router.get('/admin/login', function(req, res, next) {
	res.type('text/html'); 
	res.status(200); 
	res.sendFile(publicPath + 'login.html');
});

module.exports = router;
