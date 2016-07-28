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

var validate_admin = function(req, res, next){
	if (req.url.split('/')[1] == 'admin') {
	    if (req.session.user) {
	      	if (req.session.user.logged) { 
	      		if (req.url.split('/')[2] == 'album') {
	      			var albumName = req.url.split('/')[3]?req.url.split('/')[3].replace('/-/g', ' '):'';
	      			connection.query('SELECT * FROM ALBUMS WHERE ALBUMS.name = "'+ albumName +'"',
	      				function( err, rows, fields){
	      					if (err) { res.send(err)}
	      					else {
	      						if (rows.length == 0) {
	      							res.send('<h2>This is not my album. Do you remember? Redirecting to Admin page...</h2><script>setTimeout(function(){window.location.href = "/admin"}, 1500)</script>')
	      						}
	      						else {
	      							next();
	      						}
	      					}
	      				}
	      			);
	      		} else { next();}
	      	} else {
	      		res.send('<script>window.location.href = "/admin/login"</script>');
	      	}
	    } else {
	      	res.send('<script>window.location.href = "/admin/login"</script>');
	    }
	}
  	else {
		next();
  	}
};

var validate_user = function(req, res, next){
	if(req.url.split('/')[1] == 'album') {
  	var albumName = req.url.split('/')[2]?req.url.split('/')[2].replace('/-/g', ' '):'';
  	connection.query('SELECT * FROM ALBUMS WHERE ALBUMS.name = "'+ albumName +'"',
      			function( err, rows, fields){
      				if (err) { res.send(err)}
      				else {
      					if (rows.length == 0) {
      						res.send('<h2>This is not my album. Do you remember? Redirecting to User home page...</h2><script>setTimeout(function(){window.location.href = "/"}, 1500)</script>')
      					}
      					else {
      						next();
      					}
      				}
      			}
    		);
	} else {
	  next();
	}
}

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
	var string = req.params.currentAlbumIndex + '' + req.params.limit;
	if (!string.match(/[\(\)*;\\]+/)) {
		var x = parseInt(req.params.currentAlbumIndex);
		var albumIndex = x - 1;
		var limit = parseInt(req.params.limit);
		connection.query(
				'SELECT * FROM '+
					'(SELECT PHOTOS.realName as coverName, (SELECT COUNT(*) FROM ALBUMS) as numberOfAlbum, PHOTOS.album as albumName FROM PHOTOS ORDER BY RAND()) as T ' +
				'RIGHT JOIN ALBUMS ON ALBUMS.name = T.albumName GROUP BY ALBUMS.name '+ 
				'LIMIT '+ limit + ' OFFSET ' + albumIndex,	
			function(err, rows, fields){
				if (err) { 
					console.log(err)
				}
				else {
					if (rows.length == 0) {
						res.send('Dont have any album to load.')
					}
					else {
						if (req.session.user.username) {
							var sql = 	'SELECT numberOfAlbum '+
										'FROM USERS '+
										'WHERE USERS.username = "'+req.session.user.username+'"';
							connection.query( sql, function(err2, rows2, fields2){
									if (err2) {res.send(err2)}
									else if (rows.length >=1 ) {
										req.session.user.currentAlbumIndex = x + limit-1;
										req.session.user.numberOfAlbum = rows2[0].numberOfAlbum;
										res.json({ data:rows , user:req.session.user});
									};
								}
							);
						} else {
							connection.query('SELECT SUM(numberOfAlbum) as numberOfAlbum FROM USERS', 
								function(err2, rows2, fields2){
									if (err2) {res.send(err2)}
									else if (rows.length >=1 ) {
										req.session.user.currentAlbumIndex = x + limit - 1;
										req.session.user.numberOfAlbum = rows2[0].numberOfAlbum;
										res.json({ data:rows , user:req.session.user});
									};
								}
							);
						}
						
					}
				}
		});
  	} else {
    	res.send('<script>alert("Oops! Input MUST NOT contains (,),/,*,; Do not try to hack this site!.");window.location.href=window.location.href;</script>')
  	}
});

// For NOT admin user: VIEW PHOTO
router.get('/album/:albumAlias', validate_user, function(req, res){
	var string = ''+req.params.albumAlias;
	if (!string.match(/[\(\)*;\\\>\<\/]+/)) {
		var albumName = req.params.albumAlias.replace(/-/g, ' ');
		req.session.user.currentAlbumName = albumName;
		req.session.user.location = '<img id = "img-logo" src = "../images/logo.png" title = "logo"><strong>&raquo; <a href = "/"> Home</a> &raquo; '+ albumName +'</strong>';
		req.session.user.currentPhotoIndex = 1;
		res.render(publicPath + 'user-albumdetail.jade');
  	} else {
    	res.send('<script>alert("Oops! Input MUST NOT contains (,),/,*,;  Do not try to hack this site!.");window.location.href=window.location.href;</script>')
  	}
});

// For NOT admin user: LOAD PHOTO
router.post('/resource/get8Photo/:currentAlbumName/:currentPhotoIndex', function(req, res){
	var string = ''+ req.params.currentAlbumName + req.params.currentPhotoIndex;
	if (!string.match(/[\(\)*;\\\>\<\/]+/)) {
		var currentAlbumName = (req.params.currentAlbumName).replace(/-/g, ' ');
		var currentPhotoIndex = parseInt(req.params.currentPhotoIndex);
		var sql = 	'SELECT * FROM PHOTOS '+
					'WHERE (PHOTOS.album = "'+currentAlbumName+'") '+
					'LIMIT 8 OFFSET ' + currentPhotoIndex;
		connection.query( sql,function(err, rows, fields){
			if (err) { console.log(" Loading photo error: ", err)}
			else {
				if (rows.length == 0) {
					res.send(rows);
				}
				else {
					var sql = 	'SELECT COUNT(*) as numberOfPhoto '+
								'FROM PHOTOS '+
								'WHERE album = "'+currentAlbumName+'"';
					connection.query( sql, function(err2, rows2, fields2){
						if (err2) {console.log(err2); res.send(err2)}
						else {
							req.session.user.numberOfPhoto = rows2[0].numberOfPhoto;		
							req.session.user.location = '<img id = "img-logo" src = "../images/logo.png" title = "logo"><strong><a href = "/"> &raquo; Home </a> &raquo; '+ currentAlbumName +'</strong>';
							res.send(rows );
						}
					});
				}
			}
		});
  	} else {
    	res.send('<script>alert("Oops! Input MUST NOT contains (,),/,*,; Do not try to hack this site!.");window.location.href=window.location.href;</script>')
  	}
});


// For ADMIN USER
router.get('/admin', function(req, res){
	if (req.storage.user) {
		if (req.storage.user.remember) {
			req.storage.user.location = '<img id = "img-logo" src = "images/logo.png" title = "logo"><strong> &raquo; Home</strong>';
			req.session.user = req.storage.user;
			res.render(publicPath + 'admin-albumlist.jade', {user: req.session.user.username});
		} else {
			res.redirect('/admin/login');
		}
	} else if (req.session.user) {
		if (req.session.user.logged) {
			req.session.user.location = '<img id = "img-logo" src = "images/logo.png" title = "logo"><strong> &raquo; Home</strong>';
			res.render(publicPath + 'admin-albumlist.jade', {user: req.session.user.username});
		} else {
			res.redirect('/admin/login');
		}
	} else {
		req.session.user =  new User({});
		res.send('<script>window.location.href = "/admin/login"</script>');
	}
})

router.post('/admin/login', function(req, res){
	var string = JSON.stringify(req.body);
  	if (!string.match(/[\(\)*;\\\>\<\/]+/)) {
  		var sql = 	"SELECT username, password, email, numberOfAlbum FROM USERS "+
					"WHERE (username='" + req.body.username + 
					"') AND (password='" + req.body.password+ "');";
		connection.query( sql, function(err, rows, fields){
			res.status(200);
			var remember = (req.body.remember=='on')?true:false;
			if (err) { 
				req.redirect('/admin/login');
			}
			else if (rows.length>=1) {
				if (remember == true) { // Write to storage
					req.storage.user = new User({username: req.body.username,remember: remember, logged:true});
				};
				// Write to session
				req.session.user = new User({username: req.body.username, numberOfAlbum: rows[0].numberOfAlbum,
											remember: remember, logged:true, numberOfAlbum: rows[0].numberOfAlbum, 
											location:'<img id = "img-logo" src = "images/logo.png" title = "logo"><strong><a href = "/"> &raquo; Home</a></strong>'
										});
				res.redirect('/admin')
			} else {
				res.type('text/html');
				res.send('<script>alert("Username or Password does not match."); window.location.href="/admin/login";</script>');
			}
		});
  	} else {
    	res.send('<script>alert("Oops!  Input MUST NOT contains (,),/,*,;Do not try to hack this site!.");window.location.href=window.location.href;</script>')
  	}
});

router.get('/admin/album/:albumAlias', validate_admin, function(req, res){
	var string = JSON.stringify(req.params.albumAlias);
	var albumName = req.params.albumAlias.replace(/-/g, ' ');
	if (!string.match(/[\(\)*;\\\>\<\/]+/)) {
		connection.query('SELECT * FROM ALBUMS WHERE ALBUMS.name = "'+ albumName +'"',
			function(err, rows, fields){
				if (err) {console.log(err)}
				else {
					if (rows.length==0) {
						res.send('<H2>This album does not exists</H2>');
					}
					else {
						var albumName = req.params.albumAlias?req.params.albumAlias.replace(/-/g, ' '):'';
						req.session.user.currentAlbumName = albumName;
						req.session.user.location = '<img id = "img-logo" src = "../../images/logo.png" title = "logo"><strong><a href = "/admin"> &raquo; Home</a> &raquo; '+ albumName +'</strong>';
						res.render(publicPath + 'admin-albumdetail.jade', {user: req.session.user.username});
					}
				}
			}
		);
  	} else {
    	res.send('<script>alert("Oops!  Input MUST NOT contains (,),/,*,; Do not try to hack this site!.");window.location.href=window.location.href;</script>')
  	}
});

router.post('/resource/getAlbum/:offset/:limit/:sort', function(req, res){
	var string = ''+ req.params.offset + req.params.limit + req.params.sort;
	if (!string.match(/[\(\)*;\\\>\<\/]+/)) {
		if (!req.session.user.sort) { req.session.user.sort = {orderBy:'numberOfPhoto', by: 'ASC'}};
		var order = JSON.parse(req.params.sort);
		if (typeof(order)=='undefined') {order = req.session.user.sort} else { req.session.user.sort = order}

		var sql = 	'SELECT * FROM ALBUMS '+
					'WHERE ALBUMS.owner = "'+req.session.user.username+ 
					'" ORDER BY '+order.sortBy+' '+order.by+
					' LIMIT ' + req.params.limit + ' OFFSET ' + req.params.offset;

		connection.query( sql,function(err, rows, fields){
				if (err) {
					res.send(err);
				} else {
					if (rows.length == 0) {
						res.send(rows);
					} else {
						res.json( rows);
					}
				}
			}
		);
  	} else {
    	res.send('<script>alert("Oops! Input MUST NOT contains (,),/,*,; Do not try to hack this site!.");window.location.href=window.location.href;</script>')
  	}
});

router.post('/admin/getPhoto/:album/:offset', function(req, res){
	var string =''+req.params.album+req.params.album;
	if (!string.match(/[\(\)*;\\\>\<\/]+/)) {
    	var album = req.params.album;
		var offset = parseInt(req.params.offset);
		var sql = 	' SELECT PHOTOS.id,'+
					' PHOTOS.realName as name,'+
					' PHOTOS.photoPath as photoPath, createdAt,'+
					' ALBUMS.numberOfPhoto as numberOfPhoto  FROM PHOTOS, ALBUMS '+
					' WHERE PHOTOS.album = "'+album+'" AND ALBUMS.name = "'+album+'" '+
					' LIMIT 8 OFFSET ' + offset
		connection.query( sql, function(err, rows, fields){
			if (err) { console.log(err); res.send(err)}
			else {
				res.send(rows);
			}
		});
  	} else {
    	res.send('<script>alert("Oops! Input MUST NOT contains (,),/,*,; Do not try to hack this site!.");window.location.href=window.location.href;</script>')
  	}
});

router.post('/admin/addAlbum', function(req, res){
	var string = JSON.stringify(req.body.albumName);
	if (!string.match(/[\(\)*;\\\>\<\/]+/)) {
		if (req.body.albumName.trim().length == 0) {
			return res.send('<script>alert("Album name must not only contains blank.");window.location.href = "/admin"</script>');
		}
		var sql = 	'SELECT * FROM ALBUMS '+
					'WHERE ALBUMS.name = "'+ req.body.albumName+'"';
		connection.query( sql, function(err, rows, fields){
			if (err) { console.log(err); res.send(err)}
			else if (rows.length >= 1) {
				res.send('<script>alert("New album name existed. Please pick another one."); window.location.href = "/admin";</script>');
			} else if (rows.length == 0) {
				var sql = 	'INSERT INTO ALBUMS (name, numberOfPhoto, owner) '+
							'VALUES ("'+ req.body.albumName+'", 0, "'+req.session.user.username+'");'
				connection.query( sql,
					function(err2, rows2, field2){
						if (err2) {res.send(err2)}
						else if (rows2) {
							req.session.user.numberOfAlbum+=1;
							var sql = 	'UPDATE USERS SET numberOfAlbum = ' + 
										req.session.user.numberOfAlbum +
										' WHERE username = "'+ 
										req.session.user.username+'"';
							connection.query( sql, function(err3, rows3, fields3){
								if (err3) { res.send(err3)}
								else {
									fs.mkdir(publicPath + 'images/allalbum/' + req.body.albumName, function(err){
										if (err) {res.send(err); console.log(err)}
										else {
											res.send('<script>alert("Add album '+req.body.albumName+' success."); window.location.href = "/admin"</script>');
										}
									})
								}
							});
						};
					}
				);
			};
		});
  	} else {
    	res.send('<script>alert("Oops!  Input MUST NOT contains (,),/,*,; Do not try to hack this site!.");window.location.href="/admin";</script>')
  	}
});

router.post('/admin/photo/upload', function(req, res){
	var batch = req.body;
	var rawBin = batch.bin.replace(/^data:image\/png;base64,/, "");
	var realName = batch.fileid + batch.filename.substr(batch.filename.length-4, batch.filename.length-1);
	fs.writeFile(publicPath + 'images/allalbum/' + req.session.user.currentAlbumName +'/' + realName, rawBin, 'base64', function(err1){
		if (err1) { console.log(err1); res.send(err1)}
		else {
			var sql = 	'INSERT INTO PHOTOS (id, name, realName, photoPath, album, author) '+
						'VALUES ('+batch.fileid+' , "'+batch.filename+'","'+ realName +'", "/allalbum/'+
						req.session.user.currentAlbumName+'/","'+req.session.user.currentAlbumName+'", "'+req.session.user.username+'") ';
			connection.query( sql,
				function(err, rows, fields){
					if (err) {res.send(err);console.log(err)}
					else {
						var sql = 	'UPDATE ALBUMS '+
									'SET ALBUMS.numberOfPhoto = ALBUMS.numberOfPhoto + 1 ' +
									'WHERE ALBUMS.name = "'+req.session.user.currentAlbumName+'"';
						connection.query( sql, function(err, rows, fields){
							res.send('perfect');
						});
					}
				}
			);
		}
	});
});
	
router.post('/admin/photo/delete', function(req, res){
	var string = JSON.stringify(req.body);
	if (!string.match(/[\(\)*;\\\>\<\/]+/)) {
		var sql = 	'DELETE FROM PHOTOS '+
					'WHERE PHOTOS.id =  "'+req.body.photoid+'"';
    	connection.query( sql, function(err, rows, fields){
			if (err) {console.log(err); res.send(err)}
			else {
				var sql = 	'UPDATE ALBUMS SET numberOfPhoto = numberOfPhoto - 1 ' + 
							'WHERE name = "'+req.session.user.currentAlbumName+'"';
				connection.query( sql, function(err, rows, fields){
					if (err) {console.log(err); res.send(err)}
					else {
						fs.unlink(publicPath + 'images/allalbum/'+req.session.user.currentAlbumName+ '/' + req.body.photoname, function(err){
							if (err) {console.log(err); res.send(err)}
							else {
								res.send('okay');
							}
						})
					}
				});
			}
		});
  	} else {
    	res.send('<script>alert("Oops! Input MUST NOT contains (,),/,*,; Do not try to hack this site!.");window.location.href=window.location.href;</script>')
  	}
});

router.post('/admin/saveChange', function(req, res){
	var string = JSON.stringify(req.body);
	if (!string.match(/[\(\)*;\\\>\<\/]+/)) {
		connection.query('SELECT * FROM ALBUMS WHERE ALBUMS.name = "'+ req.body.albumName +'"', function(err3, rows3, fields3){
			if (err3) {
				console.log(err3);
				res.send(err3);
			} else {
				if (rows3.length > 0) {
					res.send('<script>alert("Album name existed.");window.location.href="/admin"</script>');
				} else {
					connection.query('SELECT ALBUMS.name FROM ALBUMS WHERE id = '+req.body.albumId, function(err0, rows0, fields0){
						if (err0) {console.log(err0); res.send(err0)}
						else {
							var sql = 	'UPDATE ALBUMS SET ALBUMS.name = "' + req.body.albumName
								sql +=	'" WHERE ALBUMS.id = ' + req.body.albumId				
							connection.query(sql, function(err, rows, fields){
								if (err) {
									console.log('Error occurs:', err); 
									res.send('<script>alert("error: '+JSON.stringify(err)+'")</script>');
								} else {
									var sql =	'UPDATE PHOTOS SET PHOTOS.photoPath = "/allalbum/'+
												req.body.albumName+'/" , PHOTOS.album = "'+
												req.body.albumName+'" WHERE PHOTOS.album = "'+
												rows0[0].name+'"';
									connection.query( sql, function(err1, rows1, fields1){
										if (err) { console.log(err1); res.send(err1)}
										else {
											fs.rename(publicPath + 'images/allalbum/' + rows0[0].name, publicPath + 'images/allalbum/' + req.body.albumName, 
												function(err2){
													if (err2) {console.log('change folder name failed.')}
													else {
														req.session.user.currentAlbumName = req.body.albumName;
														res.send('<script>alert("Change successful.")</script>');
													}
											});
										}
									});
								}
							});		
						}
					});
				}
			}
		})
  	} else {
    	res.send('<script>alert("Oops! Input MUST NOT contains (,),/,*,;  Do not try to hack this site!.");window.location.href=window.location.href;</script>')
  	}
});

router.post('/admin/deleteAlbum', function(req, res){
	var string = JSON.stringify(req.body);
	if (!string.match(/[\(\)*;\\\>\<\/]+/)) {
		connection.query('DELETE FROM ALBUMS WHERE ALBUMS.id = "' + req.body.albumId + '"', function(err, rows, fields){
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
									deleteFolderRecursive(publicPath + 'images/allalbum/' + req.body.albumName , function(x){
										if (x) { res.send(x); console.log(x)}
										else {
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
		});
  	} else {
    	res.send('<script>alert("Oops! Input MUST NOT contains (,),/,*,; Do not try to hack this site!.");window.location.href=window.location.href;</script>')
  	}
});

router.post('/admin/search', function(req, res){
	var string = JSON.stringify(req.body);
	var searchString = '%' + req.body.search + '%';
	if (!string.match(/[\(\)*;\\\>\<\/]+/)) {
		var sql = 	'SELECT * FROM ALBUMS WHERE ALBUMS.owner = "'+ req.session.user.username +
					'" AND ALBUMS.name LIKE "'+searchString+'"';
		if (req.body.search == '') {
			res.send('<script>window.location.href = "/admin";</script>');
		} else {
			connection.query( sql, function(err, rows, fields){
				if (err) {
					console.log('Search failed because of: ', err);
					res.send(err);
				} else {
					if (rows.length <= 0) {
						res.send('<script>alert("No album found.");window.location.href = "/admin";</script>');
					} else {
						res.json({rows: rows});
					}
				}
			});
		}

  	} else {
    	res.send('<script>alert("Oops! Input MUST NOT contains (,),/,*,; Do not try to hack this site!.");window.location.href=window.location.href;</script>')
  	}
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
 	return callback(fs);
};


module.exports = router;
