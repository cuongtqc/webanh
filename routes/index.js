var express = require('express');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var Q = require('q');
var User = require('./users.js');
var fs = require('fs');

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
	res.json(JSON.stringify(req.session.user||user));				
});

// For NOT admin user: HOME PAGE
	router.get('/', function(req, res){
		if (req.session.user) {
			req.session.user.location = '<img id = "img-logo" src = "images/logo.png" title = "logo"><strong> &raquo; Home </strong>';
		} else {
			var user = new User({});
			user.location = '<img id = "img-logo" src = "images/logo.png" title = "logo"><strong> &raquo; Home </strong>';
			req.session.user = user;
		};
		res.render(publicPath + 'user-albumlist.jade');
	});

	//  For NOT admin user: ALBUM LOAD USING AJAX
	router.post('/resource/get8Album/:currentAlbumIndex/:limit', function(req, res){
		var x = parseInt(req.params.currentAlbumIndex);
		var albumIndex = x - 1;
		var limit = parseInt(req.params.limit);
		console.log(limit);

		connection.query(
				'SELECT * FROM '+
					'(SELECT PHOTOS.realName as coverName, (SELECT COUNT(*) FROM ALBUMS) as numberOfAlbum, PHOTOS.album as albumName FROM PHOTOS ORDER BY RAND()) as T ' +
				'RIGHT JOIN ALBUMS ON ALBUMS.name = T.albumName GROUP BY ALBUMS.name '+ 
				'LIMIT '+ limit + ' OFFSET ' + albumIndex,
				
			function(err, rows, fields){
				console.log(rows);
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
									//console.log({ data:JSON.stringify(rows) , user:JSON.stringify(req.session.user)});
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
									//console.log({ data:JSON.stringify(rows) , user:JSON.stringify(req.session.user)});
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
		var albumName = req.params.albumAlias.replace(/-/g, ' ');
		req.session.user.currentAlbumName = albumName;
		req.session.user.location = '<img id = "img-logo" src = "../images/logo.png" title = "logo"><strong>&raquo; <a href = "/"> Home</a> &raquo; '+ albumName +'</strong>';
		req.session.user.currentPhotoIndex = 1;
		res.render(publicPath + 'user-albumdetail.jade');
	});

	// For NOT admin user: LOAD PHOTO
	router.post('/resource/get8Photo/:currentAlbumName/:currentPhotoIndex', function(req, res){
		var currentAlbumName = (req.params.currentAlbumName).replace(/-/g, ' ');
		var currentPhotoIndex = parseInt(req.params.currentPhotoIndex);
		connection.query(
			'SELECT * FROM PHOTOS WHERE (PHOTOS.album = "'+currentAlbumName+'") LIMIT 8 OFFSET ' + currentPhotoIndex,
			function(err, rows, fields){

				if (err) { console.log(" Loading photo error: ", err)}
				else {
					//console.log(rows);
					if (rows.length == 0) {
						console.log('Not have any photo. '); 
						res.send(rows);
					}
					else {
						//req.session.user.currentPhotoIndex += 8;
						connection.query('SELECT COUNT(*) as numberOfPhoto FROM PHOTOS WHERE album = "'+currentAlbumName+'"', function(err2, rows2, fields2){
							if (err2) {console.log(err2); res.send(err2)}
							else {
								req.session.user.numberOfPhoto = rows2[0].numberOfPhoto;		
								req.session.user.location = '<img id = "img-logo" src = "../images/logo.png" title = "logo"><strong><a href = "/"> &raquo; Home </a> &raquo; '+ currentAlbumName +'</strong>';
								res.send(rows );
								console.log('Get 8 Photo: Okay, Photos are sent.')
							}
						});
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
				req.storage.user.location = '<img id = "img-logo" src = "images/logo.png" title = "logo"><strong> &raquo; Home</strong>';
				req.session.user = req.storage.user;
				res.render(publicPath + 'admin-albumlist.jade', {user: req.session.user.username});
			} else {
				res.redirect('/admin/login');
			}
		} else if (req.session.user) {
			console.log('req.session.user = ', req.session.user);
			if (req.session.user.logged) {
				req.session.user.location = '<img id = "img-logo" src = "images/logo.png" title = "logo"><strong> &raquo; Home</strong>';
				res.render(publicPath + 'admin-albumlist.jade', {user: req.session.user.username});
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
					req.session.user = new User({username: req.body.username, password: req.body.password, numberOfAlbum: rows[0].numberOfAlbum,remember: remember, logged:true, numberOfAlbum: rows[0].numberOfAlbum, location:'<img id = "img-logo" src = "images/logo.png" title = "logo"><strong><a href = "/"> &raquo; Home</a></strong>'});
					res.redirect('/admin')
				} else {
					console.log('From LOGIN: Username or Password does not match.');
					res.type('text/html');
					res.send('<script>alert("Username or Password does not match."); window.location.href="/admin/login";</script>');
				}
		});
	});

	router.get('/admin/album/:albumAlias', function(req, res){
		var albumName = req.params.albumAlias.replace(/-/g, ' ');
		req.session.user.currentAlbumName = albumName;
		req.session.user.location = '<img id = "img-logo" src = "../../images/logo.png" title = "logo"><strong><a href = "/admin"> &raquo; Home</a> &raquo; '+ albumName +'</strong>';
		res.render(publicPath + 'admin-albumdetail.jade', {user: req.session.user.username});
	});
	
	router.post('/resource/getAlbum/:offset/:limit/:sort', function(req, res){
		if (!req.session.user.sort) { req.session.user.sort = {orderBy:'numberOfPhoto', by: 'ASC'}};
		var order = JSON.parse(req.params.sort);
		console.log(order);
		if (typeof(order)=='undefined') {order = req.session.user.sort} else { req.session.user.sort = order}
		connection.query('SELECT * FROM ALBUMS WHERE ALBUMS.owner = "'+req.session.user.username+ 
							'" ORDER BY '+order.sortBy+' '+order.by+' LIMIT ' + req.params.limit + ' OFFSET ' + req.params.offset, 
							function(err, rows, fields){
								if (err) {
									console.log('Err  From getAlbum:', err);
									res.send(err);
								} else {
									if (rows.length == 0) {
										console.log('Do not have album');
										res.send(rows);
									} else {
										res.json( rows);
										console.log('Get albums for admin okay. ', rows);
									}
								}
							}
						);
	});

	router.post('/admin/getPhoto/:album/:offset', function(req, res){
		var album = req.params.album;
		var offset = parseInt(req.params.offset);
		connection.query('	SELECT PHOTOS.id,'+
						' 		PHOTOS.realName as name,'+
						' 		PHOTOS.photoPath as photoPath, createdAt,'+
						' 		ALBUMS.numberOfPhoto as numberOfPhoto  FROM PHOTOS, ALBUMS '+
						'	WHERE PHOTOS.album = "'+album+'" AND ALBUMS.name = "'+album+'" '+
						'	LIMIT 8 OFFSET ' + offset,
			function(err, rows, fields){
				if (err) { console.log(err); res.send(err)}
				else {
					console.log("get photos: ", rows);
					if (rows.length == 0 ) {console.log('Have no photo more'); res.send(rows)}
					else {
						res.send(rows);
					}
				}
			}
		);
	});

	router.post('/admin/addAlbum', function(req, res){
		//'SELECT * FROM ALBUMS WHERE ALBUMS.name = "fdsa " delete from ALBUMS; select * from ALBUMS where name="3"'
		connection.query('SELECT * FROM ALBUMS WHERE ALBUMS.name = "'+ req.body.albumName+'"',
			function(err, rows, fields){
				if (err) { console.log(err); res.send(err)}
				else if (rows.length >= 1) {
					res.send('<script>alert("New album name existed. Please pick another one."); window.location.href = "/admin";</script>');
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
																			fs.mkdir(publicPath + 'images/allalbum/' + req.body.albumName, function(err){
																				if (err) {res.send(err); console.log(err)}
																				else {
																					console.log('created album folder');
																					res.send('<script>alert("Add album '+req.body.albumName+' success."); window.location.href = "/admin"</script>');
																				}
																			})
																		}
												});
											};
										}
					);
				};
			}
		);
	});

	router.post('/admin/photo/upload', function(req, res){
		
		var batch = req.body;
		var rawBin = batch.bin.replace(/^data:image\/png;base64,/, "");
		var realName = batch.fileid + batch.filename.substr(batch.filename.length-4, batch.filename.length-1);
		fs.writeFile(publicPath + 'images/allalbum/' + req.session.user.currentAlbumName +'/' + realName, rawBin, 'base64', function(err){
			if (err) { console.log(err); res.send(err)}
			else {
				console.log('Okay upload success!');
				connection.query(	'INSERT INTO PHOTOS (id, name, realName, photoPath, album, author) '+
									'VALUES ('+batch.fileid+' , "'+batch.filename+'","'+ realName +'", "/allalbum/'+req.session.user.currentAlbumName+'/","'+req.session.user.currentAlbumName+'", "'+req.session.user.username+'") ',
									function(err, rows, fields){
										if (err) {res.send(err);console.log(err)}
										else {
											connection.query( 	'UPDATE ALBUMS '+
																'SET ALBUMS.numberOfPhoto = ALBUMS.numberOfPhoto + 1 ' +
																'WHERE ALBUMS.name = "'+req.session.user.currentAlbumName+'"',
																function(err, rows, fields){
																	console.log('Update database success!');
																	res.send('perfect');
																}
															);
										}
									}
				);
			}
		});
	});
	
	router.post('/admin/photo/delete', function(req, res){
		connection.query(	'DELETE FROM PHOTOS '+
							'WHERE PHOTOS.id =  "'+req.body.photoid+'"',
							function(err, rows, fields){
								if (err) {console.log(err); res.send(err)}
								else {
									console.log('Deleted from PHOTOS');
									connection.query(	'UPDATE ALBUMS SET numberOfPhoto = numberOfPhoto - 1 ' + 
														'WHERE name = "'+req.session.user.currentAlbumName+'"',
														function(err, rows, fields){
															if (err) {console.log(err); res.send(err)}
															else {
																console.log('Updated Album');
																fs.unlink(publicPath + 'images/allalbum/'+req.session.user.currentAlbumName+ '/' + req.body.photoname, function(err){
																	if (err) {console.log(err); res.send(err)}
																	else {
																		console.log('Deleted file.');
																		res.send('okay');
																	}
																})
															}
														}
									);
								}
							}
		);
	});

	router.post('/admin/saveChange', function(req, res){
		connection.query('SELECT ALBUMS.name FROM ALBUMS WHERE id = '+req.body.albumId,
			function(err0, rows0, fields0){
				if (err0) {console.log(err0); res.send(err0)}
				else {
					connection.query('UPDATE ALBUMS SET ALBUMS.name = "'+req.body.albumName+
									'" WHERE ALBUMS.id = '+req.body.albumId,
									function(err, rows, fields){
										if (err) {
											console.log('Error occurs:', err); 
											res.send('<script>alert("error: '+JSON.stringify(err)+'")</script>')
										} else {
											connection.query('UPDATE PHOTOS SET PHOTOS.photoPath = "/allalbum/'+
																req.body.albumName+'/" , PHOTOS.album = "'+
																req.body.albumName+'" WHERE PHOTOS.album = "'+
																rows0[0].name+'"', 
												function(err1, rows1, fields1){
													if (err) { console.log(err1); res.send(err1)}
													else {
														console.log('Save successful!');
														fs.rename(publicPath + 'images/allalbum/' + rows0[0].name, publicPath + 'images/allalbum/' + req.body.albumName, 
															function(err2){
																if (err2) {console.log('change folder name failed.')}
																else {
																	req.session.user.currentAlbumName = req.body.albumName;
																	res.send('<script>alert("Change successful.")</script>');
																}
														});
													}
												}
											);
										}
									}
					);
					
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
								req.session.user.numberOfAlbum>=1?req.session.user.numberOfAlbum--:req.session.user.numberOfAlbum;
								connection.query('UPDATE USERS SET USERS.numberOfAlbum = '+req.session.user.numberOfAlbum+ ' WHERE USERS.username = "'+ req.session.user.username+'"',
									function(err2, rows2, fields2){
										if (err2) {
											console.log(err2);
											res.send(err2);
										} else {
											connection.query('DELETE FROM PHOTOS WHERE PHOTOS.album = "' + req.body.albumName + '"', function(err3, rows3, fields3){
												if (err3) { console.log(err3); res.send(err3)}
												else {
													console.log('Delete successful!  ----' + req.body.albumName + '---');
													deleteFolderRecursive(publicPath + 'images/allalbum/' + req.body.albumName , function(err4){
														if (err4) { res.send(err4); console.log(err4)}
														else {
															console.log('Deleted Album folder.');
															req.session.user.location = '<strong> &raquo; Home</strong>';
															res.send(req.session.user);
														}
													});
												}
											});
											
										}
									}
								);
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
		res.render(publicPath + 'login.jade');
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
		res.render(publicPath + 'error.jade');
	});

	
	router.get('/resource/flyBackground', function(req, res){
		connection.query('	SELECT * FROM PHOTOS ORDER BY RAND() LIMIT 1', 
							function(err, rows, fields){
								if (err) { console.log(err); res.send(err)}
								else {
									res.send(rows);
								}
							}
						);
	});

	//http://www.geedew.com/remove-a-directory-that-is-not-empty-in-nodejs/
	var deleteFolderRecursive = function(path, callback) {
	  	if( fs.existsSync(path) ) {
	    	fs.readdirSync(path).forEach(function(file,index){
		      	var curPath = path + "/" + file;
		      	if(fs.lstatSync(curPath).isDirectory()) { // recurse
		        	deleteFolderRecursive(curPath);
		      	} else { // delete file
		        	fs.unlinkSync(curPath);
		      	}
	    	});
	    	fs.rmdirSync(path);
	 	}
	 	return callback(null);
	};


module.exports = router;
