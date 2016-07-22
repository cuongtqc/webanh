// This JS file use for user-albumdetail page
$(document).ready(function(){
	var user = {};
	//user.location = '<strong><a href = "/" >Home</a> gai xinh</strong>';
	user.currentPhotoIndex = 1;// init value

	function updateUserLocation(location){
		$('#location').html(location);
	}
	// Get USER INFO at the moment
	function getUserState(functions){
		var promise = $.ajax({
			type: 'POST',
			url: '/user/current/userInfo',
			success: function(data){
				console.log('getUserState: ' + data);
				user = JSON.parse(data);
				console.log(user.location);
				$('#location').html(user.location);
			},
			error: function(err){
				console.log('getUserState: ' + err);
			}
		});
		for(i = 0; i<functions.length; i++){
			promise = promise.then(functions[i]);
		}
	}
	getUserState([get8Photo]);

	function get8Photo(){
		var albumAlias = user.currentAlbumName.replace(/\ /g, '-');
		$.ajax({
			type: 'POST',
			url: '/resource/get8Photo/'+ albumAlias +'/'+user.currentPhotoIndex,
			success: function(result){
				user = result.user;
				updateUserLocation();

				var data = result.data;
				console.log('From get8Photo: ' + data);
				var html = "";
				if (!data) { 
					$('#show-all-album').append('No photo in this album.');
					$('#show-more-photo').hide();
				} else {
					for (var i = 0; i < data.length; i++) {
						var temp = ($.type(data[i].name) == 'string')?data[i].name:'no-image.png';
						var timestamp = new Date(data[i].createdAt).toLocaleString();
						html = html + '<div class = "album-boundary left" id = "album-boundary'+data[i].id+'">'+
										'<div class = "album-thumb">'+
											'<a><img id = "album-thumb'+data[i].id+
											'" src="../images'+data[i].photoPath+temp+
											'" alt="no-image" title = "Image">'+
											'</a>'+
											'<div id = "toggle"><strong>'+timestamp+'</strong></div>'+
										'</div>'+
									'</div>';
						if (data.length < 8 ) {
							$('#show-more-photo').hide();
						};
					};	
					$('#show-all-album').append(html);
					// Onclick show pop-up
					$('#show-all-album').on('click', '[id *= "album-thumb"]',function(){
						$(this).popup();
					});	
				}
				
				// // Mouse hover show date created infor with custom JQ plugin 
				// $('.album-thumb').on('mouseenter',function(){
				// 		//alert('Up====');
				// 		$(this).toggleUp('0px',$(this).children('#toggle'));
				// });
				// $('.album-thumb').on('mouseleave',function(){
				// 		//alert('Down====');
				// 		$(this).toggleUp('-30px', $(this).children('#toggle'));
				// });
			},
			error: function(err){
				console.log('From get all album: ' + err);
			}
		});
	}
	$('body').on('click', '#pop-up-bounder .button-close', function(){
		$(this).parent().parent().remove();	
	})
	$('#show-more-photo').click(get8Photo);

});
