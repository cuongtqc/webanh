
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

	function getPhoto(){
		$.ajax({
			type: 'POST',
			url: '/admin/getPhoto/'+ user.currentAlbumName +'/'+($('.album-boundary').length),
			success: function(data){
				getUserState();
				var html = "";
				if (data.length!=0) {
					for (var i = 0; i < data.length; i++) {
						var timestamp = new Date(data[i].createdAt).toLocaleString();
						var boundarySignature = {photoname: data[i].name, photoid: data[i].id};
						var temp = ($.type(data[i].name) == 'string')?data[i].name:'no-image.png';
						html = html + '<div class = "album-boundary left" id = "album-boundary'+data[i].id+'">'+
										'<div class = "album-thumb">'+
											'<a><img id = "album-thumb'+data[i].id+
											'" src="/images/allalbum/'+data[i].album + '/'+temp+
											'" alt="no-image" title = "'+data[i].name+'">'+
											'</a>'+
											'<div id = "toggle-background"></div>'+
											'<div id = "toggle"><strong class = "font-tiny col-60 left font-tiny">'+timestamp+
																'</strong><a href = "javascript:deletePhoto(\''+data[i].name+'\',\''+data[i].id +'\')"><div  id = "delete-photo" class = "button-danger-tiny right col-30">Delete</div></a></div>'+
										'</div>'+
									'</div>';
						if (data.length < 8 ) {
							$('#show-more-photo').hide();
						};
					};	
					
				};
				$('#show-all-album').append(html);
				// Mouse hover show date created infor with custom JQ plugin 
				$('.album-thumb').on('mouseenter',function(){
						//alert('Up====');
						$(this).toggleUp('0px',$(this).children('#toggle'));
				});
				$('.album-thumb').on('mouseleave',function(){
						//alert('Down====');
						$(this).toggleUp('-30px', $(this).children('#toggle'));
				});
				window.deletePhoto = function(name, id){
		
					$.ajax({
						type: 'POST',
						url: '/admin/photo/delete',
						data: {photoname: name},
						success: function(data){
							$('#album-boundary'+ id).remove();
							alert('Delete file success.');
							
						},
						error: function(err){
							alert('Delete file failed.');
						}
					});
				}
			},
			error: function(err){
				console.log('From get all album: ' + err);
			}
		});
	}
	// Onclick show pop-up
	$('#show-all-album').on('click', '.album-thumb',function(){
		$(this).popup();
	});
	$('body').on('click', '#pop-up-bounder .button-close', function(){
		$(this).parent().parent().remove();	
	})
	$('#show-more-photo').click(getPhoto);
	$('#add-photo-tool').click(function(){
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
		var reader = new FileReader();
    	reader.onload = function(data){
    		//data = data.target.result;
    		console.log(data);
    		var batch = {bin: btoa(data.target.result), filename: $('#file-info').text()}
    		$.ajax({
    			type: 'POST',
    			url: '/admin/photo/upload',
    			data: batch,
    			success: function(data){
    				alert('Okay. Uploaded!');
    				getUserState(function(){});
    				window.location.href = window.location.href;
    			},
    			error: function(err){
    				alert('Oopps! Err: ' + err);
    			}
    		});
    	}
		reader.readAsBinaryString($('#file')[0].files[0]);		

	});
	

});
