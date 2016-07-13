// This javascript module is use for admin home page: admin.html

$(document).ready(function(){
	var user = {}; //Storage user data 
	var backup = {}; //Backup prestage
	var albumData = [];

	user.location = '<strong>Home </strong>';
	user.currentAlbumIndex = 1;// init value

	function updateUserLocation(){
		$('#location').html(user.location);
		$('#album-list').data('total',user.total);
	}
	// Get USER INFO at the moment
	function getUserState(){
		var promise = $.ajax({
			type: 'POST',
			url: '/user/current/userInfo',
			success: function(data){
				user = JSON.parse(data);
				console.log(user)
				updateUserLocation();
			},
			error: function(err){
				console.log('getUserState: ' + err);
			}
		});
		return promise;
	}

	// This function use offset and limit as argument, then return rows of albums.
	function getAlbum(offset, limit){
		var limit = typeof limit !== 'undefined' ?  limit : 8;
		var promise = $.ajax({
			type: 'POST',
			url: '/resource/getAlbum/' + offset + '/' + limit,
			success: function(data){
				console.log('From getAlbums: ' + data);
				var html = "";
				var hidden = "";

				for (var i = 0; i < data.length; i++) {
					var albumAlias = data[i].name.replace(' ', '-');
					var highlight = ((i+1)%2 != 0)?' class = "highlight" ': "";
					html = html + 	'<tr id = "album-' +data[i].id+ '" '+ hidden + highlight+ ' data-id="'+data[i].id+'">' +
										'<div class = "clear-both"></div>' +
										'<td id = "counter">'+ (i+1) +'</td>' +
										'<td id = "albumName">'+ data[i].name +'</td>' +
										'<td id = "timestamp">'+ data[i].createAt +'</td>' +
										'<td id = "number-of-photo">'+ data[i].numberOfPhoto +'</td>' +
										'<td>'+
											'<a href = "javascript:void(0)"><div id = "edit" class = "button-primary button-small left">Edit</div></a>'+
											'<a href = "javascript:void(0)"><div id = "delete" class = "button-danger button-small right">Delete</div></a>'+
										'</td>'+
										'<div class = "clear-both"></div>'+
									'</tr>';
				};	
				$('#album-list').html(html);
			},
			error: function(err){
				console.log('From get all album: ' + err);
			}
		}).then(function(){
			getUserState().then(function(){
				console.log('NUMBER OF ALBUMS:' + user.numberOfAlbum);
				$('table').generatePagination('fieldset > .margin-standard', 10, "pagination", user.numberOfAlbum, getAlbum);
			});
			$('#album-list').on('click', '#edit', function(){
				//Go to edit mode
				console.log('Going to Edit mode...');
				backup.thisNode = $(this).parent().parent();
				var temp = mode({mode: 'edit', node: backup.thisNode});
			});
			$('#album-list').on('click', '#cancel', function(){
				//Go to cancel change
				console.log('Going to cancel change...');
				mode({mode: 'cancel', node: backup.thisNode});
			});
			$('#album-list').on('click', '#save',function(){
				//Go to save change
				console.log('Going to save change...');
				var temp2 = mode({mode: 'normal', node: backup.thisNode});
				if (!$(temp2.input).val().replace(/\s/g, '').length) {
					alert('Warning: Album name is only contained spaces.' + $(temp2.input).val().length);
				} else {
					//alert($(backup.input).val());
					console.log('Warning: Album name is only contained spaces.' + $(temp2.input).val().length);
					saveChange({albumId: temp2.currentAlbumId, albumName:$(backup.input).val()});
				}
			});
			$('#album-list').on('click', '#delete', function(){
				//do something after click delete button
				console.log('Going to Delete this...');
				var currentAlbumName = $(this).parent().parent().parent().find('#albumName').text();
				var currentAlbumId = $(this).parent().parent().parent().data('id');
				if (confirm('Do you really want to delete album: '+currentAlbumName+ ' ?')){
					deleteAlbum(currentAlbumId);
				}
			});

		});
	}

	getAlbum(0, 10);


	
	$('#search-content').keypress(function(e){
      	if(e.keyCode==13){
      		search();
      	}
    });

	var search = function(){
		var promise = $.ajax({
			type: 'POST',
			url: '/admin/search',
			data: {search: $('#search-content').val()},
			success: function(data){
				if (typeof(data) == 'string') {
					console.log(data);
					$('table').parent().parent().hide();
					if (confirm('Your word does not match any album name. Click Yes/Okay to show preview page.')) {
						$('table').parent().parent().show();
					};
				} else {
					var localbackup = {rows: $('table > tbody > tr'), pagination: $('#pagination')};
					$('table').find('tbody').find('tr').remove();
					$('#pagination').remove();
					var html = '';
					var hidden = '';
					console.log(data.rows.length);
					for (var i = 0; i < data.rows.length; i++) {
						//var albumAlias = data[i].albumName.replace(' ', '-');
						//var highlight = ((i+1)%2 != 0)?' class = "highlight" ': "";
						html = html + 	'<tr id = "album-' + data.rows[i].id + '" ' + hidden + ' data-id="'+ data.rows[i].id+'">' +
											'<div class = "clear-both"></div>' +
											'<td id = "counter">'+ (i+1) +'</td>' +
											'<td id = "albumName">'+ data.rows[i].name +'</td>' +
											'<td id = "timestamp">'+ data.rows[i].createAt +'</td>' +
											'<td id = "number-of-photo">'+ data.rows[i].numberOfPhoto +'</td>' +
											'<td>'+
												'<a href = "javascript:void(0)"><div id = "edit" class = "button-primary button-small left">Edit</div></a>'+
												'<a href = "javascript:void(0)"><div id = "delete" class = "button-danger button-small right">Delete</div></a>'+
											'</td>'+
											'<div class = "clear-both"></div>'+
										'</tr>';
						if ( (i+1) % 10 == 0 ) {
							hidden = " hidden ";
						}
					}
					console.log(html);
					$('#album-list').append(html);
					$('table').generatePagination('fieldset > .margin-standard', 10, "pagination");
				}	
			},
			error: function(err){
				console.log('Search failed because of:' + JSON.stringify(err));
			}
		});
		return promise;
	};

	//data = {albumId: temp2.currentAlbumId, albumName:$(backup.input).val()}
	function saveChange(data){
		console.log(data);
		var promise = $.ajax({
			type: 'POST',
			url: '/admin/saveChange',
			data: data,
			success: function(result){
				alert('Album change successfully!.');
				//return promise;
			},
			error: function(err){
				alert('Error occurs: ' +err);
				//return promise;
			}
		});
		return promise;
	}

	function deleteAlbum(id){
		var promise = $.ajax({
			type: 'POST',
			url: '/admin/deleteAlbum',
			data: {albumId: id},
			success: function(result){
				alert('Delete successfully!');
				$('#album-'+id).remove();
				$("tr:visible+tr:hidden").slideToggle("fast"); 
				$('table').parent().parent().find('#pagination').remove();
				$('table').generatePagination('fieldset > .margin-standard', 10, "pagination");
				var trlist = $('table > tbody').find('tr');
				for( i = 0; i < trlist.length; i++){
					$(trlist[i]).find('#counter').text((i+1));
				}
				//return promise;
			},
			error: function(err){
				alert('Cannot delete this album because of errors: '+ JSON.stringify(err));
				//return promise;
			}
		});
		return promise;
	}

	// option = {mode: 'edit', node: $(this).parent().parent()}
	function mode(option){
		var currentAlbumName = option.node.parent().find('#albumName').text()||option.node.parent().find('input').val();
		var currentAlbumId = option.node.parent().data('id');
		var input = '<input type = "text" id = "'+ currentAlbumId + '" value = "'+ currentAlbumName+'" autofocus="true" required>';
		backup.currentAlbumName = (backup.currentAlbumName)? backup.currentAlbumName:currentAlbumName;
		backup.input = input;
		
		if (option.mode == 'edit') {			
			option.node.parent().find('#albumName').html(input);
			//Change text of button to 'save' and 'cancel'
			option.node.find('#edit').text('Save').removeClass('button-primary').addClass('button-inter').prop('id', 'save');
			option.node.find('#delete').text('Cancel').removeClass('button-danger').addClass('button-warning').prop('id','cancel');
			
		} else if (option.mode == 'normal') {
			option.node.parent().find('#albumName').text($(input).val());
			option.node.parent().find('input').remove();
			//Change text of button to 'edit' and 'delete'
			option.node.find('#save').text('Edit').removeClass('button-inter').addClass('button-primary').prop('id', 'edit');
			option.node.find('#cancel').text('Delete').removeClass('button-warning').addClass('button-danger').prop('id','delete');	

		} else if (option.mode == 'cancel') {
			option.node.parent().find('#albumName').text(backup.currentAlbumName);
			option.node.parent().find('input').remove();
			option.node.find('#save').text('Edit').removeClass('button-inter').addClass('button-primary').prop('id', 'edit');
			option.node.find('#cancel').text('Delete').removeClass('button-warning').addClass('button-danger').prop('id','delete');	
		};
		return {currentAlbumId: currentAlbumId, currentAlbumName: currentAlbumName, input: input};
	}
});