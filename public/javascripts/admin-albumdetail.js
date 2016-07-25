
$(document).ready(function(){
	var user = {};
	user.currentPhotoIndex = 1;// init value
	user.currentAlbumName = '';
	user.location = 'x';
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
		
		return promise = promise.then(functions);
		
	}
	getUserState(getPhoto);

	function getPhoto(lim){
		var temp = parseInt(lim)>=0?parseInt(lim) : $('.photo-boundary').length;
		$.ajax({
			type: 'POST',
			url: '/admin/getPhoto/'+ user.currentAlbumName +'/'+ temp,
			success: function(data){
				getUserState();
				var html = "";
				if (data.length!=0) {
					for (var i = 0; i < data.length; i++) {
						var timestamp = new Date(data[i].createdAt).toLocaleString();
						var boundarySignature = {photoname: data[i].name, photoid: data[i].id};
						var temp = ($.type(data[i].name) == 'string')?data[i].name:'no-image.png';
						html = html + '<div class = "photo-boundary left" id = "album-boundary'+data[i].id+'" hidden>'+
										'<div class = "album-thumb">'+
											'<a><img id = "album-thumb'+data[i].id+
											'" src="/images'+ data[i].photoPath +temp+
											'" alt="no-image" title = "'+data[i].name+'">'+
											'</a>'+
											'<div id = "toggle-background"></div>'+
											'<div id = "toggle"><strong class = "font-tiny col-60 left font-tiny">'+timestamp+
																'</strong><a href = "javascript:deletePhoto(\''+data[i].name+'\',\''+data[i].id +'\')"><div  id = "delete-photo" class = "button-danger-tiny right col-30">Delete</div></a></div>'+
										'</div>'+
									'</div>';
						user.numberOfPhoto = data[i].numberOfPhoto;
						if (data.length < 8 || $('.album-boundary').length == data[i].numberOfPhoto) {
							$('#show-more-photo').hide();
						};
					};	
					
				} else {
					if ($('.photo-boundary').length == 0) {$('#show-all-album').append('This album contains no photos.')};		
					$('#show-more-photo').hide();
				}
				$('#show-all-album').append(html);
				$('.photo-boundary').fadeIn(500);
				if ($('.photo-boundary').length == user.numberOfPhoto) {
					$('#show-more-photo').hide();
				};
		
				window.deletePhoto = function(name, id){
					if (confirm('Do you want to DELETE THIS PHOTO ?')) {
						$.ajax({
							type: 'POST',
							url: '/admin/photo/delete',
							data: {photoname: name, photoid: id},
							success: function(data){
								$('#album-boundary'+ id).remove();
								$('body').showNoti($('body'), 'Delete photo file success!');
								//getPhoto();
								//alert('Delete file success.');
								
							},
							error: function(err){
								$('body').showNoti($('body'), 'Delete photo file FAILED!');
								//alert('Delete file failed.');
							}
						});
					}
				}
			},
			error: function(err){
				console.log('From get all album: ' + err);
			}
		});
	}
	// Onclick show pop-up
	$('#show-all-album').on('click', '[id *= "album-thumb"]',function(){
		$(this).popup();
	});

	$('#show-more-photo').click(function(){
		$(this).css({'transition': 'scale3d(0.5, 0.5, 0.5) linear 1s'});
		getPhoto();
	});

	$('#add-photo-tool').click(function(){
		$(this).css({'transition': 'scale3d(0.5, 0.5, 0.5) linear 1s'});
		$('#add-photo-form').toggle(200);
		if (parseInt($(this).data('show'))==1) {
			$(this).text('Cancel');	
		} else {
			$(this).text('Add photo');	
		}
		$(this).data('show', parseInt($(this).data('show'))*-1);
	});

	$('#fake-choose-file').click(function(){
		$('#file').trigger('click');
	})

	$('#file').change(function(){
		var fileName = $(this).val();//.substr(12, $(this).val().length);
		$('#file-info').html(fileName.split('\\')[fileName.split('\\').length-1]);
	});

	$('#add-photo').click(function(){
		if ($('#file-info').text() == '') {
			$('body').showNoti($('body'), 'You DID NOT choose a file to upload!');
		} else {
			var reader = new FileReader();
	    	reader.onload = function(data){
	    		// Simple code generator:
	    			var code = new Date();
	    			//var origin = $('#file-info').text() + a.toSeconds();

	    		// End hash code maker
	    		console.log(data);
	    		var batch = {bin: btoa(data.target.result), filename: $('#file-info').text(), fileid: code.getTime()}
	    		$.ajax({
	    			type: 'POST',
	    			url: '/admin/photo/upload',
	    			data: batch,
	    			success: function(data){
	    				$('body > .container').showNoti($('body > .container'), 'Okay. Uploaded!');
	    				//alert('Okay. Uploaded!');
	    				getUserState(function(){});
	    				window.location.href = window.location.href;
	    			},
	    			error: function(err){
	    				alert('Oopps! Err: ' + err);
	    			}
	    		});
	    	}
			reader.readAsBinaryString($('#file')[0].files[0]);			
		}
		
	});
	
	// Change background
	changeback('tempstyle');
	setInterval(function(){changeback('tempstyle')}, 3500);
	//$('#backgound-color').addClass('fdas');
});
