var menu = [
	['第一阶段',
		['ife/step_1/task_01/a.html', '任务一'],
		['ife/step_1/task_02/a.html', '任务二']
	]
];

var list = '';
for (var i=0; i<menu.length; i++) {
	for(var j=0; j<menu[i].length; j++) {
		if(j==0) {
			list += '<div class="myMenu"><dt class="menuTitle">' +menu[i][0]+ '</dt><div class="menuCon">';
		} else {
			list += '<dd><a href="' +menu[i][j][0]+ '" target="_blank">' +j+ ".&nbsp;" +menu[i][j][1]+ '</a></dd>';
		}
	}
	list += '</div></div>'
}
	
list = '<div class="menu"><dl>' +list+ '</dl></div>';
window.onload = function() {
	document.body.innerHTML = list;
}
