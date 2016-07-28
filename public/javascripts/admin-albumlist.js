// This javascript module is use for admin home page: admin.html
$(document).ready(function(){
	$('.loader').remove();
	var user = {}; //Storage user data 
	var backup = {}; //Backup prestage
	var maxLimit = 1;
	var albumData = [];
	backup.order = {sortBy: 'numberOfPhoto', by: 'ASC'}
	backup.status = 'okay';
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
				updateUserLocation();
			},
			error: function(err){
				console.log('getUserState: ' + err);
			}
		});
		return promise;
	}
	getUserState();

	// This function use offset and limit as argument, then return rows of albums.
	// offset: number, limit: number, order: {name:'name', use:'DESC'}
	function getAlbum(offset, limit, order){
		backup.offset = offset;
		backup.limit = limit;
		backup.order = backup.order||order;
		var limit = typeof limit !== 'undefined' ?  limit : 8;
		if (typeof(order) == 'undefined') {
			order = backup.order;
		}
		var promise = $.ajax({
			type: 'POST',
			url: '/resource/getAlbum/' + offset + '/' + limit + '/' + JSON.stringify(order),
			success: function(data){
				var html = "";
				var hidden = "";
				if (data.length!=0) {
					for (var i = 0; i < data.length; i++) {
						var timestring = new Date(data[i].createAt).toLocaleString();
						var albumAlias = data[i].name.replace(/\ /g, '-');
						var highlight = '';
						html = html + 	'<tr id = "album-' +data[i].id+ '" '+ hidden + highlight+ ' data-id="'+data[i].id+'">' +
											'<div class = "clear-both"></div>' +
											'<td id = "counter" >'+ (i+1+ offset) +'</td>' +
											'<td id = "albumName">'+ data[i].name + '</td>' +
											'<td id = "timestamp" class = "timestamp" >'+ timestring +'</td>' +
											'<td id = "number-of-photo" ><a class = "albumLink" href = "/admin/album/'+albumAlias+'">'+ data[i].numberOfPhoto +'<a></td>' +
											'<td>'+
												'<a href = "javascript:void(0)"><div id = "edit" class = "button-primary button-small left">Edit</div></a>'+
												'<a href = "javascript:void(0)"><div id = "delete" class = "button-danger button-small right">Delete</div></a>'+
											'</td>'+
											'<div class = "clear-both"></div>'+
										'</tr>';
					};		
				}
				$('#album-list').html(html);
			},
			error: function(err){
				console.log('From get all album: ' + err);
			}
		}).then(function(){
			$("[action='/admin/addAlbum'] > .text-input").on('change', function(){
				if ($(this).val().length > 20) { 
					$(this).parent().find('#submit').prop('disabled', 'true');
				}
				else {
					$(this).parent().find('#submit').prop('disabled', 'false');
				}
			});
			getUserState().then(function(){
				$('#pagination').remove();
				$('table').generatePagination('fieldset > .margin-standard', maxLimit, "pagination", user.numberOfAlbum, function(from, to){ return getAlbum(from, to)});
				
			})
		});
		return promise;
	}

	getAlbum(0, maxLimit, backup.order);

	// Set click event for buttons sort
	$('thead>tr').on('click', 'th#thead-title, th#thead-timestamp, th#thead-numberOfPhoto', function(){
		backup.order = {};
		var self = this;
		backup.order.sortBy = $(this).data('sort');
		backup.order.by = $(this).data('direction')==1?'ASC':'DESC';
		getAlbum(backup.offset, maxLimit, backup.order).then(function(){
			var temp = parseInt($(self).data('direction'))*-1;
			if (temp == 1) {
				$(self).find('img').attr('src','images/down.png');
			} else {
				$(self).find('img').attr('src','images/up.png');
			}
			$(self).find('img').removeClass('sort-icon-hide').addClass('sort-icon-show');
			$(self).siblings().find('img').removeClass('sort-icon-show').addClass('sort-icon-hide');
			$(self).siblings().find('img').attr('src','images/none.png');
			$(self).data('direction', temp);
		});
	});
	$('th#thead-numberOfPhoto').trigger('click');

	// Set click event for buttons: cancel save edit delete
	$('#album-list').on('click', '#edit', function(){
		backup.status = 'danger';
		backup.thisNode = $(this).parent().parent();
		var temp = mode({mode: 'edit', node: backup.thisNode});
	});
	$('#album-list').on('click', '#cancel', function(){
		backup.status = 'okay';
		backup.thisNode = $(this).parent().parent();
		mode({mode: 'cancel', node: backup.thisNode});
	});
	$('#album-list').on('click', '#save',function(){
		backup.status = 'okay';
		backup.thisNode = $(this).parent().parent();
		var temp2 = mode({mode: 'normal', node: backup.thisNode});
		if (!$(temp2.input).val().replace(/\s/g, '').length) {
			alert('Warning: Album name is only contained spaces.' + $(temp2.input).val().length);
		} else {
			saveChange({albumId: temp2.currentAlbumId, albumName:$(backup.input).val()});
		}
	});
	$('#album-list').on('click', '#delete', function(){
		backup.status = 'okay';
		var currentAlbumName = $(this).parent().parent().parent().find('#albumName').text();
		var currentAlbumId = $(this).parent().parent().parent().data('id');
		if (confirm('Do you really want to delete album: '+currentAlbumName+ ' ?')){
			deleteAlbum(currentAlbumId, currentAlbumName);
		}
	});

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
					if (data.indexOf('No album found')>-1) {
						if (confirm('Your album is not found. Okay to go back.')) {
							window.location.href = window.location.href;	
						}
					}
					window.location.href = window.location.href;	
				} else {
					var localbackup = {rows: $('table > tbody > tr'), pagination: $('#pagination')};
					$('table').find('tbody').find('tr').remove();
					$('#pagination').remove();
					var html = '';
					for (var i = 0; i < data.rows.length; i++) {
						var albumAlias = data.rows[i].name.replace(/\ /g, '-');
						html = html + 	'<tr id = "album-' + data.rows[i].id + '" data-id="'+ data.rows[i].id+'">' +
											'<div class = "clear-both"></div>' +
											'<td id = "counter">'+ (i+1) +'</td>' +
											'<td id = "albumName">'+ data.rows[i].name +'</td>' +
											'<td id = "timestamp">'+ data.rows[i].createAt +'</td>' +
											'<td id = "number-of-photo"><a class = "albumLink" href = "/admin/album/'+albumAlias+'">'+ data.rows[i].numberOfPhoto +'<a></td>' +
											'<td>'+
												'<a href = "javascript:void(0)"><div id = "edit" class = "button-primary button-small left">Edit</div></a>'+
												'<a href = "javascript:void(0)"><div id = "delete" class = "button-danger button-small right">Delete</div></a>'+
											'</td>'+
											'<div class = "clear-both"></div>'+
										'</tr>';
					}
					$('#album-list').append(html);
					$('table').generatePagination('fieldset > .margin-standard', maxLimit, "pagination");
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
		var promise = $.ajax({
			type: 'POST',
			url: '/admin/saveChange',
			data: data,
			success: function(result){
				$('#tempscript').html(result);
			},
			error: function(err){
				alert('Error occurs: ' +err);
			}
		});
		return promise;
	}

	function deleteAlbum(id, name){
		var promise = $.ajax({
			type: 'POST',
			url: '/admin/deleteAlbum',
			data: {albumId: id, albumName: name},
			success: function(result){
				getUserState();
				$('body > .container').showNoti($('body > .container'), 'Delete successfully!');
				setTimeout(function(){window.location.href = '/admin'}, 1000);
			},
			error: function(err){
				$('body > .container').showNoti($('body > .container'), 'Cannot delete this album because of errors: '+ JSON.stringify(err));
			}
		});
		promise.then(function(){
			return getUserState();
		});
		return promise;
	}

	function mode(option){
		var currentAlbumName = option.node.parent().find('#albumName').text()||option.node.parent().find('input').val();
		var currentAlbumId = option.node.parent().data('id');
		var input = '<input type = "text" class = "text-input" id = "'+ currentAlbumId + '" value = "'+ currentAlbumName+'" autofocus="true" required>';
		backup.currentAlbumName = (backup.currentAlbumName)? backup.currentAlbumName:currentAlbumName;
		backup.input = input;
		
		if (option.mode == 'edit') {			
			option.node.parent().find('#albumName').html(input);
			option.node.parent().find('#albumName').val(option.node.parent().find('#albumName').find('input').val());
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
			option.node.parent().find('#albumName').text(option.node.parent().find('#albumName').val());
			option.node.parent().find('input').remove();
			option.node.find('#save').text('Edit').removeClass('button-inter').addClass('button-primary').prop('id', 'edit');
			option.node.find('#cancel').text('Delete').removeClass('button-warning').addClass('button-danger').prop('id','delete');	
		};
		return {currentAlbumId: currentAlbumId, currentAlbumName: currentAlbumName, input: input};
	}

	// Change background
	// changeback('tempstyle');
	// setInterval(function(){changeback('tempstyle')}, 3500);
});