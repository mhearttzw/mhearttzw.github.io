
/**----------------封装treeNode类型---------------**/
function treeNode(obj) {
	this.data= obj.data;
	this.parent= obj.parent;
	this.childs= obj.childs||[];
	this.selfElement= obj.selfElement;
	this.selfElement.treeNode= this;
}

treeNode.prototype= {
	constructor: treeNode,
	render: function(arrow, visibility, toHighlight, deHighlight) {
		if(arguments.length<3) {
			toHighlight= false;
			deHighlight= false;
		}
		if(arrow) {
			if(this.isLeaf()) {
				this.selfElement.getElementsByClassName("arrow")[0].className= "arrow empty-arrow";
			} else if(this.isFolded()) {
				this.selfElement.getElementsByClassName("arrow")[0].className= "arrow right-arrow";
			} else {
				this.selfElement.getElementsByClassName("arrow")[0].className= "arrow down-arrow";
			}
		}
		if(visibility) {
			if(this.selfElement.className== "item-visible") {
				this.selfElement.className= "item-hidden";
			} else {
				this.selfElement.className= "item-visible";
			}
		}
		if(toHighlight) {
			this.selfElement.getElementsByClassName("node-title")[0].className= "node-title highLight";
		}
		if(deHighlight) {
			this.selfElement.getElementsByClassName("node-title")[0].className= "node-title";
		}
	},

	deleteNode: function() {
		//这里考虑是不是直接删除子节点就好了
		if(!this.isLeaf()) {
			for(var i=0; i<this.childs.length; i++) {
				this.childs.deleteNode();
			}
		}
		this.parent.selfElement.removeChild(this.selfElement);
		for(var i=0; i<this.parent.childs.length; i++) {
			if(this.parent.childs[i]== this) {
				this.parent.splice(i, 1);
				break;
			}
		}
		//这里要渲染改变箭头方向么？
		this.parent.render(true, false);
	},

	addChild: function(text) {
		//if(text== null) return this;
		if(text=="") {
			alert("节点内容不能为空！");
			return this;
		}
		if(!this.isLeaf()&& this.isFolded()) {
			this.toggleFold();
		}
		var item= document.createElement("div");
		item.className= "item-visible";
		var node= document.createElement("dd");
		node.className= "node";
		var arrow= document.createElement("span");
		arrow.className= "arrow empty-arrow";
		var nodeTitle= document.createElement("span");
		nodeTitle.className= "node-title";
		nodeTitle.innerHTML= text;
		var space= document.createElement("span");
		space.innerHTML= "&nbsp;&nbsp;";
		var addImg= document.createElement("img");
		addImg.className= "addIcon";
		addImg.src= "img/add.png";
		var deleteImg= document.createElement("img");
		deleteImg.className= "deleteIcon";
		deleteImg.src= "img/delete.png";
		node.appendChild(arrow);
		node.appendChild(nodeTitle);
		node.appendChild(space);
		node.appendChild(addImg);
		node.appendChild(deleteImg);
		item.appendChild(node);
		this.selfElement.appendChild(item);
		this.childs.push(new treeNode({
			data: text,
			parent: this,
			childs: [],
			selfElement: item
		}));
		this.render(true, false);
		return this;
	},

	toggleFold: function() {
		if(this.isLeaf()) {
			return this;
		} else {
			for(var i=0; i<this.childs.length; i++) {
				this.childs[i].render(false, true);
			}
			this.render(true, false);
			return this;
		}
	},

	isLeaf: function() {
		return this.childs.length=== 0;
	},

	isFolded: function() {
		if(this.isLeaf()) return false;
		if(this.childs[0].selfElement.className.indexOf("item-visible")!==-1) return false;
		return true;
	}
}

/**------------------事件绑定区-----------------**/
var root= new treeNode({
	data: "奶茶",
	parent: null,
	childs: [],
	selfElement: document.getElementsByClassName("item-visible")[0]
});
root.search= function(text) {
	var queue= [],
		resultList= [],
		current= this;
	queue.push(current);
	while(queue.length!= 0) {
		var tmp= queue.shift();
		tmp.render(false, false, false, true);
		if(tmp.data=== text) resultList.push(tmp);
		if(!tmp.isLeaf()) {
			for(var i=0; i<tmp.childs.length; i++) {
				queue.push(tmp.childs[i]);
			}
		}
	}
	return resultList;
}
//为root绑定事件代理，处理节点点击事件
addEvent(root.selfElement, "click", function(e) {
	var target= e.target|| e.srcElement;
	var domItem= target;
	while(domItem.className.indexOf("item")== -1) {
		domItem= domItem.parentNode;
	}
	selectedNode= domItem.treeNode;
	if(target.className.indexOf("arrow")!= -1|| target.className.indexOf("node-title")!= -1) {
		selectedNode.toggleFold();
	}
	if(target.className.indexOf("addIcon")!= -1) {
		selectedNode.addChild(prompt("请输入节点内容！"));
	}
	if(target.className.indexOf("deleteIcon")!= -1) {
		selectedNode.deleteNode();
	}
});
//搜索事件绑定
addEvent(document.getElementById("search-btn"), "click", function(e) {
	var text= document.getElementsByClassName("input")[0].value.trim();
	if(text=="") {
		document.getElementById("result").innerHTML= "请输入搜索内容！";
		alert("请输入查询内容！");
		return;
	}
	var resultList= root.search(text);
	if(resultList.length=== 0) {
		document.getElementById("result").innerHTML= "没有符合查询的节点！";
	} else {
		document.getElementById("result").innerHTML= "查询到"+ resultList.length+ "个节点";
		var pathNode;
		for(var i=0; i<resultList.length; i++) {
			pathNode= resultList[i];
			pathNode.render(false, false, true, false);
			while(pathNode.parent!== null) {
				if(pathNode.selfElement.className.indexOf("item-hidden")!= -1) {
					pathNode.parent.toggleFold();
					//alert("1");
				}
				pathNode= pathNode.parent;
			}
		}
	}

});
//绑定清除函数
addEvent(document.getElementById("delete-btn"), "click", function(e) {
	document.getElementsByClassName("input")[0].value= "";
	root.search(null);
	document.getElementById("result").innerHTML= "";
})

/**---------跨浏览器兼容的工具函数-------------**/
function addEvent(element, type, handler) {
	if(element.addEventListener) {
		element.addEventListener(type, handler);
	} else if(element.attachEvent) {
		element.attachEvent("on"+ type, handler);
	} else {
		element["on"+ type]= handler;
	}
}

/*----------------------初始化------------------------*/

//===================动态生成树形列表===================
root.addChild("优乐美").addChild("香飘飘").addChild("力士");
root.childs[0].addChild("JavaScript").addChild("CSS").addChild("HTML").toggleFold();
root.childs[0].childs[0].addChild("aweson");
root.childs[1].addChild("Jason").toggleFold();
root.childs[2].addChild("Jane").toggleFold();

//==============初始化查询==============
document.getElementsByClassName("input")[0].value= "JavaScript";