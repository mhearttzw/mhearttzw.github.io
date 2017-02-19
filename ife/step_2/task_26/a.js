(function() {
    var SCREEN_WIDTH= 750,
        SCREEN_HEIGHT= 720,
        SCREEN_CENTER_X= SCREEN_WIDTH/2,
        SCREEN_CENTER_Y= SCREEN_HEIGHT/2,
        PLANET_RADIUS= 50,
        ORBIT_COUNT= 4,
        SPACESHIP_SIZE= 40,
        SPACESHIP_SPEED= 2,
        FAILURE_RATE= 0.3,

        POWER_POS_OFFSET= 5,
        POWER_COLOR_GOOD= "#446DDF",
        POWER_COLOR_MEDIUM= "#F7CE23",
        POWER_COLOR_BAD= "#ED3D3D",
        POWER_WIDTH= 5;

    //根据浏览器类型设置相应的requestAnimationFrame
var   requestAnimation = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;



    var Spaceship= function(id){
        this.deg= 0;
        this.power= 100;
        this.mediator= null;
        this.id= id;
        this.currentState= "stop";
        this.orbit= 100+50*id-SPACESHIP_SIZE/2;
        this.timer= null;
    };

    Spaceship.prototype= {
        //动力系统
        powerSystem: function() {
            var self= this;
            var fly= function() {
                self.timer= setInterval(function() {
                    self.deg+= SPACESHIP_SPEED;
                    if(self.deg>360) {
                        self.deg= 0;
                    }
                }, 20);
                consoleUtil.show("Spaceship No." + self.id + " is flying.");
            };
            var stop= function() {
                clearInterval(self.timer);
                timer= null;
                consoleUtil.show("Spaceship No." + self.id + " has stop.");
            };
            return {
                fly: fly,
                stop: stop
            };
        },

        //能源系统
        energySystem: function() {
            var self= this;
            var charging= function() {
                var timer= setInterval(function() {
                    if(self.currentState== "fly" || self.currentState=="destroy") {
                        clearInterval(timer);
                        return false;
                    }
                    if(self.power>100) {
                        clearInterval(timer);
                        self.power= 100;
                        return false;
                    }
                    self.power+= 0.2;
                    return true;
                }, 30);
                consoleUtil.show("Spaceship No." + self.id + " is charging.");
            };
            var discharging= function() {
                var timer= setInterval(function() {
                    if(self.currentState=="stop"|| self.currentState=="destroy") {
                        clearInterval(timer);
                        return false;
                    }
                    if(self.power<0) {
                        clearInterval(timer);
                        self.power= 0;
                        self.stateManager().changeState("stop"); //能源用完是状态改变为stop
                        consoleUtil.show(self.power);
                        return false;
                    }
                    self.power-= 0.3;
                    //consoleUtil.show(self.power);
                    return true;
                }, 50);
                consoleUtil.show("Spaceship No." + self.id + " is discharging.");
            };
            return {
                charging: charging,
                discharging: discharging
            };
        },

        //状态改变系统使用状态模式来设计
        stateManager: function() {
            var self= this;
            var states= {
                fly: function() {
                    self.currentState= "fly";
                    self.powerSystem().fly();
                    self.energySystem().discharging();
                },
                stop: function() {
                    self.currentState= "stop";
                    self.powerSystem().stop();
                    self.energySystem().charging();
                },
                destroy: function() {
                    self.currentState= "destroy";
                    self.mediator.remove(self);
                }
            };
            //获取一种状态执行对应的方法
            var changeState= function(state) {
                states[state]&&states[state]();
                consoleUtil.show("Spaceship No." + self.id + " state is " + state);
            };
            return {
                changeState: changeState
            };
        },

        //信号接收系统
        singnalSystem: function() {
            var self= this;
            var receive= function(msg, from) {
                if(self.currentState!== msg.cmd&& self.id=== msg.id) {
                    self.stateManager().changeState(msg.cmd);
                }
            };
            return {
                receive: receive
            };
        },

    };




    
    var Commander= function() {
        this.id= "Echelon";
        this.mediator= null;
        this.cmds= [];
    }

    Commander.prototype= {
        send: function(msg) {
            this.mediator.send(msg);
            //alert("Commander send");
            consoleUtil.show("Commander send!");
        }
    };


    var Mediator= function(){
        var spaceships= [],
            commander= null;
        return {
            register: function(obj) {
                //var self= this;
                if(obj instanceof Commander) {
                    commander= obj;
                    obj.mediator= this;
                    consoleUtil.show("mediator register " + "Commander " + obj.id);
                } else if(obj instanceof Spaceship) {
                    spaceships[obj.id]= obj;
                    obj.mediator= this;
                    consoleUtil.show("mediator register" + " spaceship" +obj.id);
                }
            },

            send: function(msg, from, to) {
                var self= this;
                setTimeout(function() {
                    var success= Math.random()>FAILURE_RATE? true: false;
                    if (success) {
                        if(to) {
                            to.receive(msg, from);
                        } else {
                            if(msg.cmd== "launch") {
                                self.create(msg);
                            } else {
                                for(var key in spaceships) {
                                    if(spaceships[key]!== from) {
                                        spaceships[key].singnalSystem().receive(msg, from);
                                    }
                                }
                            }
                        }
                        consoleUtil.show("send success!");
                        return true;
                    } else {
                        consoleUtil.show("send fail!");
                        return false;
                    }
                }, 500);
            },

            create: function(msg) {
                if(spaceships[msg.id]!== undefined) {
                    consoleUtil.show("spaceship already exists!");
                    return false;
                }
                var spaceship= new Spaceship(msg.id);
                this.register(spaceship);
                return true;
            },

            remove: function(obj) {
                delete spaceships[obj.id];
            },

            getSpaceships: function() {
                return spaceships;
            }

        };
    };










    var animationUtil= (function() {
        var canvas= document.getElementById("front");
        canvas.width= SCREEN_WIDTH;
        canvas.height= SCREEN_HEIGHT;
        var ctx= canvas.getContext("2d");

        var cacheCanvas= document.createElement("canvas");
        cacheCanvas.width= SCREEN_WIDTH;
        cacheCanvas.height= SCREEN_HEIGHT;
        var cacheCtx= cacheCanvas.getContext("2d");

        var drawPlanet= function(_ctx) {
            var x= SCREEN_CENTER_X- PLANET_RADIUS,
                y= SCREEN_CENTER_Y- PLANET_RADIUS;
            var planet= new Image();
            planet.src= "img/min-iconfont-planet.png";
            planet.onload= function() {
                _ctx.drawImage(planet, x, y, PLANET_RADIUS*2, PLANET_RADIUS*2);
            };
        };

        var drawOrbit= function(_ctx) {
            for(var i=0; i<ORBIT_COUNT; i++) {
                _ctx.strokeStyle= "#999";
                _ctx.beginPath();
                _ctx.arc(SCREEN_CENTER_X, SCREEN_CENTER_Y, 100+50*i, 0, 2*Math.PI);
                _ctx.closePath();
                _ctx.stroke();
            }
        };

        (function() {
            var canvas= document.getElementById("background");
            canvas.width= SCREEN_WIDTH;
            canvas.height= SCREEN_HEIGHT;
            var __ctx= canvas.getContext("2d");
            drawPlanet(__ctx);
            drawOrbit(__ctx);
        })();


        /*var drawSpaceship= function(_ctx, spaceship) {
            var spaceshipImg= new Image();
            spaceshipImg.src= "img/min-iconfont-rocket-active.png";
            //ctx.drawImage(cacheCanvas, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            spaceshipImg.onload= function() {
                _ctx.save();
                _ctx.translate(SCREEN_CENTER_X, SCREEN_CENTER_Y);
                _ctx.rotate(-spaceship.deg*Math.PI/180);
                _ctx.beginPath();
                if(spaceship.power> 60) {
                    _ctx.strokeStyle= POWER_COLOR_GOOD;
                } else if(spaceship.power>30) {
                    _ctx.strokeStyle= POWER_COLOR_MEDIUM;
                } else {
                    _ctx.strokeStyle= POWER_COLOR_BAD;
                }
                _ctx.lineWidth= POWER_WIDTH;
                _ctx.moveTo(spaceship.orbit, -POWER_POS_OFFSET);
                _ctx.lineTo(spaceship.orbit+SPACESHIP_SIZE*(spaceship.power/100), -POWER_POS_OFFSET);
                _ctx.stroke();
                _ctx.closePath();
                _ctx.drawImage(spaceshipImg, spaceship.orbit, 0, SPACESHIP_SIZE, SPACESHIP_SIZE);
                _ctx.restore();
                ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT); //更新前清空画布
                ctx.drawImage(cacheCanvas, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
                //consoleUtil.show("drawing!");
            };
            
        };*/
        var drawSpaceship = function(_ctx, spaceship) {
            var spaceshipImg = new Image(); //创建飞船贴图
            
            spaceshipImg.onload = function() { //当飞船贴图加载后开始在画布上画(由于onload是异步进行的，所以执行顺序上会不是太清晰)
                try { //由于存在获取不了画布的情况产生错误，因此采用try..catch将错误丢弃
                    _ctx.save(); //保存画布原有状态
                    _ctx.translate(SCREEN_CENTER_X, SCREEN_CENTER_Y); //更改画布坐标系，将画布坐标原点移到画布中心
                    _ctx.rotate(-spaceship.deg * Math.PI / 180); //根据飞船飞行角度进行画布选择
                    //consoleUtil.show(spaceship.deg);
                    //画电量条，根据电量状态改变颜色
                    _ctx.beginPath();
                    if (spaceship.power > 60) {
                        _ctx.strokeStyle = POWER_COLOR_GOOD;
                    } else if (spaceship.power <= 60 && spaceship.power >= 20) {
                        _ctx.strokeStyle = POWER_COLOR_MEDIUM;
                    } else {
                        _ctx.strokeStyle = POWER_COLOR_BAD;
                    }
                    _ctx.lineWidth = POWER_WIDTH;
                    _ctx.moveTo(spaceship.orbit, -POWER_POS_OFFSET);
                    _ctx.lineTo(spaceship.orbit + SPACESHIP_SIZE * (spaceship.power / 100), -POWER_POS_OFFSET);
                    _ctx.stroke();

                    _ctx.drawImage(spaceshipImg, spaceship.orbit, 0, SPACESHIP_SIZE, SPACESHIP_SIZE); //画飞船贴图
                    _ctx.restore(); //恢复画布到原有状态
                    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
                    ctx.drawImage(cacheCanvas, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT); //将缓存画布内容复制到屏幕画布上
                   // return true;
                   //consoleUtil.show(spaceship.power);
                   //alert("1");
                } catch (error) {
                    consoleUtil.show(error);
                    //return false;
                }
            };
            spaceshipImg.src = "img/min-iconfont-rocket-active.png";
        };

        var onDraw= function(spaceships) {
            if(!(spaceships==undefined|| spaceships.every(function(item, index, array) {
                return item== undefined;
            }))) {
                cacheCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
                for(var key in spaceships) {
                    if(spaceships[key]!== undefined) {
                        drawSpaceship(cacheCtx, spaceships[key]);
                        //consoleUtil.show("drawing!");
                    }
                }
            } else {
                ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            }
        };

        var animationLoop= function() {
            requestAnimation(animationLoop);
            onDraw(mediator.getSpaceships());
            //consoleUtil.show("drawing animationLoop!");
        }

        var setMediator= function(_mediator) {
            mediator= _mediator;
            consoleUtil.show("setMediator okay!")
        }

        return {
            animationLoop: animationLoop,
            setMediator: setMediator
        };

    })();


    var Message= function(target, command) {
        this.id= target;
        this.cmd= null;
        switch(command) {
            case "launch":
            case "fly":
            case "stop":
            case "destroy":
                this.cmd= command;
                break;
            default:
                alert("Invalid command!");
        }
    };

    var buttonHandler= function(commander) {
        var id,
            cmd;
        $(".btn").on("click", function() {
            cmd= $(this).attr("name");
            id= $(this).parent().index();
            //alert(cmd);
            var message= new Message(id, cmd);
            commander.send(message);
            return true;
        });

    };

    var consoleUtil= (function(msg) {
        var $console= $("#console ul");
        var show= function(msg) {
            var $msg= $("<li></li>");
            $msg.text(msg);
            $console.prepend($msg);
        };
        return {
            show: show
        };
    })();



    window.onload= function() {
        var mediator= new Mediator(),
            commander= new Commander();
        mediator.register(commander);
        buttonHandler(commander);
        animationUtil.setMediator(mediator);
        animationUtil.animationLoop();
    }

})();