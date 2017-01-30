var btns= document.getElementsByClassName("btn-items"),
	root= document.getElementsByClassName("root")[0],
	timer= null,
	NodeLists= [],
	bfIndex= 0,
	lock= false;

function preorder() {

}

function traverseDf(node, NodeLists) {
	if(node) {
		NodeLists.push(node);
		for(var i=0; i<node.children.length; i++) {
			traverseDf(node.children[i], NodeLists);
		}
	}
}

function traverseBf(node, NodeLists) {
	if(node) {
		NodeLists.push(node);
		traverseBf(node.nextElementSibling, NodeLists);
		node= NodeLists[bfIndex++];
		traverseBf(node.firstElementChild, NodeLists);
	}
}

function colorChange(NodeLists, text) {
	var i= 0;
	
	if(text== NodeLists[i].firstChild.nodeValue.replace(/(^\s*)|(\s*$)/g, "")) {
		NodeLists[i].style.background= "#5780CD";
		alert(NodeLists[i].firstChild.nodeValue.replace(/(^\s*)|(\s*$)/g, ""));
		clearInterval(timer);
		lock= false;
	} else {
		NodeLists[i].style.background= "#E43F3F";
		lock= true;
		timer= setInterval(function() {
				i++;
				NodeLists[i-1].style.background= "#fff";
				if(i<NodeLists.length) {
					if(text== NodeLists[i].firstChild.nodeValue.replace(/(^\s*)|(\s*$)/g, "")) {
							NodeLists[i].style.background= "#5780CD";

							clearInterval(timer);
							lock= false;
					} else {
						NodeLists[i].style.background= "#E43F3F";
						
					}
				} else {
					//NodeLists[i-1].style.background= "#fff";
					clearInterval(timer);
					lock= false;
				}
		}, 500);
	}
	
}

function traverse(btnIndex) {
	NodeLists= [];
	alert("sss");
	switch(btnIndex) {
		case 0: traverseDf(root, NodeLists);
		//alert(NodeLists);
		   		break;
		case 1: bfIndex= 0;
				traverseBf(root, NodeLists);
				alert(NodeLists);
				break;
		case 2: traverseDf(root, NodeLists);
				var text= document.getElementsByClassName("input")[0].value;
				break;
		case 3: traverseBf(root, NodeLists);
				bfIndex= 0;
				var text= document.getElementsByClassName("input")[0].value;
				break;

	}
	
	reset(NodeLists);
	colorChange(NodeLists, text);
}

function reset(NodeLists) {
	for(var i=0; i<NodeLists.length; i++) {
		NodeLists[i].style.background= "#fff";
	}
}

function init() {
	for(var i=0; i<btns.length; i++) {
		(function(i){
		btns[i].onclick= function() {
				if(lock== true) {
					alert("正在遍历！");
				} else {
					traverse(i);
				}
			}
		}(i));
	}
}

init();