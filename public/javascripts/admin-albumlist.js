// This javascript module is use for admin home page: admin.html

$(document).ready(function(){
	var user = {};
	var albumData = [];
	user.location = '<strong>Home </strong>';
	user.currentAlbumIndex = 1;// init value

	function updateUserLocation(){
		$('#location').html(user.location);
	}
	// Get USER INFO at the moment
	function getUserState(){
		$.ajax({
			type: 'POST',
			url: '/user/current/userInfo',
			success: function(data){
				console.log('getUserState: ' + data);
				user = JSON.parse(data);
				// updateUserLocation();
			},
			error: function(err){
				console.log('getUserState: ' + err);
			}
		});
	}

	function get8Album(limit){
		console.log('TESTING HERE');
		var limit = typeof limit !== 'undefined' ?  limit : 8;
		console.log(limit);
		var promise = $.ajax({
			type: 'POST',
			url: '/resource/get8Album/' + user.currentAlbumIndex + '/' + limit,
			success: function(result){
				user = result.user;
				updateUserLocation();
				var data = result.data;
				data = result.data;
				console.log('From get8Albums: ' + data);
				var html = "";
				var hidden = "";

				for (var i = 0; i < data.length; i++) {
					var temp = ($.type(data[i].coverName) == 'string')?data[i].coverName:'no-image.png';
					var albumAlias = data[i].albumName.replace(' ', '-');
					var highlight = ((i+1)%2 != 0)?' class = "highlight" ': "";
					html = html + 	'<tr id = "album-' +data[i].id+ '" '+ hidden + highlight+ '>' +
										'<div class = "clear-both"></div>' +
										'<td id = "counter">'+ (i+1) +'</td>' +
										'<td id = "albumName">'+ data[i].albumName +'</td>' +
										'<td id = "timestamp">'+ data[i].createAt +'</td>' +
										'<td id = "number-of-photo">'+ data[i].numberOfPhoto +'</td>' +
										'<td>'+
											'<a href = "/update/"><div class = "button-primary button-small left">Save</div></a>'+
											'<div class = "button-danger button-small right">Cancel</div>'+
										'</td>'+
										'<div class = "clear-both"></div>'+
									'</tr>';

					if ( (i+1) % 10 == 0 ) {
						hidden = " hidden ";
					};
				};	
				$('#album-list').append(html);
			},
			error: function(err){
				console.log('From get all album: ' + err);
			}
		}).then(function(){
			$('table').generatePagination('fieldset > .margin-standard', 10, "pagination");
		});
	}
	get8Album(9999);
	
});