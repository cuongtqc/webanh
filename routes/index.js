var express = require('express');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var Q = require('q');
var User = require('./users.js');

var router = express.Router();
var publicPath = __dirname.slice(0,__dirname.length-6) + "public/";
var user = new User({currentAlbumIndex:1, currentPhotoIndex: 1});

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root',
	database : 'webanh'
});

connection.connect();

// Get USER INFO at the moment
router.post('/user/current/userInfo', function(req, res){
	console.log(JSON.stringify(req.session.user));
	// connection.query('SELECT * FROM USERS WHERE USERS.name = "'+req.session.user.username+'"',
	// 	function(err, rows, fields){
	// 		if (err) {
	// 			console.log("Error From getUserInfo:", err);
	// 			res.send(err);
	// 		} else {
	// 			if (rows.length == 1) {
	// 				req.session.user.total = rows[0].numberOfAlbum;
					
	// 			}
	// 		}
	// 	}
	// );
	res.json(JSON.stringify(req.session.user||user));				
});

// For NOT admin user: HOME PAGE
	router.get('/', function(req, res){
		if (req.session.user) {
			req.session.user.location = "<strong> &raquo; Home </strong>";
		} else {
			var user = new User({});
			user.location = "<strong> &raquo; Home </strong>";
			req.session.user = user;
		};
		res.sendFile(publicPath + 'user-albumlist.html');
	});

	//  For NOT admin user: ALBUM LOAD USING AJAX
	router.post('/resource/get8Album/:currentAlbumIndex/:limit', function(req, res){
		var x = parseInt(req.params.currentAlbumIndex);
		var albumIndex = x -1;
		var limit = parseInt(req.params.limit);
		console.log(limit);

		connection.query(
				'SELECT PHOTOS.name as coverName, ALBUMS.name as albumName, ALBUMS.id, ALBUMS.createAt, ALBUMS.numberOfPhoto '+
				'FROM PHOTOS '+
				'RIGHT JOIN ALBUMS ON ALBUMS.name = PHOTOS.album '+
				'GROUP BY albumName '+
				'LIMIT ' + limit +
				' OFFSET ' + albumIndex, 
				
			function(err, rows, fields){
				if (err) { console.log(err)}
				else {
					if (rows.length == 0) {
						console.log('Get-all-album: Do not have any album.')
						res.send('Dont have any album to load.')
					}
					else {
						if (req.session.user.username) {
							connection.query('SELECT numberOfAlbum FROM USERS WHERE USERS.username = "'+req.session.user.username+'"', function(err2, rows2, fields2){
								if (err2) {res.send(err2)}
								else if (rows.length >=1 ) {
									req.session.user.currentAlbumIndex = x + limit-1;

									//console.log('If admin');

									req.session.user.numberOfAlbum = rows2[0].numberOfAlbum;
									console.log('req.session.user.numberOfAlbum = ',rows2[0].numberOfAlbum);
									res.json({ data:rows , user:req.session.user});
									console.log({ data:JSON.stringify(rows) , user:JSON.stringify(req.session.user)});
									console.log('Get-all-album: Okay, albums are sent.')
								};
							});
						} else {
							connection.query('SELECT SUM(numberOfAlbum) as numberOfAlbum FROM USERS', function(err2, rows2, fields2){
								if (err2) {res.send(err2)}
								else if (rows.length >=1 ) {
									req.session.user.currentAlbumIndex = x + limit - 1;

									//console.log('If not admin');

									req.session.user.numberOfAlbum = rows2[0].numberOfAlbum;
									console.log('req.session.user.numberOfAlbum = ',rows2[0].numberOfAlbum);
									res.json({ data:rows , user:req.session.user});
									console.log({ data:JSON.stringify(rows) , user:JSON.stringify(req.session.user)});
									console.log('Get-all-album: Okay, albums are sent.')
								};
							});
						}
						
					}
				}
		});
	});

// For NOT admin user: VIEW PHOTO
	router.get('/album/:albumAlias', function(req, res){
		var albumName = req.params.albumAlias.replace('-', ' ');
		req.session.user.currentAlbumName = albumName;
		req.session.user.location = '<strong><a href = "/"> &raquo; Home</a> &raquo; '+ albumName +'</strong>';
		req.session.user.currentPhotoIndex = 1;
		res.sendFile(publicPath + 'user-albumdetail.html');
	});

	// For NOT admin user: LOAD PHOTO
	router.post('/resource/get8Photo/:currentAlbumName/:currentPhotoIndex', function(req, res){
		var currentAlbumName = (req.params.currentAlbumName).replace('-', ' ');
		var currentPhotoIndex = parseInt(req.params.currentPhotoIndex) - 1;
		connection.query(
			'SELECT * FROM PHOTOS WHERE (PHOTOS.album = "'+currentAlbumName+'") LIMIT 8 OFFSET ' + currentPhotoIndex,
			function(err, rows, fields){

				if (err) { console.log(" Loading photo error: ", err)}
				else {
					console.log(rows);
					if (rows.length == 0) {
						console.log('Not have any photo. '); 
						res.send('Do not have photo to load.')
					}
					else {
						req.session.user.currentPhotoIndex += 8;
						req.session.user.location = '<strong> <a href = "/"> &raquo; Home </a> &raquo; '+ currentAlbumName +'</strong>';
						console.log(req.session.user.currentPhotoIndex);
						res.json({ data:rows , user:req.session.user});
						console.log('Get 8 Photo: Okay, Photos are sent.')
					}
				}
			}
		);
	});


// For ADMIN USER
	router.get('/admin', function(req, res){
		if (req.storage.user) {
			console.log('req.storage.user = ', req.storage.user);
			if (req.storage.user.remember) {
				req.storage.user.location = '<strong><a href = "/"> &raquo; Home</a></strong>';
				req.session.user = req.storage.user;
				res.sendFile(publicPath + 'admin.html');
			} else {
				res.redirect('/admin/login');
			}
		} else if (req.session.user) {
			console.log('req.session.user = ', req.session.user);
			if (req.session.user.logged) {
				res.sendFile(publicPath + 'admin.html');
			} else {
				res.redirect('/admin/login');
			}
		} else {
			console.log('not create user');
			req.session.user =  new User({});
			res.send('<script>window.location.href = "/admin/login"</script>');
		}
	})

	router.post('/admin/login', function(req, res){
		console.log('From USER: Login...');
		connection.query("SELECT username, password, email, numberOfAlbum FROM USERS WHERE (username='" +
			req.body.username + 
			"') AND (password='" + 
			req.body.password+
			"');" , 
			function(err, rows, fields){
				res.status(200);
				console.log("rememberme  = " , req.params.remember);
				var remember = (req.body.remember=='on')?true:false;
				if (err) { 
					console.log('From USER -> Login: Something went wrong.');
					req.redirect('/admin/login');
				}
				else if (rows.length>=1) {
					if (remember == true) { // Write to storage
						req.storage.user = new User({username: req.body.username, password: req.body.password, remember: remember, logged:true});
						console.log('From LOGIN: Wrote info to client storage');
					};
					// Write to session
					req.session.user = new User({username: req.body.username, password: req.body.password, remember: remember, logged:true, numberOfAlbum: rows[0].numberOfAlbum});
					res.redirect('/admin')
				} else {
					console.log('From LOGIN: Username or Password does not match.');
					res.type('text/html');
					res.send('<script>alert("Username or Password does not match."); window.location.href="/admin/login";</script>');
				}
		});
	});
	
	router.post('/resource/getAlbum/:offset/:limit', function(req, res){
		connection.query('SELECT * FROM ALBUMS WHERE ALBUMS.owner = "'+req.session.user.username+ 
							'" LIMIT ' + req.params.limit + ' OFFSET ' + req.params.offset, 
							function(err, rows, fields){
								if (err) {
									console.log('Err  From getAlbum:', err);
									res.send(err);
								} else {
									if (rows.length == 0) {
										res.send('Do not have album');
									} else {
										res.json( rows);
										console.log('Get albums for admin okay. ', rows);
									}
								}
							}
						);
	});

	router.post('/admin/addAlbum', function(req, res){
		connection.query('SELECT * FROM ALBUMS WHERE ALBUMS.name = "'+ req.body.albumName+'"',
			function(err, rows, fields){
				if (err) { console.log(err); res.send(err)}
				else if (rows.length >= 1) {
					res.send('<script>alert("New album name existed. Please pick another one.")</script>');
				} else if (rows.length == 0) {
					connection.query('INSERT INTO ALBUMS (name, numberOfPhoto, owner) '+
									'VALUES ("'+ req.body.albumName+'", 0, "'+req.session.user.username+'");'+
									'',
										function(err2, rows2, field2){
											if (err2) {res.send(err2)}
											else if (rows2) {
												console.log("From AddAlbum: ", rows2);
												req.session.user.numberOfAlbum+=1;
												connection.query('UPDATE USERS SET numberOfAlbum = ' + 
																	req.session.user.numberOfAlbum +
																	' WHERE username = "'+ 
																	req.session.user.username+'"'
																	, function(err3, rows3, fields3){
																		if (err3) { res.send(err3)}
																		else {
																			res.send('<script>alert("Add album '+req.body.albumName+' success."); window.location.href = "/admin"</script>');
																		}
												});
											};
										}
					);
				};
			}
		);
	});
	
	router.post('/admin/saveChange', function(req, res){
		console.log(req.body);
		connection.query('UPDATE ALBUMS SET ALBUMS.name = "'+req.body.albumName+
						'" WHERE ALBUMS.id = '+req.body.albumId,
						function(err, rows, fields){
							if (err) {
								console.log('Error occurs:', err); 
								res.send('<script>alert("error: '+JSON.stringify(err)+'")</script>')
							} else {
								console.log('Save successful!');
								res.send('<script>alert("Change successful.")</script>')
							}
						}
			);
	});

	router.post('/admin/deleteAlbum', function(req, res){
		connection.query('DELETE FROM ALBUMS WHERE ALBUMS.id = "'
						+req.body.albumId+'"',
						function(err, rows, fields){
							if (err) {
								console.log('Error: ', err);
								res.send(err);
							} else {
								console.log('Delete successful!');
								res.send('Success!');
							}
						}
		);
	});

	router.post('/admin/search', function(req, res){
		connection.query('SELECT * FROM ALBUMS WHERE ALBUMS.name REGEXP "[[:<:]]'+req.body.search+'[[:>:]]"',
			function(err, rows, fields){
				if (err) {
					console.log('Search failed because of: ', err);
					res.send(err);
				} else {
					if (rows.length <= 0) {
						console.log('Search result has no record.');
						res.send('Search result has no record');
					} else {
						console.log('Search result: ', rows);
						res.json({rows: rows});
					}
				}
			}
		);
	});

	router.get('/admin/login', function(req, res, next) {
		res.type('text/html'); 
		res.status(200); 
		res.sendFile(publicPath + 'login.html');
	});

	router.get('/admin/logout', function(req, res, next) {
		if (req.session.user) {
			req.session.user = null;
		};
		if (req.storage.user) {
			req.storage.user = null;
		};
		res.redirect('/admin');
	});


	router.get('/error', function(req, res){
		res.sendFile(publicPath + 'error.html');
	});
module.exports = router;
