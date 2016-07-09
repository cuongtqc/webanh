$(document).ready(function(){
	$.fn.popup = function(){
		html = 	'<div id = "pop-up-bounder">'+ '<div class = "pop-up-image">' +
					'<img id = "pop-up-image" src = "'+$(this).find('a').find('img').prop('src')+'"></img>'+
					'<img class = "button-close" src = "../images/close.png"></img>'+
					'</div>'+
				'</div>';
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
	// Pagination will be add into table parents(where) with id = id
	$.fn.generatePagination = function(where, limit, id){
		var limit = parseInt(limit);
		var albumlist = $(this).find('tbody').find('tr');
		console.log(albumlist);
		console.log(albumlist.length);

		var numberOfPage = parseInt(albumlist.length / limit); // find number of full page
		if (albumlist.length % limit != 0) {numberOfPage++}; // take the remaining needed page
		var changePage = function(from, to){
			for (var i = 0; i < albumlist.length; i++) {
				if ((i+1)>=from && (i+1)<=to) {
					$(albumlist[i]).show();
				} else {
					$(albumlist[i]).hide();
				}
			};

		};

		var listpage = "";

		for (var i = 0; i < numberOfPage; i++) {
			var from = i * limit +1;
			var to = ((i+1)*limit < albumlist.length)? (from + limit -1):(albumlist.length) ;
			listpage += '<li class = "page"><a href = "javascript:void(0)" data-from = "'+from+'" data-to = "'+to+'" >'+ (i+1) +'</a></li>';
		}

		var html = '<div id = "'+id+'" class = "pagination margin-standard">'+
						'<li class = "page"><a href = "javascript:void(0)" data-from = "'+0+'" data-to = "'+((limit>albumlist.length)?albumlist.length:limit)+'">Lastest</a></li>' +
							listpage +
						'<li class = "page"><a href = "javascript:void(0)" data-from = "'+(parseInt(albumlist.length/limit)*limit+1)+'" data-to = "'+albumlist.length+'">Oldest</a></li>' +
					'</div>';
		$(this).parents(where).append(html);
		console.log($('#'+id+'>li a'));
		
		$('#'+id + '>li a').on('click', function(){
			changePage(parseInt($(this).data('from')), parseInt($(this).data('to')));
		});
	}
});