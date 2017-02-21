//飞船属性获取执行闭包
(function () {
	var DEFAULT_DISCHARGE= 0.5;

    var SPACESHIP_SPEED_LOW= 3,
    	SPACESHIP_SPEED_MEDIUM= 5,
    	SPACESHIP_SPEED_HIGH= 8,
        SPACESHIP_SIZE= 40,
        CHARGE_RATE_LOW= 0.3,
        CHARGE_RATE_MEDIUM= 1,
        CHARGE_RATE_HIGH= 2;

    var	LAUNCH_CODE= "00",
    	FLY_CODE= "01",
    	STOP_CODE= "10",
    	DESTROY_CODE= "11",
    	CHRG_CODE_NULL= "00",
     	CHRG_CODE_LOW= "01",
    	CHRG_CODE_MEDIUM= "10",
    	CHRG_CODE_HIGH= "11",
    	SPEED_CODE_NULL= "00",
        SPEED_CODE_LOW= "01",
    	SPEED_CODE_MEDIUM= "10",
    	SPEED_CODE_HIGH= "11";

    var POWERBAR_POS_OFFSET= 5,
    	POWERBAR_COLOR_GOOD= "#516AEA",
    	POWERBAR_COLOR_MEDIUM= "#EDF406",
    	POWERBAR_COLOR_BAD= "#FD2943",
    	POWERBAR_WIDTH= 5;

    var SCREEN_WIDTH= 750,
    	SCREEN_HEIGHT= 610,
    	SCREEN_CENTERX= SCREEN_WIDTH/ 2,
    	SCREEN_CENTERY= SCREEN_HEIGHT/ 2;

    var PLANET_RADIUS= 50,
    	ORBIT_LENGTH= 4;

    var BUS_TRANSMIT_SPEED= 300,
    	BUS_FAILURE_RATE= 0.1;


	//根据浏览器类型设置相应的requestAnimationFrame
    requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;



	var Spaceship= function(msg) {
		this.id= msg.id;
		this.mediator= null;
		this.timer= null;
		this.orbit= 100+50*msg.id- SPACESHIP_SIZE/2;
		this.deg= 0;
		this.power= 100;
		this.currState= "stop";
		this.spd= msg.spd;
		this.chrg= msg.chrg;
	}

	Spaceship.prototype= {
		powerSystem: function() {
			var self= this;
			var fly= function() {
				self.timer= setInterval( function() {
					self.deg+= self.spd;
					if(self.deg> 360) {self.deg= 0;}
				}, 30);
				ConsoleUtil.show("Spaceship No"+self.id+ " fly!");
			};
			var stop= function() {
				clearInterval(self.timer);
				ConsoleUtil.show("spaceship stop!");
			};
			return {
				fly: fly,
				stop: stop
			};
		},

		energySystem: function() {
			var self= this;
			var charge= function() {
				var timer= setInterval(function() {
					if(self.currState=="fly"|| self.currState=="destroy") {
						clearInterval(timer);
						return false;
					}
					if(self.power> 100) {
						self.power= 100;
						clearInterval(timer);
						return false;
					} else {
						self.power+= self.chrg;
					}
				}, 30);
				return true;
			};
			var disCharge= function() {
				var timer= setInterval(function() {
					if(self.currState=="stop"|| self.currState=="destroy") {
						clearInterval(timer);
						return false;
					}
					if(self.power<0) {
						clearInterval(timer);
						self.power= 0;
						self.stateManager().changeState("stop");
						return false;
					} else {
						self.power-= DEFAULT_DISCHARGE;
					}
				}, 30);
			};
			return {
				charge: charge,
				disCharge: disCharge
			};
		},

		stateManager: function() {
			var self= this;
			var states= {
				fly: function(state) {
					self.currState= "fly";
					self.powerSystem().fly();
					self.energySystem().disCharge();
				},
				stop: function(state) {
					self.currState= "stop";
					self.powerSystem().stop();
					self.energySystem().charge();
				},
				destroy: function(state) {
					self.currState= "destroy";
					self.mediator.remove(self);
					//ConsoleUtil.deleteBtns(self.id);
				}
			};
			var changeState= function(state) {
				states[state]&&states[state]();
				ConsoleUtil.show("Spaceship No."+ self.id+ " state is "+ state);
			};
			return {
				changeState: changeState
			};
		},

		signalSystem: function() {
			var self= this;
			var receive= function(code, from) {
					var msg= MessageAdapter.decompile(code);
					if(self.currState!== msg.cmd&& self.id==msg.id) {
						self.stateManager().changeState(msg.cmd);
					}
			};
			return {
				receive: receive
			};
		}
	};



	var Commander= function() {
		var id= "Echelon",
			cmds= [],
			mediator= null;
	}

	Commander.prototype= {
		send: function(msg) {
			this.mediator.send(msg);
			ConsoleUtil.show("Commander send!");
		}
	};


	var Mediator= function() {
		var spaceships= new Array(4),
			commander= null;
		return {
			register: function(obj) {
				if(obj instanceof Commander) {
					obj.mediator=this;
					commander= obj;
					ConsoleUtil.show("Commander register success!");
				} else if(obj instanceof Spaceship) {
					obj.mediator= this;
					spaceships[obj.id]= obj;
					ConsoleUtil.show("Spaceship "+ obj.id+ " register success!");
				}
			},

			send: function(msg, from, to) {
				var code= MessageAdapter.compile(msg);
				alert("code "+code);
				BUS.transmit.apply(this, [code, from, to]);
			},

			create: function(msg) {
				var spaceship= new Spaceship(msg);
				this.register(spaceship);
			},

			remove: function(obj) {
				delete spaceships[obj.id];
			},

			getSpaceships: function() {
				return spaceships;
			}

		};
	};

	var BUS= {
		transmit: function(code, from, to) {
			var self= this,
				spaceships= self.getSpaceships();
			var timer= setInterval(function() {
				var success= Math.random()> BUS_FAILURE_RATE? true: false,
					msg= MessageAdapter.decompile(code);
				if(success) {
					clearInterval(timer);
					if(to) {
						to.receive(code, from);
					}
					if(msg.cmd== "launch") {
						self.create(msg);
					} else {
						for(var i=0; i<spaceships.length; i++) {
							if(spaceships[i]!== from) {
								spaceships[i].signalSystem().receive(code, from);
							}
						}
					}
				} else {
					ConsoleUtil.show("Transmit failure!");
				}
			}, BUS_TRANSMIT_SPEED);
		}
	}

	var Message= function(id, command, spd_type, chrg_type) {
		this.id= id;
		this.cmd= command;
		this.spd= spd_type;
		this.chrg= chrg_type;
	};

	var MessageAdapter= {
		compile: function(msg) {
			var idCode = msg.id.toString(2).length < 2 ? "0" + msg.id.toString(2) : msg.id.toString(2);
			var spdCode= null,
				chrgCode= null,
				cmdCode= null,
				code= null;
			switch(msg.cmd) {
				case "launch":
					cmdCode= LAUNCH_CODE;
					break;
				case "fly":
					cmdCode= FLY_CODE;
					break;
				case "stop":
					cmdCode= STOP_CODE;
					break;
				case "destroy":
					cmdCode= DESTROY_CODE;
					break;
				default:
					ConsoleUtil.show("Invalid cmd message!");
			}
			switch(msg.spd) {
				case "前进号":
					spdCode= SPEED_CODE_LOW;
					break;
				case "奔腾号":
					spdCode= SPEED_CODE_MEDIUM;
					break;
				case "超越号":
					spdCode= SPEED_CODE_HIGH;
					break;
				case undefined:
					spdCode= SPEED_CODE_NULL;
					break;
				default:
					ConsoleUtil.show("Invalid spd message!");
			}
			switch(msg.chrg) {
				case "劲量型":
					chrgCode= CHRG_CODE_LOW;
					break;
				case "光能型":
					chrgCode= CHRG_CODE_MEDIUM;
					break;
				case "永久型":
					chrgCode= CHRG_CODE_HIGH;
					break;
				case undefined:
					chrgCode= CHRG_CODE_NULL;
					break;
				default:
					ConsoleUtil.show("Invalid chrg message!");
			}
			code= idCode+ cmdCode+ spdCode+ chrgCode;
			ConsoleUtil.show(code);
			return code;
		},

		decompile: function(code) {
			var idCode= code.substring(0, 2),
				cmdCode= code.substring(2, 4),
				spdCode= code.substring(4,6),
				chrgCode= code.substring(6,8);
			var id= parseInt(idCode, 2),
				cmd= null,
				spd= null,
				chrg= null;
			switch(spdCode) {
				case SPEED_CODE_LOW:
					spd= SPACESHIP_SPEED_LOW;
					break;
				case SPEED_CODE_MEDIUM:
					spd= SPACESHIP_SPEED_MEDIUM;
					break;
				case SPEED_CODE_HIGH:
					spd= SPACESHIP_SPEED_HIGH;
					break;
				default:
					ConsoleUtil.show("Invalid spdCode message!");
			}
			switch(cmdCode) {
				case LAUNCH_CODE:
					cmd= "launch";
					break;
				case FLY_CODE:
				 	cmd= "fly";
				 	break;
				case STOP_CODE:
					cmd= "stop";
					break;
				case DESTROY_CODE:
					cmd= "destroy";
					break;
			}
			switch (chrgCode) {
				case CHRG_CODE_LOW:
					chrg= CHARGE_RATE_LOW;
					break;
				case CHRG_CODE_MEDIUM:
					chrg= CHARGE_RATE_MEDIUM;
					break;
				case CHRG_CODE_HIGH:
					chrg= CHARGE_RATE_HIGH;
					break;
				default:
					ConsoleUtil.show("Invalid chrgCode message!");
			}
			var message= new Message(id, cmd, spd, chrg);
			return message;
		}
	};

	var buttonHandle= function(mediator, commander) {
		//var mediator;	
		//$("#createBtn").on("click", function() {
		//});
		//$(".wrapper_ul").delegate()
		$(".wrapper").delegate(".btn", "click", function() {
			var $target= $(this);
			var cmd= $(this).attr("name");
			//var tempNum;
			switch(cmd)	{
				case "launch": 
						var spaceships= mediator.getSpaceships();
						var spd= $("input[type='radio'][name='speed']:checked").val(),
							chrg= $("input[type='radio'][name='chrg']:checked").val();
						//alert(spd);
						//alert(chrg);
						for(var i=0;i <spaceships.length; i++) {
							if(!spaceships[i]) {
								alert(spaceships.length);
								ConsoleUtil.addBtns(i);
								var message= new Message(i, cmd, spd, chrg);
								commander.send(message);
								break;
							}
						}
						break;
				case "fly":
				case "stop":
						var id= parseInt($(this).parent().children("span").html().substr(0,1), 10);
						alert(id);
						var message= new Message(id, cmd);
						commander.send(message);
						alert("fly");
						break;
				case "destroy":
						ConsoleUtil.deleteBtns($target);
						var id= parseInt($(this).parent().children("span").html().substr(0,1), 10);
						var message= new Message(id, cmd);
						commander.send(message);
						break;
				default:
						alert("Invalid commander!");}
		});

		//var setMediator = function(_mediator) {
        //    mediator = _mediator;
        //};
        //return {
        //	setMediator: setMediator
        //};
	};

	var animaUtil= (function() {
			var mediator= null;

			var canvas= document.getElementById("front");
			canvas.width= SCREEN_WIDTH;
			canvas.height= SCREEN_HEIGHT;
			var canvasCtx= canvas.getContext("2d");
	
			//缓存画布
			var cacheCanvas= document.createElement("canvas");
			cacheCanvas.width= SCREEN_WIDTH;
			cacheCanvas.height= SCREEN_HEIGHT;
			var cacheCtx= cacheCanvas.getContext("2d");

			var drawPlanet= function(_ctx) {
				var x= SCREEN_CENTERX- PLANET_RADIUS,
					y= SCREEN_CENTERY- PLANET_RADIUS;
				var planetImg= new Image();
				planetImg.src= "img/min-iconfont-planet.png";
				planetImg.onload= function() {
					_ctx.drawImage(planetImg, x, y, PLANET_RADIUS*2, PLANET_RADIUS*2);
				};
			};

			var drawOrbit= function(_ctx) {
				for(var i=0; i<ORBIT_LENGTH; i++) {
					_ctx.strokeStyle= "#4E7FC8";
					_ctx.beginPath();
					_ctx.arc(SCREEN_CENTERX, SCREEN_CENTERY, 100+50*i, 0, 2*Math.PI);
					_ctx.closePath();
					_ctx.stroke();
				}
			};

			(function() {
				var canvas= document.getElementById("background");
				canvas.width= SCREEN_WIDTH;
				canvas.height= SCREEN_HEIGHT;
				var _ctx= canvas.getContext("2d");
				drawPlanet(_ctx);
				drawOrbit(_ctx);
			})();

			var drawSpaceship= function(ctx, spaceship) {
				var spaceshipImg= new Image();
				spaceshipImg.src= "img/min-iconfont-rocket-active.png";
				spaceshipImg.onload= function() {
				try	{
						ctx.save(); //alert("enter");
						ctx.translate(SCREEN_CENTERX, SCREEN_CENTERY);
						ctx.rotate(-spaceship.deg *Math.PI/180);
						//alert(spaceship.power);
						if(spaceship.power>80) {
							ctx.strokeStyle= POWERBAR_COLOR_GOOD;
						} else if(spaceship.power> 60) {
							ctx.strokeStyle= POWERBAR_COLOR_MEDIUM;
						} else {
							ctx.strokeStyle= POWERBAR_COLOR_BAD;
						}
						ctx.lineWidth= POWERBAR_WIDTH;
						ctx.beginPath();
						ctx.moveTo(spaceship.orbit, -POWERBAR_POS_OFFSET);
						ctx.lineTo(spaceship.orbit+ SPACESHIP_SIZE*(spaceship.power/ 100), -POWERBAR_POS_OFFSET);
						ctx.stroke();
						ctx.drawImage(spaceshipImg, spaceship.orbit, 0, SPACESHIP_SIZE, SPACESHIP_SIZE);
						ctx.restore();
						canvasCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
						canvasCtx.drawImage(cacheCanvas, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
						return true;
					} catch(error) {
						alert("false");
						return false;
					}
				};
			};

			var onDraw= function(spaceships) {
				if(!(spaceships.every(function(item, index) {
					return item=== undefined;
				 }))) {
					cacheCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
					for(var i=0; i<spaceships.length; i++) {
						if(spaceships[i]!==undefined) {
							drawSpaceship(cacheCtx, spaceships[i]);
						}
					}
				} else {
					canvasCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
				}
			};

			var animaLoop= function() {
				var spaceships= mediator.getSpaceships();
				requestAnimationFrame(animaLoop);
				onDraw(spaceships);
			};

			var setMediator= function(_mediator) {
				mediator= _mediator;
			};

			return {
				setMediator: setMediator,
				animaLoop: animaLoop
			}

		})();


	/**
     * [控制台工具 负责显示运行信息 添加删除飞船栏目]
     */
    var ConsoleUtil = (function() {
        var $consoleLog = $("#console ul");
        var show = function(msg) {
            var $msg = $("<li></li>");
            $msg.text(msg);
            $consoleLog.prepend($msg);
        };
        var addBtns= function(id) {
        	var wrapper= document.querySelector("ul.wrapper_ul"),
        		wrapperLi= document.createElement("li");
        		wrapperLi.className= "wrapper_li";
        	var	span= document.createElement("span");
        	span.className= "name";
        	span.innerHTML= id+ "号飞船";
        	var flyBtn= document.createElement("input"),
        		stopBtn= document.createElement("input"),
        		destroyBtn= document.createElement("input");
        	flyBtn.className= "btn";
        	flyBtn.setAttribute("type", "button");
        	flyBtn.setAttribute("value", "fly");
        	flyBtn.setAttribute("name", "fly");
        	stopBtn.className= "btn";
        	stopBtn.setAttribute("type", "button");
        	stopBtn.setAttribute("value", "stop");
        	stopBtn.setAttribute("name", "stop");
        	destroyBtn.className= "btn";
        	destroyBtn.setAttribute("type", "button");
        	destroyBtn.setAttribute("value", "destroy");
        	destroyBtn.setAttribute("name", "destroy");
        	wrapperLi.appendChild(span);
        	wrapperLi.appendChild(flyBtn);
        	wrapperLi.appendChild(stopBtn);
        	wrapperLi.appendChild(destroyBtn);
        	wrapper.appendChild(wrapperLi);
        };
        var deleteBtns= function(target) {
        	target.parent().remove();
        };
        return {
            show: show,
            addBtns: addBtns,
            deleteBtns: deleteBtns
        };
    })();


    window.onload= function() {
    	var mediator= new Mediator();
    	var commander= new Commander();
    	mediator.register(commander);
    	buttonHandle(mediator, commander);
    	animaUtil.setMediator(mediator);
    	animaUtil.animaLoop();
    }


})();