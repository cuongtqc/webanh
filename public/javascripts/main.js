$(document).ready(function(){
	$.fn.popup = function(){
		html = 	'<div id = "pop-up-bounder">'+ 
					'<div class = "pop-up-image-and-button">' + 
						'<img id = "pop-up-image" src = "'+$(this).find('a').find('img').prop('src')+'"></img>'+
						'<img class = "button-close" src = "/images/close.png"></img>'+
					'</div>'+
				'</div>';
		
		$(document).children('#pup-up-bounder').remove();
		if ($(document).children('#pup-up-bounder').length == 0) {
			$(this).parents('body').append(html);
				
		}
	}

	$.fn.toggleUp = function(distance, child){
		child.animate({bottom:distance}, 300, function(){
		});
	}

	$.fn.sortTable = function(tableId, sortBy){

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
});