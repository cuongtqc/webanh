
// This module describer a useragent state.
// Each state, user will have attribute and method corresponding to the conditions.
// User can work with database;
// Constructor: {username, password<encrypted or not>, logged, location, albumsLoaded}
// Example: {username:quangcuong0808, password:abcd, logged=true, location=/admin/album, albumsLoaded=[album1, album2], currentAlbumIndex}


var User = function(user){
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : 'root',
		database : 'webanh'
	});
	
	// Attributes
	this.username = user.username || "";
	this.password = user.password || "";
	this.logged = user.logged || false;
	this.remember = user.remember || false;
	this.numberOfAlbum = user.numberOfAlbum || 0;
	this.location = user.location || "";
	this.command = user.command || "<script></script>";
	this.albumsLoaded = user.albumsLoaded || [];
	this.currentAlbumIndex = user.currentAlbumIndex || 1;
	this.currentPhotoIndex = user.currentPhotoIndex || 1;

	// Methods
	this.login = function(req, res){
		// console.log('From USER: Login...');
		// connection.query("SELECT username, password FROM USERS WHERE (username='" +
		// 	req.body.username + 
		// 	"') AND (password='" + 
		// 	req.body.password+
		// 	"');" , 
		// 	function(err, rows, fields){
		// 		res.status(200);
		// 		if (err) { 
		// 			console.log('From USER -> Login: Something went wrong.');
		// 			this.redirect(req, res,'/admin/login');
		// 		}
		// 		else if (rows.length>=1) {
		// 			this.logged = true; // Mark as logged in 
		// 			this.username = req.body.username; // Take username
		// 			this.remember = req.body.remember;
		// 			if (req.body.rememberme == true) { // Write to storage
		// 				req.storage.user = new this({username: this.username, password: this.password, remember: this.remember});
		// 				console.log('From LOGIN: Wrote info to client storage');
		// 			};
		// 			req.session.user = new this({username: this.username, password: this.password, remember: this.remember})
		// 			res.redirect('/admin')
		// 		} else {
		// 			console.log('From LOGIN: Username or Password does not match.');
		// 			res.type('text/html');
		// 			res.send('<script>alert("Username or Password does not match."); window.location.href="/admin/login";</script>');
		// 		}
		// });

	}
	this.logout = function(req, res){
		console.log('From USER: Logout...');

	}
	this.redirect = function(req, res, path){
		console.log('From USER: Redirect to ', path, ' ...');
		res.redirect(path);
	}
}

module.exports = User;
