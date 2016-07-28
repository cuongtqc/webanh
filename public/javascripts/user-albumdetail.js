// This JS file use for user-albumdetail page
$(document).ready(function(){
	var user = {};

	function updateUserLocation(location){
		$('#location').html(location);
	}
	// Get USER INFO at the moment
	function getUserState(functions){
		var promise = $.ajax({
			type: 'POST',
			url: '/user/current/userInfo',
			success: function(data){
				user = JSON.parse(data);
				$('#location').html(user.location);
			},
			error: function(err){
				console.log('getUserState: ' + err);
			}
		});
		promise = promise.then(functions);
	}
	getUserState(get8Photo);

	function get8Photo(){
		var albumAlias = user.currentAlbumName.replace(/\ /g, '-');
		$.ajax({
			type: 'POST',
			url: '/resource/get8Photo/'+ albumAlias +'/'+$('.photo-boundary').length,
			success: function(data){
				getUserState(function(){
					var html = "";
					if (data.length == 0) { 
						$('#show-all-album').append('This album does not contains any photo');
						$('#show-more-photo').hide();
					} else {
						for (var i = 0; i < data.length; i++) {
							var temp = ($.type(data[i].realName) == 'string')?data[i].realName:'no-image.png';
							var timestamp = new Date(data[i].createdAt).toLocaleString();
							html = html + '<div class = "photo-boundary left" id = "album-boundary'+data[i].id+'" hidden>'+
											'<div class = "album-thumb">'+
												'<a><img id = "album-thumb'+data[i].id+
												'" src="../images'+data[i].photoPath+temp+
												'" alt="no-image" title = "Image">'+
												'</a>'+
												'<div id = "toggle"><strong>'+timestamp+'</strong></div>'+
											'</div>'+
										'</div>';
						};	
						$('#show-all-album').append(html);
						if (user.numberOfPhoto == $('.photo-boundary').length) {$('#show-more-photo').hide();}
						$('.photo-boundary').fadeIn(500);
					}
				});
			},
			error: function(err){
				console.log('From get all album: ' + err);
			}
		});
	}
	$('body').on('click', '#pop-up-bounder .button-close', function(){
		$(this).parent().parent().remove();	
	})
	// Onclick show pop-up
	$('#show-all-album').on('click', '[id *= "album-thumb"]',function(){
		$(this).popup();
	});	
	$('#show-more-photo').click(get8Photo);
	// changeback('tempstyle');
	// setInterval(function(){changeback('tempstyle')}, 3500);
});
