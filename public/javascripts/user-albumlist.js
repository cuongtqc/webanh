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
				console.log('getUserState: ' + data);
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
		console.log('TESTING HERE');
		var limit = typeof limit !== 'undefined' ?  limit : 8;
		console.log(limit);
		$.ajax({
			type: 'POST',
			url: '/resource/get8Album/'+user.currentAlbumIndex + '/' + limit,
			success: function(result){
				user = result.user;
				updateUserLocation();
				var data = result.data;
				data = result.data;
				console.log('From get8Albums: ' + JSON.stringify(data));
				var html = "";

				for (var i = 0; i < data.length; i++) {
					var temp = ($.type(data[i].coverName) == 'string')?data[i].coverName:'no-image.png';
					var albumAlias = data[i].name.replace(/\ /g, '-');
					var src = (data[i].coverPhoto)?(data[i].name + '/' + temp):temp;
					var timestamp = new Date(data[i].createAt).toLocaleString();
					html = html + '<div class = "album-boundary left" id = "album-boundary'+data[i].id+'">'+
									'<div class = "album-thumb">'+
										'<a href="/album/'+albumAlias+'"><img id = "album-thumb'+data[i].id+
										'" src="images/allalbum/'+ src +
										'" alt="no-image" title = "Image"></a>'+
										'<div id = "toggle"><strong>'+ timestamp+'</strong></div>'+
									'</div>'+
									'<div class = "album-title">'+
										'<span id = "album-title">'+data[i].name+'</span>'+
									'</div>'+
								'</div>';
					if (data.length < 8) {
						$('#show-more-album').hide();
					};
				};	
				$('#show-all-album').append(html);
				// Mouse hover show date created infor with custom JQ plugin 
				$('.album-thumb').on('mouseenter',function(){
						 $(this).toggleUp('0px',$(this).children('#toggle'));
				});
				$('.album-thumb').on('mouseleave',function(){
						 $(this).toggleUp('-30px', $(this).children('#toggle'));
				});
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
});
