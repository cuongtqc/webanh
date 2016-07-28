// This JS file use for user-albumlist page
$(document).ready(function(){
	var user = {};
	user.location = '<strong>Home </strong>';
	user.currentAlbumIndex = 1;// init value

	function updateUserLocation(location){
		$('.location').html(location);
	}
	// Get USER INFO at the moment
	function getUserState(){
		$.ajax({
			type: 'POST',
			url: '/user/current/userInfo',
			success: function(data){
				user = JSON.parse(data);
				updateUserLocation(user.location);
			},
			error: function(err){
				console.log('getUserState: ' + err);
			}
		});
	}

	getUserState();

	function get8Album(limit){
		var limit = typeof limit !== 'undefined' ?  limit : 8;
		$.ajax({
			type: 'POST',
			url: '/resource/get8Album/'+user.currentAlbumIndex + '/' + limit,
			success: function(result){
				user = result.user;
				updateUserLocation();
				var data = result.data;
				data = result.data;
				var html = "";
				if (data) {
					for (var i = 0; i < data.length; i++) {
						user.numberOfAlbum = data[i].numberOfAlbum;
						var temp = ($.type(data[i].coverName) == 'string')?data[i].coverName:'no-image.png';
						var albumAlias = data[i].name.replace(/\ /g, '-');
						var src = (data[i].coverName)?(data[i].name + '/' + temp):temp;
						var timestamp = new Date(data[i].createAt).toLocaleString();
						html = html + '<div class = "album-boundary left" id = "album-boundary'+data[i].id+'" hidden>'+
										'<div class = "album-thumb">'+
											'<a href="/album/'+albumAlias+'"><img id = "album-thumb'+data[i].id+
											'" src="images/allalbum/'+ src +
											'" alt="no-image" title = "Image"></a>'+
											'<div id = "toggle"><strong>'+ timestamp+'</strong></div>'+
										'</div>'+
										'<div class = "album-title">'+
											'<span id = "album-title">'+data[i].name+' ('+data[i].numberOfPhoto+') '+'</span>'+
										'</div>'+
									'</div>';
						if (data.length < 8) {
							$('#show-more-album').hide();
						};
					};	
				}
				$('#show-all-album').append(html);
				$('.album-boundary').fadeIn(500);
				if ($('.album-boundary').length == 0) {
					$('#show-all-album').append('This contains no album.')
					$('#show-more-album').hide();
				} else {
					if (user.numberOfAlbum == $('.album-boundary').length) {
						$('#show-more-album').hide();
					}
				};		
			},
			error: function(err){
				console.log('From get all album: ' + err);
			}
		});
	}

	$('#show-more-album').click(function(){
		get8Album(8);
	});
	
	get8Album(8);

	// changeback('tempstyle');
	// setInterval(function(){changeback('tempstyle')}, 3500);
});
