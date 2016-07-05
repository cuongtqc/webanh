var express = require('express');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var Q = require('q');

var router = express.Router();
var publicPath = __dirname.slice(0,__dirname.length-6) + "public/";
var userToken;

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root',
	database : 'webanh'
});

connection.connect();
// var a = connection.query("CREATE TABLE IF NOT EXISTS USER (" +
// 	"id int(10) auto_increment, "+
// 	"username char(40), " +
// 	"password char(40), " +
// 	"createAt timestamp, " +
// 	"primary key (id, username)" +
// 	")");

// connection.query("INSERT INTO USER (id, username, password, createAt) VALUES (2016001, 'quangcuong0808', 123, NOW())");

// GETTOKEN: Get token from database
var getToken = function(username){
	var def = Q.defer();
		connection.query("SELECT tooken FROM USER WHERE USER.username='"+username+"'",
			function(err, rows, fields){
				//console.log("GET TOKEN: ", err, rows, fields);
				if (err) {def.reject(err)}
				else {
					console.log(rows);
					if (rows.length >=1 ) {
						def.resolve(rows[0].tooken);
					} else {
						def.reject("From GetToken: Not found token.")
					};
				}
			}
		);
	return def.promise;
}

// LOGIN: login user
// Pre-cons: went into /admin/login or login failed, is FIRSTTIME log in.
// If logged in write tooken into cookies and redirect to /admin
// if not logged in then refresh page
var login = function(req, res, next){
	connection.query("SELECT username, password FROM USER WHERE (username='" +
		req.body.username + 
		"') AND (password='" + 
		req.body.password+
		"');" , 
		function(err, rows, fields){
			res.status(200);
			if (err) { 
				console.log('From LOGIN: Something went wrong.');
				res.redirect('/admin/login');
			}
			else if (rows.length>=1) {
				// write cookies
				//res.cookie('logged', 'true', { maxAge: 900000, httpOnly: false});
				req.session.logged = true;
				req.session.username = req.body.username;
				if (req.body.rememberme == true) {
					res.cookie('tooken_username', rows[0].username, { maxAge: 900000, httpOnly: false});
					res.cookie('tooken_remember', 'remembermeyes', { maxAge: 900000, httpOnly: false});
					console.log('From LOGIN: Wrote info to cookies')
				};
				res.redirect('/admin')
			} else {
				console.log('From LOGIN: Username or Password does not match.');
				res.type('text/html');
				res.send('<script>alert("Username or Password does not match."); window.location.href="/admin/login";</script>');
			}
	});
	
}

// ISLOGIN : check that user have been logged in or not
// if islogin redirect user to /admin
// if not redirect user to /
var islogin = function(req, res, next){
	req.session.username = req.session.username || "";
	var clientToken = req.cookies?(req.cookies.tooken_remember?req.cookies.tooken_remember:""):"";
	getToken(req.session.username).then(function(token){
		if (req.session.logged == true || clientToken==token) {
			console.log('From ISLOGIN: Redirecting to admin...');
			res.redirect('/admin');
		} else {
			console.log('From ISLOGIN: Redirecting to user...');
			res.sendFile(publicPath + 'user.html');
		};
	});
}

// GO ADMIN PAGE: redirect user to admin page
// Pre-cons: no
// if logged in, change session albums and return admin.html
// if not return login page.

var goAdminPage = function(req, res, next){
	req.session.username = req.session.username || "";
	var clientToken = req.cookies?(req.cookies.tooken_remember?req.cookies.tooken_remember:""):"";
	if ( req.session.logged == true ) {
		//console.log(req.session.logged);
		res.sendFile(publicPath + 'admin.html');
	} else {

		if (clientToken != '') {
			getToken(req.session.username).then(function(userToken){
				if (userToken == clientToken) {
					// var def = Q.defer();
					// connection.query("SELECT * FROM ALBUMS LIMIT 8",
					// 	function(err, rows, fields){
					// 		if (err) {def.reject(err)}
					// 		else if (rows) {
								// write 8 album to cookies
								// res.type('text/html'); 
								// res.status(200); 
								// res.cookie('albums', JSON.stringify(rows[0]), {maxAge: 900000, httpOnly: false});
								// res.cookie('currentIndexOfAlbum', rows.length, {maxAge: 900000, httpOnly: false});
					 			res.sendFile(publicPath + 'admin.html');
					 			// def.resolve();
							// };
					// });	
				} else {
					console.log("From: goAdminPage: token failed ...", userToken);
					res.redirect('/admin/login');	
				};
			})
		}
		else {
				console.log("From: goAdminPage: token failed");
				res.redirect('/admin/login');
		};
	}
}

// LOGOUT: clear everything from user cookies and session
var logout = function(req, res, next){
	res.clearCookie('tooken_username');
	res.clearCookie('tooken_remember');
	req.session.logged = false;
	console.log('From LOGOUT: logged out...');
	res.redirect('/admin');
}
// 
var loadMoreAlbum = function(req, res, next){
	if (req.session.logged == true) {
		connection.query("SELECT * FROM ALBUMS WHERE ALBUMS.id > " + req.session.currentAlbumIndex + "LIMIT 8",
			function(err, rows, fields){
				if (err) {console.log(err)}
				else if (rows.length>=1) {
					req.session.albums = JSON.parse(rows);
					if (req.session.currentAlbumIndex % 8 != 0  ) {req.session.noMoreImageToLoad = true};
					res.jsonp(req.session.albums);
				}
			}
		);
	} else {
		console.log('error: you must log in first');
	};
}


router.get('/', islogin);
router.get('/admin', goAdminPage);
router.post('/admin/login', login);
router.get('/admin/logout', logout);
router.get('/admin/login', function(req, res, next) {
	res.type('text/html'); 
	res.status(200); 
	res.sendFile(publicPath + 'login.html');
});

module.exports = router;
