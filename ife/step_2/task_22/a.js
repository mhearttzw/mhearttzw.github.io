var items= [],
	timer= null,
	root= document.getElementsByClassName('root')[0],
	btn= document.getElementsByClassName('btn-item'),
	preBtn= btn[0],
	midBtn= btn[1],
	postBtn= btn[2];

window.onload= function() {
	preBtn.onclick= function() {
		reset();
		preOrder(root);	
			//alert(items.length);
		colorChange();
	};
	midBtn.onclick= function() {
		reset();
		midOrder(root);
		//alert(items.length);	
		colorChange();
	};
	postBtn.onclick= function() {
		reset();
		postOrder(root);
		colorChange();
	}
};

//前序遍历
/*function preOrder(node) {
	if (!(node == null)) {
	items.push(node);
	preOrder(node.firstElementChild);
	preOrder(node.lastElementChild);
	}
}*/
function preOrder(node) {
	if(!(node == null)) {
		items.push(node);
		preOrder(node.firstElementChild);
		preOrder(node.lastElementChild);
	}
}
//中序遍历
function midOrder(node) {
	if(!(node == null)) {
		midOrder(node.firstElementChild);
		items.push(node);
		midOrder(node.lastElementChild);
	}
}

//后序遍历
function postOrder(node) {
	if(null!==node) {
		postOrder(node.firstElementChild);
		postOrder(node.lastElementChild);
		items.push(node);
	}
}

//颜色改变函数
function colorChange() {
	var i= 0;
	items[i].style.background= '#4AA6ED';
	timer= setInterval(function(arguments) {
		i++;
		if(i< items.length) {
			items[i].style.background= '#4AA6ED';
			items[i-1].style.background= '#fff';
		} else {
			clearInterval(timer);
			items[i-1].style.background= '#fff';
		}
	}, 500);
}

//初始化
function reset() {
	items= [];
	clearInterval(timer);
	var div= document.getElementsByTagName('div');
	for(var i=0; i<div.length; i++) {
		div[i].style.background= '#fff';
	}
}