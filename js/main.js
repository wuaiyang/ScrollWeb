var way = {};

way.timeScroll = null; //整屏切换动画实例
way.currentStep = "step1";

way.init = function(){
   way.resize();
   way.events();
   way.configIntAnimate();
   way.div3D(".start",".state1",".state2",0.3);
   $("body").height(8500);
   way.configTimeScroll();
   twoAnimate.init();
   threeAnimate.init();
};

$(document).ready(way.init);

//配置事件
way.events = function(){
    $(window).resize( way.resize);
    way.nav();//执行导航条动画

   $(window).bind("scroll",scrollFn);

    function scrollFn(){
      $(window).scrollTop(0);
    }   
    
   // 鼠标绑定滚动条
   
   $(window).bind("scroll",way.scrollStatus);

   //当mousedown的时候，解除scroll事件对应的scrollFn
   $(window).bind("mousedown",function(){
    $(window).unbind("scroll",scrollFn);
   });

   //当mouseup的时候，让当前这一屏到达某个状态
   
   $(window).bind("mouseup",way.mouseupFn);

    //阻止浏览器默认滚动行为
    $(".wrapper").bind("mousewheel", function(ev){
       
    	ev.preventDefault();
    });

    $(".wrapper").one("mousewheel",mousewheelFn);
    
    var timer = null;
    function mousewheelFn(ev,direction){
      $(window).unbind("scroll",scrollFn);
    	if(direction<1){ //向下滚动
            way.changStep("next");
    	}else{
           way.changStep("prev");
    	};
      clearTimeout(timer)
    	timer = setTimeout(function(){
            $(".wrapper").one("mousewheel", mousewheelFn);
    	},1200)

    }
};

//滚动条mouseup事件
way.mouseupFn = function(){
  console.log('a');
  var scale = way.scale();
  var times =scale*way.timeScroll.totalDuration();

  //获取上一个状态和下一个状态
  var prevStep = way.timeScroll.getLabelBefore(times);
  var nextStep = way.timeScroll.getLabelAfter(times);

  //获取上一个状态和下一个时间
  var prevTime = way.timeScroll.getLabelTime(prevStep);
  var nextTime = way.timeScroll.getLabelTime(nextStep);

  var prevDvalue = Math.abs(prevTime - times);
  var nextDvalue = Math.abs(nextTime - times);
  
  /*如果scale为0 step1，scale为1 step5，如果prevDvalue < nextDvalue prevStep,相反同理*/
  var step = "";
  if(scale === 0){
    step = "step1";
  }else if(scale === 1){
     step = "step5";
  }else if(prevDvalue < nextDvalue){
    step = prevStep;
  }else{
    step = nextStep;
  };

  way.timeScroll.tweenTo(step);
  var time =way.timeScroll.getLabelTime(step);
  var d = way.timeScroll.time() -  time;
  var maxH = $("body").height() - $(window).height();
  var tatalTime = way.timeScroll.totalDuration();
  var scrollY = time/tatalTime*maxH;
  

  var scrollAnimate = new TimelineMax();
  scrollAnimate.to("html,body",d,{scrollTop:scrollY})

  way.currentStep = step;
}

//计算滚动条比例
way.scale = function(){
  var scrollT = $(window).scrollTop();
  var MaxH = $("body").height() - $(window).height();  
  var s =scrollT/MaxH;
  return s;
}

//计算滚动条滚动时间点
way.scrollStatus = function(){
   var times = way.scale()*way.timeScroll.totalDuration();
   way.timeScroll.seek(times,false);
}

//切换整屏，计算滚动条距离
way.changStep=function(value){
   if(value === "next"){
      //获取当前时间
      var currentTime = way.timeScroll.getLabelTime(way.currentStep);
      //获取下一个状态
      var afterStep = way.timeScroll.getLabelAfter(currentTime);
      if( !afterStep ) return;
      //获取动画总时长
      var tatalTime = way.timeScroll.totalDuration();
      //获取下一状态时间
      var afterTime = way.timeScroll.getLabelTime(afterStep);
      //获取滚动条最大高度
      var maxH = $("body").height() - $(window).height();

      var scrollY = afterTime/tatalTime*maxH;

      var d = Math.abs(way.timeScroll.time() - afterTime);

      var scrollAnimate = new TimelineMax();

      scrollAnimate.to("html,body",d,{scrollTop:scrollY})

      //运动到下一个状态
      //way.timeScroll.tweenTo(afterStep);
      way.currentStep = afterStep;
   }else{
     //获取当前时间
      var currentTime = way.timeScroll.getLabelTime(way.currentStep);
      //获取上一个状态
      var beforeStep = way.timeScroll.getLabelBefore(currentTime);
      if( !beforeStep ) return;

       //获取动画总时长
      var tatalTime = way.timeScroll.totalDuration();
      //获取下一状态时间
      var beforeTime = way.timeScroll.getLabelTime(beforeStep);
      //获取滚动条最大高度
      var maxH = $("body").height() - $(window).height();

      var scrollY = beforeTime/tatalTime*maxH;

      var d = Math.abs(way.timeScroll.time() - beforeTime);

      var scrollAnimate = new TimelineMax();

      scrollAnimate.to("html,body",d,{scrollTop:scrollY})
      //运动到下一个状态
      //way.timeScroll.tweenTo(beforeStep);
      way.currentStep = beforeStep;

   }
}

//配置整屏切换的动画以及每一屏中的小动画

way.configTimeScroll = function(){

  var time = way.timeScroll ? way.timeScroll.time() : 0;

  if( way.timeScroll ) way.timeScroll.clear();

  way.timeScroll = new TimelineMax();

    // 当从第二屏切换到第一屏的时候，让第二屏里面的动画时间点重归0
    way.timeScroll.to(".scene1",0,{onReverseComplete:function(){
      twoAnimate.timeline.seek(0,false);
    }},0);

    way.timeScroll.to(".footer",0,{top:"100%"});

   way.timeScroll.add("step1");
  way.timeScroll.to(".scene2",0.8,{top:0,ease:Cubic.easeInOut});
  way.timeScroll.to({},0.1,{onComplete:function(){
    menu.changeMenu("menu_state2");  //切换到第二屏调用的函数，同时传入导航条背景颜色变化的class名字
  },onReverseComplete:function(){
    menu.changeMenu("menu_state1"); 
  }},"-=0.2");
  //当切换到第二屏上的时候，翻转第二屏上的第一个动画
  way.timeScroll.to({},0,{onComplete:function(){
    twoAnimate.timeline.tweenTo("state1");
  }},"-=0.2");

    way.timeScroll.add("step2");

  // --- 主动画中配置第二萍的小动画 start

  way.timeScroll.to({},0,{onComplete:function(){
    twoAnimate.timeline.tweenTo("state2");
  },onReverseComplete:function(){
    twoAnimate.timeline.tweenTo("state1");
  }});

  way.timeScroll.to({},0.4,{});

    way.timeScroll.add("point1");

  way.timeScroll.to({},0,{onComplete:function(){
    twoAnimate.timeline.tweenTo("state3");
  },onReverseComplete:function(){
    twoAnimate.timeline.tweenTo("state2");
  }});

  way.timeScroll.to({},0.4,{});

    way.timeScroll.add("point2");

  way.timeScroll.to({},0,{onComplete:function(){
    twoAnimate.timeline.tweenTo("state4");
  },onReverseComplete:function(){
    twoAnimate.timeline.tweenTo("state3");
  }});

  way.timeScroll.to({},0.4,{});

    way.timeScroll.add("point3");

  // --- 主动画中配置第二萍的小动画 end


  way.timeScroll.to(".scene3",0.8,{top:0,ease:Cubic.easeInOut,onReverseComplete:function(){
    threeAnimate.timeline.seek(0,false);
  }});
  
  way.timeScroll.to({},0.1,{onComplete:function(){
    menu.changeMenu("menu_state3");  //切换到第二屏调用的函数，同时传入导航条背景颜色变化的class名字
  },onReverseComplete:function(){
    menu.changeMenu("menu_state2");
  }},"-=0.2");
  
  way.timeScroll.to({},0.1,{onComplete:function(){
    threeAnimate.timeline.tweenTo("threeSate1");
  }},"-=0.2");
   
    way.timeScroll.add("step3");

  // --- 主动画中配置第三屏的小动画 start

  way.timeScroll.to({},0,{onComplete:function(){
    threeAnimate.timeline.tweenTo("threeSate2");
  },onReverseComplete:function(){
    threeAnimate.timeline.tweenTo("threeSate1");
  }});

  way.timeScroll.to({},0.4,{});

    way.timeScroll.add("threeSate");

  // --- 主动画中配置第三屏的小动画 end



  way.timeScroll.to(".scene4",0.8,{top:0,ease:Cubic.easeInOut});
    way.timeScroll.add("step4");

  //滚动到第五屏的时候，要让第四屏滚出屏幕外
  way.timeScroll.to(".scene4",0.8,{top:-$(window).height(),ease:Cubic.easeInOut});
  //当可视区域大于950，那么就让导航条隐藏起来
  if($(window).width()>950){
    way.timeScroll.to(".menu_wrapper",0.8,{top:-110,ease:Cubic.easeInOut},"-=0.8");
  }else{
    $(".menu_wrapper").css("top",0);
  }

  way.timeScroll.to(".scene5",0.8,{top:0,ease:Cubic.easeInOut,onReverseComplete:function(){
    fiveAnimate.timeline.seek(0,false);
  }},"-=0.8");
  way.timeScroll.to({},0.1,{onComplete:function(){
    fiveAnimate.timeline.tweenTo("fiveState");
  }},"-=0.2");
    way.timeScroll.add("step5");

  way.timeScroll.to(".scene5",0.5,{top:-$(".footer").height(),ease:Cubic.easeInOut});
  way.timeScroll.to(".footer",0.5,{top:$(window).height()-$(".footer").height(),ease:Cubic.easeInOut},"-=0.5");

    way.timeScroll.add("footer");

  way.timeScroll.stop();
  //当改变浏览器的大小时，让动画走到之前已经到达的时间点
  way.timeScroll.seek(time);
}


//配置导航条动画
way.configIntAnimate = function(){
	var initAnimate = new TimelineMax();
	initAnimate.to(".menu",0.5,{opacity:1});
	initAnimate.to(".menu",0.5,{left:22},"-=0.3");
	initAnimate.to(".nav",0.5,{opacity:1});

	//设置首屏动画
	initAnimate.to(".scene1_logo",0.5,{opacity:1});
	initAnimate.staggerTo(".scene1_1 img",2,{opacity:1,rotationX:0,ease:Elastic.easeOut},0.2);
	initAnimate.to(".light_left",0.7,{rotationZ:0,ease:Cubic.easeOut},"-=2");
	initAnimate.to(".light_right",0.7,{rotationZ:0,ease:Cubic.easeOut},"-=2");
	initAnimate.to(".controls",0.5,{bottom:20, opacity:1},"-=0.7");

	initAnimate.to("body",0,{"overflow-y":"scroll"});
};

//导航条交互动画
way.nav= function(){
	var navAnimate = new TimelineMax();
	$(".nav a").bind("mouseenter",function(){
		var w = $(this).width ();
		var l = $(this).offset().left;
		navAnimate.clear();
		navAnimate.to(".line",0.4,{opacity:1,left:l,width:w});
	});

	$(".nav a").bind("mouseleave",function(){
	   navAnimate.clear();
       navAnimate.to(".line",0.4,{opacity:0});
	});

	var languageAnimate = new TimelineMax();
	$(".language").bind("mouseenter",function(){
       languageAnimate.clear();
       languageAnimate .to(".dropdown",0.5,{opacity:1})
	});

	$(".language").bind("mouseleave",function(){
       languageAnimate.clear();
       languageAnimate .to(".dropdown",0.5,{opacity:0})
	});

	//调出左侧
	$(".btn_mobile").click(function(){
		var mobileAnimate = new TimelineMax();
		mobileAnimate.to(".left_nav",0.5,{left :0})
	});

	$(".l_close").click(function(){
		var closeAnimate = new TimelineMax();
		closeAnimate.to(".left_nav",0.5,{left :-300})
	});

};

//3D翻转效果
way.div3D = function(obj,front,back,d){
    var div3DAnimate = new TimelineMax();
    div3DAnimate.to($(obj).find(front),0,{rotationX:0,transformPerspective:600,transformOrigin:"center bottom"});
    div3DAnimate.to($(obj).find(back),0,{rotationX:-90,transformPerspective:600,transformOrigin:"top center"});

    $(obj).bind("mouseenter",function(){
    	var enterAnimate = new TimelineMax();

    	var ele1= $(this).find(front);
    	var ele2= $(this).find(back);

    	enterAnimate.to(ele1,d,{rotationX:90,top:-ele1.height(),ease:Cubic.easeInOut},0);
    	enterAnimate.to(ele2,d,{rotationX:0,top:0,ease:Cubic.easeInOut},0);

    });

    $(obj).bind("mouseleave",function(){
    	var leaveAnimate = new TimelineMax();

    	var ele1= $(this).find(front);
    	var ele2= $(this).find(back);

    	leaveAnimate.to(ele1,d,{rotationX:0,top:0,ease:Cubic.easeInOut},0);
    	leaveAnimate.to(ele2,d,{rotationX:-90,top:ele1.height(),ease:Cubic.easeInOut},0);

    })
};


//设置高度和top值
way.resize = function(){
	$(".scene").height($(window).height());//设置每一屏的height
    $(".scene:not(':first')").css("top",$(window).height());//设置除第一屏的top

   way.configTimeScroll();

    if($(window).width() <= 950){
    	$("body").addClass("r950");
    }else{
    	$("body").removeClass("r950");
    }
}

//配置第二屏动画
var twoAnimate = {};
twoAnimate.timeline = new TimelineMax();
twoAnimate.init = function(){
   
   twoAnimate.timeline.staggerTo(".scene2_1 img",1.5,{opacity:1,rotationX:0,ease:Elastic.easeOut},0.2); 
   twoAnimate.timeline.to(".points",0.2,{bottom:20},"-=1");
  
   //初始第一个按钮
   twoAnimate.timeline.to(".scene2 .point0 .text",0.1,{opacity:1});
   twoAnimate.timeline.to(".scene2 .point0 .point_icon",0,{"background-position":"right top"});
   
   twoAnimate.timeline.add("state1");
   twoAnimate.timeline.staggerTo(".scene2_1",0.2,{opacity:0,rotationX:90},0); 

   twoAnimate.timeline.to(".scene2_2 .left",0.4,{opacity:1}); 
   twoAnimate.timeline.staggerTo(".scene2_2 .right img",0.3,{opacity:1,rotationX:0,ease:Cubic.easeInOut},0,"-=0.4"); 

    //第二个按钮
   twoAnimate.timeline.to(".scene2 .point .text",0,{opacity:0},"-=0.4");
   twoAnimate.timeline.to(".scene2 .point1 .text",0.1,{opacity:1});
   twoAnimate.timeline.to(".scene2 .point .point_icon",0,{"background-position":"left top"},"-=0.4");
   twoAnimate.timeline.to(".scene2 .point1 .point_icon",0,{"background-position":"right top"},"-=0.4");


   twoAnimate.timeline.add("state2");
   twoAnimate.timeline.to(".scene2_2 .left",0.4,{opacity:0}); 
   twoAnimate.timeline.staggerTo(".scene2_2 .right img",0.3,{opacity:0,rotationX:90,ease:Cubic.easeInOut},0,"-=0.4"); 

   twoAnimate.timeline.to(".scene2_3 .left",0.4,{opacity:1}); 
   twoAnimate.timeline.staggerTo(".scene2_3 .right img",0.3,{opacity:1,rotationX:0,ease:Cubic.easeInOut},0,"-=0.4"); 

   //第三个按钮
   twoAnimate.timeline.to(".scene2 .point .text",0,{opacity:0},"-=0.4");
   twoAnimate.timeline.to(".scene2 .point2 .text",0.1,{opacity:1});
   twoAnimate.timeline.to(".scene2 .point .point_icon",0,{"background-position":"left top"},"-=0.4");
   twoAnimate.timeline.to(".scene2 .point2 .point_icon",0,{"background-position":"right top"},"-=0.4");


   twoAnimate.timeline.add("state3");
   twoAnimate.timeline.to(".scene2_3 .left",0.4,{opacity:0}); 
   twoAnimate.timeline.staggerTo(".scene2_3 .right img",0.3,{opacity:0,rotationX:90,ease:Cubic.easeInOut},0,"-=0.4"); 

   twoAnimate.timeline.to(".scene2_4 .left",0.4,{opacity:1}); 
   twoAnimate.timeline.staggerTo(".scene2_4 .right img",0.3,{opacity:1,rotationX:0,ease:Cubic.easeInOut},0,"-=0.4"); 

    //第三个按钮
   twoAnimate.timeline.to(".scene2 .point .text",0,{opacity:0},"-=0.4");
   twoAnimate.timeline.to(".scene2 .point3 .text",0.1,{opacity:1});
   twoAnimate.timeline.to(".scene2 .point .point_icon",0,{"background-position":"left top"},"-=0.4");
   twoAnimate.timeline.to(".scene2 .point3 .point_icon",0,{"background-position":"right top"},"-=0.4");

    twoAnimate.timeline.add("state4");

   twoAnimate.timeline.stop();
}

// 配置第三屏动画
var threeAnimate = {};

threeAnimate.timeline = new TimelineMax();

threeAnimate.init = function(){
  //把第三屏里面的所有的图片翻转-90，透明度设为0
  threeAnimate.timeline.to(".scene3 .step img",0,{rotationX:-90,opacity:0,transformPerspective:600,transformOrigin:"center center"});

  threeAnimate.timeline.staggerTo(".step3_1 img",0.2,{opacity:1,rotationX:0,ease:Cubic.easeInOut},0.1);

  threeAnimate.timeline.add("threeSate1");

  threeAnimate.timeline.to(".step3_1 img",0.3,{opacity:0,rotationX:-90,ease:Cubic.easeInOut});
  threeAnimate.timeline.to(".step3_2 img",0.3,{opacity:1,rotationX:0,ease:Cubic.easeInOut});

  threeAnimate.timeline.add("threeSate2");

  threeAnimate.timeline.stop();
}

//实现导航条在切换时整屏翻转
var menu = {};

menu.changeMenu = function(stateClass){
  
  //实现导航条在页面翻转时3D翻转
  var oldMenu = $(".menu");
  var newMenu = oldMenu.clone();

  newMenu.removeClass("menu_state1").removeClass("menu_state2").removeClass("menu_state3");

  newMenu.addClass(stateClass);
  oldMenu.addClass("removeClass");

 $(".menu_wrapper").append(newMenu);

  way.nav();
  way.div3D(".start",".state1",".state2",0.3);
  
  var menuAnimate = new TimelineMax();
  menuAnimate.to(newMenu,0,{top:-oldMenu.height()+22,rotationX:90,transformPerspective:600,transformOrigin:"center bottom"});
  menuAnimate.to(oldMenu,0,{top:22,rotationX:0,transformPerspective:600,transformOrigin:"top center" });

 
  menuAnimate.to(oldMenu,0.5,{top:oldMenu.height()+22,rotationX:-90,ease:Cubic.easeInOut,onComplete:function(){
    $(".removeClass").remove();
  } });

   menuAnimate.to(newMenu,0.5,{top:22,rotationX:0,ease:Cubic.easeInOut},"-=0.5");
}