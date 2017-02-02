var btns= document.getElementsByClassName("btn-items"),
	root= document.getElementsByClassName("root")[0],
	deleteBtn= document.getElementById("btn-delete"),
	insertBtn= document.getElementById("btn-insert"),
	timer= null,
	NodeLists= [],
	bfIndex= 0,
	lock= false,
	selectedDiv;


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
	switch(btnIndex) {
		case 0: traverseDf(root, NodeLists);
		//alert(NodeLists);
		   		break;
		case 1: bfIndex= 0;
				traverseBf(root, NodeLists);
				//alert(NodeLists);
				break;
		case 2: var text= document.getElementsByClassName("input")[0].value;
				alert(text);
				if(text=== ""){
					alert("请输入要选中的节点！");
					break;
				}
				traverseDf(root, NodeLists);
				break;
		case 3: var text= document.getElementsByClassName("input")[0].value;
				alert(text);
				if(text=== ""){
					alert("请输入要选中的节点！");
					break;
				}
				traverseBf(root, NodeLists);
				bfIndex= 0;
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

//鼠标点击颜色变换函数	
function select() {
	var divs= document.getElementsByTagName("section")[0].getElementsByTagName("div");
	for(var i=0; i< divs.length; i++) {
		divs[i].onclick= function(e) {
			clearInterval(timer);
			reset(divs);
			this.style.background= "#4A71E0";
			e.stopPropagation();
			selectedDiv= this;
		}
	} 
}

function deleteItem() {
		if(selectedDiv=== undefined){
			alert("请选中要操作的节点！");
		} else {
			//alert(selectedDiv);
			var parent= selectedDiv.parentNode;
			//alert(parent);
			parent.removeChild(selectedDiv);
		}
}

function insertItem() {
	var text= document.getElementsByClassName("input")[1].value;
	if(text=== "") {
		alert("请输入内容！")
	} else if(selectedDiv=== undefined){
		alert("请选中要操作的节点！")
	} else {
		var newDiv= document.createElement("div");
			newDiv.className= "items";
			//alert(text);
			newDiv.innerHTML= text;
		selectedDiv.appendChild(newDiv);
		select();
	}

}

function init() {
	select();
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
	deleteBtn.onclick= function() {deleteItem()};
	insertBtn.onclick= function() {insertItem()};
}

init();