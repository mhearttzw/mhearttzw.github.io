var menu = [
	['第一阶段',
		['ife/step_1/task_01/a.html', '任务一'],
		['ife/step_1/task_02/a.html', '任务二'],
		['ife/step_1/task_03/a.html', '任务三'],
		['ife/step_1/task_04/a.html', '任务四'],
		['ife/step_1/task_05/a.html', '任务五'],
		['ife/step_1/task_06/a.html', '任务六'],
		['ife/step_1/task_07/a.html', '任务七']
	],
	['第二阶段',
		['ife/step_2/task_01/a.html', '任务一'],
		['ife/step_2/task_22/a.html', '任务二十二'],
		['ife/step_2/task_23/a.html', '任务二十三'],
		['ife/step_2/task_24/a.html', '任务二十四'],
		['ife/step_2/task_25/a.html', '任务二十五'],
		['ife/step_2/task_26/a.html', '任务二十六'],
		['ife/step_2/task_27/a.html', '任务二十七']
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
