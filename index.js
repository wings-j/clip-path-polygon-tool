/*成员*/
var MaskWidth=300;
var MaskHeight=300;
/**
 * @name 广播
 * @type Object
 */
var broadcast=(function()
{
/*成员*/
    /**
     * @name 发布
     * @type Class
     * @see broadcast
     */
    class Broadcast
    {
    /*接口*/
        /**
         * @name 构造方法
         * @type Function
         * @see Broadcast
         * @param {Array} keys 事件名数组 
         */
        constructor(keys)
        {
            this.listenerList={};
            for(var i in keys)
                this.listenerList[keys[i]]=[];
        }
        
        /**
         * @name 添加监听者
         * @type Function
         * @see Broadcast
         * @param {String} key 事件名 
         * @param {Function(Object)} callback 回调函数 
         * @return {boolean} 执行结果
         *      true:成功
         *      false:失败，事件不存在
         */
        addListener(key,callback)
        {
            var methods=this.listenerList[key];
            if(!methods)
                return false;
            else
                methods.push(callback);

            return true;
        }
        /**
         * @name 触发
         * @type Function
         * @see Broadcast
         * @param {String} key 事件名 
         * @param {Object} event 事件数据对象 
         * @return {boolean} 执行结果
         *      true:成功
         *      false:失败，事件不存在
         */
        trigger(key,event)
        {
            var methods=this.listenerList[key];
            if(!methods)
                return false;
            else
                for(var i=0;i<methods.length;i++)
                    methods[i](event);

            return true;
        }
    }

/*接口*/
    var part=new Broadcast(['generate']);

/*构造*/
    return { addListener:part.addListener.bind(part), trigger:part.trigger.bind(part) };
})();
/**
 * @name 结果
 * @type Object
 */
var result=(function()
{
/*成员*/
    var dom=null;
    var cssValue=null;
    var css=null;
    /**
     * @name 生成CSS语句
     * @type Function
     * @see result
     * @param {Array[{float,float}]} xys x、y键值对数组
     */
    var generateCSS=function(xys)
    {
        var pairs='';
        for(var i=0,l=xys.length;i<l;i++)
        {
            var pair=`${Math.round(xys[i].xp*100)}% ${Math.round(xys[i].yp*100)}%`;
            if(i!==l-1)
                pair+=' , ';
            pairs+=pair;
        }
        cssValue=`polygon( ${pairs} )`;
        css=`clip-path: ${cssValue};`
    };
    /**
     * @name 渲染
     * @type Function
     * @see result
     */
    var render=function()
    {
        dom.innerHTML=css;
    };
    /**
     * @name 接受generate广播
     * @type Function
     * @see result
     * @param {Object{array,float,float}} data 广播数据。包含xy键值对数组，canvas宽度和高度
     */
    var receiveGenerate=function(data)
    {
        generateCSS(data.xys);
        render();
    };

/*接口*/
    /**
     * @name 初始化
     * @type Function
     * @see result
     * @description 在网页载入完成后调用
     */
    var initiate=function()
    {
        dom=document.getElementById('result_content');
    };
    /**
     * @name 取得CSS语句
     * @type Function
     * @see result
     * @return {String} CSS语句
     */
    var getCSS=function()
    {
        return css;
    }
    /**
     * @name 取得CSS clip-path属性
     * @type Function
     * @see result
     * @return {String} CSS clip-path属性
     */
    var getCSSValue=function()
    {
        return cssValue;
    }

/*构造*/
    broadcast.addListener('generate',receiveGenerate);

    return {initiate,getCSS,getCSSValue};
})();
/**
 * @name 操作区
 * @type Object
 */
var operation=(function()
{
/*成员*/
    var dom=null;
    var background=null;
    var note=null;
    /**
     * @name 状态
     * @type Object
     * @see operation
     */
    var state=
    {
        grid:true,
        anchorNote:true
    };
    var anchors=[];
    /**
     * @name 锚点
     * @type Class
     * @see operation
     */
    var Anchor=class
    {
    /*构造*/
        /**
         * @name 构造方法
         * @type Function
         * @see operation-Anchor
         */
        constructor(x,y)
        {
            this.x=x;
            this.y=y;
            this.xp=x/MaskWidth;
            this.yp=y/MaskHeight;
            this.active=false;
            this.hover=false;

            this.setActive();
        }

    /*接口*/
        /**
         * @name 设置激活属性
         * @type Function
         * @see operation-Anchor
         * @param {bool} active 激活属性 
         */
        setActive(active)
        {
            this.active=active;
        }
        /**
         * @name 设置悬浮属性
         * @type Function
         * @see operation-Anchor
         * @param {bool} hover 鼠标悬浮属性
         */
        setHover(hover)
        {
            this.hover=hover;
        }
        /**
         * @name 渲染
         * @type Function
         * @see operation-Anchor
         * @param {Object} context 绘图上下文
         */
        render(context)
        {
            context.beginPath();
            context.arc(this.x,this.y,Anchor.radius,0,Math.PI*2);
            context.fillStyle= this.active ? 'cyan' : 'yellow';
            context.fill();
            if(this.hover)
            {
                context.strokeStyle='red';
                context.lineWidth=2;

                if(state.anchorNote)
                {
                    var y=this.y;       //锚点指示器
                    var noteY= (y < MaskHeight/2) ? y+30 : y-30;               
                    context.moveTo(this.x,this.y);
                    context.lineTo(this.x+50,noteY);
                    context.lineTo(360,noteY);
                    context.lineTo(360,noteY+20);
                    context.fillStyle='red';
                    context.font='16px Consolas';
                    var index=anchors.indexOf(this);
                    var note=` No.${index} ( ${Math.round(this.xp*100)}% , ${Math.round(this.yp*100)}% )`;
                    context.fillText(note,360,noteY+16)
                }

                context.stroke();
            }
        }
        /**
         * @name 检测点是否在锚点圆内
         * @type Function
         * @see operation-Anchor
         * @param {float} x 
         * @param {float} y
         * @return {bool} 检测结果
         */
        checkIn(x,y)
        {
            var distance=Math.sqrt(Math.pow(x-this.x,2)+Math.pow(y-this.y,2));

            if(distance < Anchor.radius)
                return true;
            else
                return false;
        }
        /**
         * @name 设置XY
         * @type Function
         * @see operation-Anchor
         */
        setXY(x,y)
        {
            this.x=x;
            this.y=y;
            this.xp=x/MaskWidth;
            this.yp=y/MaskHeight;
        }
    };
    Anchor.radius=8;
    /**
     * @name 掩膜
     * @type Object
     * @see operation
     */
    var mask=(function()
    {
    /*成员*/
        var dom=null;
        var context=null;
        var activeAnchor=null;
        var hoverAnchor=null;
        /**
         * @name 处理鼠标移动事件
         * @type Function
         * @see operation-mask
         */
        var onMouseMove=(function()
        {
            return function(e)
            {
                var position=getRelativePosition({x:e.clientX,y:e.clientY});
                var anchor=scanIn(position.x,position.y);

                if(anchor && hoverAnchor!==anchor)
                {
                    if(hoverAnchor)
                        hoverAnchor.setHover(false);
                    hoverAnchor=anchor;
                    anchor.setHover(true);

                    render();
                }
                else if(anchor===null && hoverAnchor!==null )
                {
                    hoverAnchor.setHover(false);
                    hoverAnchor=null;

                    render();
                }
            }
        })();
        /**
         * @name 绘制网格
         * @type Function
         * @see operation-mask
         */
        var drawGrid=function()
        {
            context.beginPath();
            context.moveTo(0,50);
            context.lineTo(300,50);
            context.moveTo(0,100);
            context.lineTo(300,100);
            context.moveTo(0,150);
            context.lineTo(300,150);
            context.moveTo(0,200);
            context.lineTo(300,200);
            context.moveTo(0,250);
            context.lineTo(300,250);
            context.moveTo(50,0);
            context.lineTo(50,300);
            context.moveTo(100,0);
            context.lineTo(100,300);
            context.moveTo(150,0);
            context.lineTo(150,300);
            context.moveTo(200,0);
            context.lineTo(200,300);
            context.moveTo(250,0);
            context.lineTo(250,300);

            context.lineWidth=1;
            context.strokeStyle='green';
            context.stroke();
        }

    /*接口*/
        /**
         * @name 获取DOM元素
         * @type Function
         * @see operation-mask
         * @return {Object} DOM元素
         */
        var getDom=function()
        {
            return dom;
        }
        /**
         * @name 初始化
         * @type Function
         * @see operation-mask
         * @description 在网页载入完成后调用
         */
        var initiate=function()
        {
            dom=document.getElementById('operation_mask');
            context=dom.getContext('2d');
            context.translate(20,20);

            dom.addEventListener('mousemove',onMouseMove);
        };
        /**
         * @name 渲染
         * @type Function
         * @see operation-mask
         */
        var render=function()
        {
            context.clearRect(-20,-20,600,340);      //500,340:canvas的实际宽度和高度

            if(state.grid)
                drawGrid(); 
            for(var i=0,l=anchors.length;i<l;i++)
            {
                var anchor=anchors[i];
                if(anchor.x >= 0 && anchor.x <= MaskWidth && anchor.y >=0 && anchor.y <=MaskHeight )
                    anchor.render(context);
            }

        };

    /*构造*/
        return {getDom,initiate,render};
    })();
    /**
     * @name 处理鼠标按下事件
     * @type Function
     * @see operation
     * @param {Object} e 事件对象
     */
    var onMouseDown=(function()
    {
    /*成员*/
        var moveDirection=0;
        /**
         * @name 处理鼠标移动事件
         * @type Function
         * @see operation-onMouseDown
         * @param {Object} e 事件对象
         */
        var onMouseMove=function(e)
        {
            var position=getRelativePosition({x:e.clientX,y:e.clientY});

            if(keyState[16] && moveDirection===0)       //锁定方向
            {
                var xDelta=Math.abs(position.x-activeAnchor.x);
                var yDelta=Math.abs(position.y-activeAnchor.y);

                if(xDelta-yDelta > 2)
                    moveDirection=1;
                else if(xDelta-yDelta < -2)
                    moveDirection=-1;
            }
            if(keyState[16] && moveDirection===1)
                position.y=activeAnchor.y;
            else if(keyState[16] && moveDirection===-1)
                position.x=activeAnchor.x;

            if(position.x > MaskWidth)
                var x=MaskWidth;
            else if(position.x < 0)
                var x=0;
            else
                var x=position.x;
            if(position.y > MaskHeight)
                var y=MaskHeight;
            else if(position.y < 0)
                var y=0;
            else
                var y=position.y;

            if(keyState[17])
            {
                var deltaX=x-activeAnchor.x;
                var deltaY=y-activeAnchor.y;

                for(var i=0,l=anchors.length;i<l;i++)
                {
                    var anchor=anchors[i];
                    anchor.setXY(anchor.x+deltaX,anchor.y+deltaY);
                }
            }
            else
                activeAnchor.setXY(x,y);

            render();
        };
        /**
         * @name 处理鼠标抬起事件
         * @type Function
         * @see operation-onMouseDown
         */
        var onMouseUp=function()
        {
            moveDirection=0;
            document.removeEventListener('mousemove',onMouseMove);
            document.removeEventListener('mouseup',onMouseUp);
        };

    /*构造*/
        return function(e)
        {
            e.stopPropagation();
            e.preventDefault();

            if(e.target===mask.getDom())
            {
                var position=getRelativePosition({x:e.clientX,y:e.clientY});
                var anchor=scanIn(position.x,position.y);
                if(anchor===null)
                    anchor=addAnchor(position.x,position.y);
                else
                {
                    if(keyState[18])
                        deleteAnchor(anchor);
                    else
                    {
                        activateAnchor(anchor);
                        document.addEventListener('mousemove',onMouseMove);
                        document.addEventListener('mouseup',onMouseUp);
                    }
                }
    
                activeAnchor=anchor;
                render(); 
            }
        };
    })();
    /**
     * @name 键盘状态
     * @type Object
     * @see operation
     */
    var keyState=
    {
        '16':false,      //shift
        '17':false,     //ctl
        '18':false      //alt
    };
    /**
     * @name 按键功能
     * @type Object
     * @see operation
     */
    var keyFunction=
    {
        '16':
        {
            down:()=>{ displayNote('Shift: Lock'); },
            up:()=>{ hiddenNote(); }
        },
        '17':
        {
            down:()=>{ displayNote('Ctl: All'); },
            up:()=>{ hiddenNote(); }
        },
        '18':
        {
            down:()=>{ displayNote('Alt: Delete'); },
            up:()=>{ hiddenNote(); }
        },
        '67':
        {
            down:()=>{ clearAnchor(); render(); }
        },
        '71':
        {
            down:()=>{ state.grid=!state.grid; render(); }
        },
        '78':
        {
            down:()=>{ state.anchorNote=!state.anchorNote; render();}
        }
    };
    /**
     * @name 处理键盘按下
     * @type Function
     * @see operation
     * @param {Object} e 事件对象
     */
    var onKeyDown=function(e)
    {
        var keyCode=e.keyCode;
        if(keyCode===16 || keyCode===17 || keyCode===18 || keyCode===67 || keyCode===71 || keyCode==78)
            if(!keyState[keyCode])
            {
                e.preventDefault();
                keyState[keyCode]=true;

                var f=keyFunction[keyCode].down
                f && f();
            }
    };
    /**
     * @name 处理键盘抬起
     * @type Function
     * @see operation
     * @param {Object} e 事件对象
     */
    var onKeyUp=function(e)
    {
        var keyCode=e.keyCode;
        if(keyCode===16 || keyCode===17 || keyCode===18 || keyCode===67 || keyCode===71 || keyCode==78)
        {
            e.preventDefault();
            keyState[e.keyCode]=false;

            var f=keyFunction[keyCode].up
            f && f();
        }
    };
    /**
     * @name 渲染
     * @type Function
     * @see operation
     */
    var render=function()
    {
        mask.render();
        broadcast.trigger('generate',{xys:anchors});

        clipBackground();
    }
    /**
     * @name 增加锚点
     * @type Function
     * @see operation
     * @param {float} x 横坐标
     * @param {float} y 纵坐标
     * @return {Object} 新生成的锚点对象
     */
    var addAnchor=function(x,y)
    {
        var anchor=new Anchor(x,y);
        anchors.push(anchor);
        activateAnchor(anchor);

        return anchor;
    };
    /**
     * @name 删除锚点
     * @type Function
     * @see operation
     * @param {Object} anchor 锚点对象
     */
    var deleteAnchor=function(anchor)
    {
        var index=anchors.indexOf(anchor);
        anchors.splice(index,1);
    };
    /**
     * @name 清除所有锚点
     * @type Function
     * @see operation
     */
    var clearAnchor=function()
    {
        anchors=[];
    };
    /**
     * @name 激活锚点
     * @type Function
     * @see operation-onMouseDown
     */
    var activateAnchor=function(anchor)
    {
        for(var i=0,l=anchors.length;i<l;i++)       //同一时间只有一个锚点被激活
            anchors[i].active=false;

        anchor.setActive(true);
    }
    /**
     * @name 扫描是否在某个锚点圆内
     * @type Function
     * @see operation
     * @param {float} x 横坐标
     * @param {float} y 纵坐标
     * @return {Object} 扫描命中锚点
     *      null:不在任何锚点内
     */
    var scanIn=function(x,y)
    {
        for(var i=0,l=anchors.length;i<l;i++)
            if(anchors[i].checkIn(x,y))
                return anchors[i];

        return null;
    };
    /**
     * @name 剪切背景
     * @type Function
     * @see operation 
     */
    var clipBackground=function()
    {
        if(anchors.length>=3)
            var cssValue=result.getCSSValue();
        else
            var cssValue='';

        background.style.clipPath=cssValue;
        background.style.webkitClipPath=cssValue;
    };
    /**
     * @name 显示提示
     * @type Function
     * @see operation
     * @param {String} content 内容
     */
    var displayNote=function(content)
    {
        var l=content.length+2;     //2:方块和空格的宽度

        note.style.width=l+'ch';      
        note.style.animationTimingFunction=`steps(${l})`;

        note.innerHTML=content;
        note.style.display='block';
    };
    /**
     * @name 隐藏提示
     * @type Function
     * @see operation
     */
    var hiddenNote=function()
    {
        note.style.display='none';
    };
    /**
     * @name 取得点击事件位置相对于元素左上角位置
     * @type Function
     * @see operation
     * @param {Object} mousePosition 鼠标位置，{x:float,y:float}
     * @return {Object} 相对位置，{x:float,y:float}
    */
    var getRelativePosition=function(mousePosition)
    {
        var element=mask.getDom();
        var position=element.getBoundingClientRect();
        var relativePosition=
        {
            x:mousePosition.x-(position.left)-20,       //20：translate偏置
            y:mousePosition.y-(position.top)-20
        };

        return relativePosition;
    }

/*接口*/
    /**
     * @name 初始化
     * @type Function
     * @see operation
     * @description 在网页载入完成后调用
     */
    var initiate=function()
    {
        dom=document.getElementById('operation');
        background=document.getElementById('operation_background');
        note=document.getElementById('operation_note');
        mask.initiate();

        dom.addEventListener('mousedown',onMouseDown);
        document.addEventListener('keydown',onKeyDown);
        document.addEventListener('keyup',onKeyUp);
    };

/*构造*/
    return {initiate};
})();

/*构造*/
window.addEventListener('load',function()
{
    result.initiate();
    operation.initiate();
});