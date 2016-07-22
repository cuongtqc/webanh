var flowText = function(string){
	var char = string.substr(1, string.length -1);
	char += string[0];
	return char;
}
alert('tool');
var tooltip = $('.tooltip-text');
for( var i = 0; i < tooltip.length; i++){
	$(tooltip[i]).text(flowText($(tooltip[i]).text()));
	setInterval(function(){
		$(tooltip[i]).text(flowText($(tooltip[i]).text()));
		console.log('==========')
	}, 500);
}
