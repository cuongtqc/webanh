
$(document).ready(function(){

	$.fn.popup = function(){
		html = 	'<div id = "pop-up-bounder">'+ 
					'<div class = "pop-up-image-and-button">' + 
						'<img id = "pop-up-image" src = "'+$(this).prop('src')+'"></img>'+
						'<img class = "button-close" src = "/images/close.png"></img>'+
					'</div>'+
				'</div>';
		
		$(document).children('#pup-up-bounder').remove();
		if ($(document).children('#pup-up-bounder').length == 0) {
			$(this).parents('body').append(html);
				
		}
		$('body').on('click', '#pop-up-bounder .button-close', function(){
			$(this).parent().parent().remove();	
		});
		$('body').on('click', '#pop-up-bounder :not("#pop-up-image")', function(){
			$(this).parent().remove();	
		})
	}

	$.fn.toggleUp = function(distance, child){
		child.animate({bottom:distance}, 300, function(){
		});
	}

	$.fn.showNoti = function(where, noti){
		
		if (!where) { where = $(this)}
		var html = '<div class = "showError left">'+noti+'</div>';
		var notibar = '<div id = "notiBar"> </div>';
		if ($('#notiBar').length == 0) {
			where.append($(notibar));
		}

		if ($('#notiBar .showError').length > 0) { $(html).insertBefore('#notiBar .showError:last-child')}
		else {
			$('#notiBar').append($(html));
		}
		
		$('#notiBar .showError').animate({boxShadow:"2px 2px 5px 5px white", color:"#f2b632", opacity:0.6},800)
		.animate({boxShadow:"2px 2px 100px 100px white", color:"#e05038", opacity: 1},800).animate({boxShadow:"2px 2px 5px 5px white", color:"#f2b632", opacity:0.6},800)
		.animate({boxShadow:"2px 2px 100px 100px white", color:"#e05038", opacity: 1},800).animate({boxShadow:"2px 2px 5px 5px white", color:"#f2b632", opacity:0.6},800)
		.animate({boxShadow:"2px 2px 100px 100px white", color:"#e05038", opacity: 1},800).animate({boxShadow:"2px 2px 5px 5px white", color:"#f2b632", opacity:0.6},800)
		.animate({boxShadow:"2px 2px 100px 100px white", color:"#e05038", opacity: 1},800).animate({boxShadow:"2px 2px 5px 5px white", color:"#f2b632", opacity:1},800, function(){
			$(this).remove();
			if ($('#notiBar .showError').length == 0) { $('#notiBar').remove();}
		});
	}

	// This plugin apply for a table with table-id 
	// to generate corresponding pagination.
	// Pagination will be add into table parents(where) with id = id and total = total element
	$.fn.generatePagination = function(where, limit, id, total, getdata){
		var limit = parseInt(limit);
		var albumlist = $(this).find('tbody').find('tr');

		var numberOfPage = parseInt(total / limit); // find number of full page
		if (total % limit != 0) {numberOfPage++}; // take the remaining needed page

		var changePage = function(from, to){
			getdata(from-1, 10, {sortBy: 'default', by: 'ASC'}).then(function(){
				$('#'+id).remove();
			});
		};

		var listpage = "";

		for (var i = 0; i < numberOfPage; i++) {
			var from = i * limit +1;
			var to = ((i+1)*limit < total)? (from + limit -1):(total) ;
			listpage += '<li class = "page"><a href = "javascript:void(0)" data-from = "'+from+'" data-to = "'+to+'" >'+ (i+1) +'</a></li>';
		}

		var html = '<div id = "'+id+'" class = "pagination margin-standard">'+
							listpage +
					'</div>';
		$(this).parents(where).append(html);
		
		$('#'+id + '>li a').on('click', function(){
			$(this).addClass('active').siblings().removeClass('active');
			changePage(parseInt($(this).data('from')), parseInt($(this).data('to')));
		});
	}

	// Change background
	window.changeback = function(id){
		var slide = $('#'+ id);
		var photo = '';
		// http://2.bp.blogspot.com/-XL3uMFpR0bs/Vjb_1deps8I/AAAAAAAA9IE/8klXmaJKxSI/s1600/hot-girl-8.jpg
		var promise = $.ajax({
			type: 'GET',
			url: '/resource/flyBackground',
			success: function(data){
				if (data.length == 0) {
					photo = '../../images/loginboard.jpg';
					slide.text('.background-color0:after {content: "";background:url("'+photo+'") no-repeat;background-size: 100% 100%;opacity: 0.6;width: 100%;height: 100%;position: fixed;top: 0px;left: 0px;/*z-index: -1;*/');
				} else {
					photo = '../../images' + data[0].photoPath + data[0].name;
					slide.text('.background-color0 {width: 100%;height: 100%;position: relative;top: 0px;left: 0px;} body > .background-color0:after {content: "";background:url("'+photo+'") no-repeat;background-size: cover; background-position: 50% 30%;opacity: 0.5;width: 100%;height: 100%;position: fixed;top: 0px;left: 0px; transition: background ease-in-out 1s');					
					$('#background-color').attr('class','background-color0');

				}	
			},
			error: function(err){
				console.log(err);
			}

		});
		return promise;
	}
});