DROP DATABASE IF EXISTS webanh;
CREATE DATABASE IF NOT EXISTS webanh;

USE webanh;

CREATE TABLE IF NOT EXISTS USERS (
	id INT(10) NOT NULL AUTO_INCREMENT,
	name VARCHAR(20),
	username VARCHAR(20) NOT NULL,
	password VARCHAR(20) NOT NULL,
	email VARCHAR(20) NOT NULL,
	numberOfAlbum INT(10),
	PRIMARY KEY(id, username)
);

INSERT INTO USERS (name, username, password, email, numberOfAlbum)
	VALUES ('Tran', 'quangcuong0808', '123', 'quangcuong0808@gmail.com', 1);
INSERT INTO USERS (name, username, password, email, numberOfAlbum)
	VALUES ('Anh', 'anhcuong0808', '123', 'anhcuong0808@gmail.com', 0);
INSERT INTO USERS (name, username, password, email, numberOfAlbum)
	VALUES ('Quang', 'quangquang0808', '123', 'quangquang0808@gmail.com', 0);

CREATE TABLE IF NOT EXISTS ALBUMS (
	id INT(10) NOT NULL AUTO_INCREMENT,
	name VARCHAR(20) NOT NULL,
	createAt TIMESTAMP,
	numberOfPhoto INT(10) NOT NULL,
	owner VARCHAR(20) NOT NULL,
	PRIMARY KEY (id, name)
);

-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('gai xinh', 9, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('phong canh', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('gia dinh', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('album1', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('album2', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('album3', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('album4', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('album5', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('album6', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('album7', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('album8', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('album9', 1, 'quangcuong0808');

-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('mot nang', 9, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('yeu cmnr', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('cute', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('lover', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('clover', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('world', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('volunteer work', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('home attack', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('suprise', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('go around', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('stand by you', 1, 'quangcuong0808');
-- INSERT INTO ALBUMS (name, numberOfPhoto, owner)
-- 	VALUES ('lakes', 1, 'quangcuong0808');

CREATE TABLE IF NOT EXISTS PHOTOS (
	id INT(10) NOT NULL AUTO_INCREMENT,
	name VARCHAR(100) NOT NULL,
	photoPath VARCHAR(30) NOT NULL,
	createdAt TIMESTAMP NOT NULL,
	album VARCHAR(20) NOT NULL,
	author VARCHAR(20) NOT NULL,
	PRIMARY KEY (id, name)
);

-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image.png', '/allalbum/gai xinh/', 'gai xinh', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image1.png', '/allalbum/gai xinh/', 'gai xinh', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image2.png', '/allalbum/gai xinh/', 'gai xinh', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image3.png', '/allalbum/gai xinh/', 'gai xinh', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image4.png', '/allalbum/gai xinh/', 'gai xinh', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image5.png', '/allalbum/gai xinh/', 'gai xinh', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image6.png', '/allalbum/gai xinh/', 'gai xinh', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image7.png', '/allalbum/gai xinh/', 'gai xinh', 'quangcuong0808');

-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image.png', '/allalbum/album1/', 'album1', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image1.png', '/allalbum/album2/', 'album2', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image2.png', '/allalbum/album3/', 'album3', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image3.png', '/allalbum/album4/', 'album4', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image4.png', '/allalbum/album5/', 'album5', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image5.png', '/allalbum/gia dinh/', 'gia dinh', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image6.png', '/allalbum/phong canh/', 'phong canh', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image7.png', '/allalbum/gai xinh/', 'gai xinh', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image1.png', '/allalbum/album6/', 'album6', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image2.png', '/allalbum/album7/', 'album7', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image3.png', '/allalbum/album8/', 'album8', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image4.png', '/allalbum/album9/', 'album9', 'quangcuong0808');

-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image3.png', '/allalbum/', 'mot nang', 'quangcuong0808');
-- INSERT INTO PHOTOS (name, photoPath, album, author)
-- 	VALUES ('image4.png', '/allalbum/', 'album9', 'quangcuong0808');

SELECT * FROM (SELECT *, @row:=@row+1 AS row FROM(SELECT * FROM PHOTOS WHERE (PHOTOS.album = 'gai xinh'))AS t CROSS JOIN (SELECT @row:=0 )AS r) AS BOSS WHERE BOSS.row >= 1 LIMIT 8;
SELECT * FROM PHOTOS WHERE (PHOTOS.album = 'gai xinh') LIMIT 4 OFFSET 4
