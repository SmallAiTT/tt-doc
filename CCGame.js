var cc = cc || {};

/**
 * Iterate over an object or an array, executing a function for each matched element.
 * @param {object|array} obj
 * @param {function} iterator
 * @param [{object}] context
 */
cc.each = function(obj, iterator, context){
    if(!obj) return;
    if(obj instanceof Array){
        for(var i = 0, li = obj.length; i < li; i++){
            if(iterator.call(context, obj[i], i) === false) return;
        }
    }else{
        for (var key in obj) {
            if(iterator.call(context, obj[key], key) === false) return;
        }
    }
};


//+++++++++++++++++++++++++something about async begin+++++++++++++++++++++++++++++++
cc.async = {
    /**
     * Counter for cc.async
     * @param err
     */
    _counterFunc : function(err){
        var counter = this.counter;
        if(counter.err) return;
        var length = counter.length;
        var results = counter.results;
        var option = counter.option;
        var cb = option.cb, cbTarget = option.cbTarget, trigger = option.trigger, triggerTarget = option.triggerTarget;
        if(err) {
            counter.err = err;
            if(cb) return cb.call(cbTarget, err);
            return;
        }
        var result = Array.apply(null, arguments).slice(1);
        var l = result.length;
        if(l == 0) result = null;
        else if(l == 1) result = result[0];
        else result = result;
        results[this.index] = result;
        counter.count--;
        if(trigger) trigger.call(triggerTarget, result, length - counter.count, length);
        if(counter.count == 0 && cb) cb.apply(cbTarget, [null, results]);
    },

    /**
     * Empty function for async.
     * @private
     */
    _emptyFunc : function(){},
    /**
     * Do tasks parallel.
     * @param tasks
     * @param option
     * @param cb
     */
    parallel : function(tasks, option, cb){
        var async = cc.async;
        var l = arguments.length;
        if(l == 3) {
            if(typeof option == "function") option = {trigger : option};
            option.cb = cb || option.cb;
        }
        else if(l == 2){
            if(typeof option == "function") option = {cb : option};
        }else if(l == 1) option = {};
        else throw "arguments error!";
        var isArr = tasks instanceof Array;
        var li = isArr ? tasks.length : Object.keys(tasks).length;
        if(li == 0){
            if(option.cb) option.call(option.cbTarget, null);
            return;
        }
        var results = isArr ? [] : {};
        var counter = { length : li, count : li, option : option, results : results};

        cc.each(tasks, function(task, index){
            if(counter.err) return false;
            var counterFunc = !option.cb && !option.trigger ? async._emptyFunc : async._counterFunc.bind({counter : counter, index : index});//bind counter and index
            task(counterFunc, index);
        });
    },

    /**
     * Do tasks by iterator.
     * @param tasks
     * @param {{cb:{function}, target:{object}, iterator:{function}, iteratorTarget:{function}}|function} option
     * @param cb
     */
    map : function(tasks, option, cb){
        var async = cc.async;
        var l = arguments.length;
        if(typeof option == "function") option = {iterator : option};
        if(l == 3) option.cb = cb || option.cb;
        else if(l == 2);
        else throw "arguments error!";
        var isArr = tasks instanceof Array;
        var li = isArr ? tasks.length : Object.keys(tasks).length;
        if(li == 0){
            if(option.cb) option.call(option.cbTarget, null);
            return;
        }
        var results = isArr ? [] : {};
        var counter = { length : li, count : li, option : option, results : results};
        cc.each(tasks, function(task, index){
            if(counter.err) return false;
            var counterFunc = !option.cb && !option.trigger ? async._emptyFunc : async._counterFunc.bind({counter : counter, index : index});//bind counter and index
            option.iterator.call(option.iteratorTarget, task, index, counterFunc);
        });
    }
};
//+++++++++++++++++++++++++something about async end+++++++++++++++++++++++++++++++++

//+++++++++++++++++++++++++something about path begin++++++++++++++++++++++++++++++++
cc.path = {
    /**
     * Join strings to be a path.
     * @example
     *      var pathStr = cc.path.joinPath("a/b/", "c/d", "e.png");//"a/b/c/d/e.png"
     * @returns {string}
     */
    joinPath : function(){
        var l = arguments.length;
        var result = "";
        for(var i = 0; i < l; i++) {
            result = (result + (result == "" ? "" : "/") + arguments[i]).replace(/(\/|\\\\)$/, "");
        }
        return result;
    },

    extname : function(pathStr){
        var index = pathStr.indexOf("?");
        if(index > 0) pathStr = pathStr.substring(0, index);
        index = pathStr.lastIndexOf(".");
        if(index < 0) return null;
        return pathStr.substring(index, pathStr.length);
    },

    basename : function(pathStr, extname){
        var index = pathStr.indexOf("?");
        if(index > 0) pathStr = pathStr.substring(0, index);
        var reg = /(\/|\\\\)([^(\/|\\\\)]+)$/g;
        var result = reg.exec(pathStr.replace(/(\/|\\\\)$/, ""));
        if(!result) return null;
        var baseName = result[2];
        if(extname && pathStr.substring(pathStr.length - extname.length).toLowerCase() == extname.toLowerCase())
            return baseName.substring(0, baseName.length - extname.length);
        return baseName;
    },

    /**
     * Get ext name of a file path.
     * @example
     *      var extname = cc.extname("a/a.png");//png
     * @param {String} pathStr
     * @returns {*}
     */
    dirname : function(pathStr){
        return pathStr.replace(/(\/|\\\\)$/, "").replace(/(\/|\\\\)[^(\/|\\\\)]+$/, "");
    }
};
//+++++++++++++++++++++++++something about path end++++++++++++++++++++++++++++++++

//+++++++++++++++++++++++++something about loader start+++++++++++++++++++++++++++
cc.loader = {
    resPath : "",//root path of resource
    audioPath : "",//root path of audio
    _register : {},//register of loaders
    cache : {},

    /**
     * Get XMLHttpRequest.
     * @returns {XMLHttpRequest}
     */
    getXMLHttpRequest : function () {
        return window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP");
    },


    //@MODE_BEGIN DEV

    _jsCache : {},//cache for js
    /**
     * Load js files.
     * @param {?string=} baseDir   The pre path for jsList.
     * @param {array.<string>} jsList    List of js path.
     * @param {function} cb        Callback function
     *
     *      If the arguments.length == 2, then the baseDir turns to be "".
     * @returns {*}
     */
    loadJs : function(baseDir, jsList, cb){
        if(arguments.length < 1) return;
        if(arguments.length == 1){
            jsList = baseDir instanceof Array ? baseDir : [baseDir];
            baseDir = "";
        }else if(arguments.length == 2){
            if(typeof jsList == "function"){
                cb = jsList;
                jsList = baseDir instanceof Array ? baseDir : [baseDir];
                baseDir = "";
            }else{
                jsList = jsList instanceof Array ? jsList : [jsList];
            }
        }else{
            jsList = jsList instanceof Array ? jsList : [jsList];
        }

        var self = this, localJsCache = self._jsCache, baseDir = baseDir || "";

        if (navigator.userAgent.indexOf("Trident/5") > -1) {
            self._loadJs4Dependency(baseDir, jsList, 0, cb);
        } else {
            cc.async.map(jsList, function(item, index, cb1){
                var jsPath = cc.path.joinPath(baseDir, item);
                if(localJsCache[jsPath]) return cb1(null);
                self._createScript(jsPath, false, cb1);
            }, cb);
        }
    },
    /**
     * Load js width loading image.
     * @param {?string} baseDir
     * @param {array} jsList
     * @param {function} cb
     */
    loadJsWidthImg : function(baseDir, jsList, cb){
        var self = this, jsLoadingImg = self._loadJsImg();
        this.loadJs(baseDir, jsList, function(err){
            if(err) throw err;
            jsLoadingImg.parentNode.removeChild(jsLoadingImg);//remove loading gif
            cb();
        });
    },
    _createScript : function(jsPath, isAsync, cb){
        var d = document, self = this, s = d.createElement('script');
        s.async = isAsync;
        s.src = jsPath;
        self._jsCache[jsPath] = true;
        s.addEventListener('load',function(){
            this.removeEventListener('load', arguments.callee, false);
            cb();
        },false);
        s.addEventListener('error',function(){
            cb("Load " + jsPath + " failed!");
        },false);
        d.body.appendChild(s);
    },
    _loadJs4Dependency : function(baseDir, jsList, index, cb){
        if(index >= jsList.length) {
            if(cb) cb();
            return;
        }
        var self = this;
        self._createScript(cc.path.joinPath(baseDir, jsList[index]), false, function(err){
            if(err) return cb(err);
            self._loadJs4Dependency(baseDir, jsList, index+1, cb);
        });
    },
    _loadJsImg : function(){
        var d = document, jsLoadingImg = d.getElementById("cocos2d_loadJsImg");
        if(!jsLoadingImg){
            jsLoadingImg = d.createElement('img');
            jsLoadingImg.src = "data:image/gif;base64,R0lGODlhEAAQALMNAD8/P7+/vyoqKlVVVX9/fxUVFUBAQGBgYMDAwC8vL5CQkP///wAAAP///wAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFAAANACwAAAAAEAAQAAAEO5DJSau9OOvNex0IMnDIsiCkiW6g6BmKYlBFkhSUEgQKlQCARG6nEBwOgl+QApMdCIRD7YZ5RjlGpCUCACH5BAUAAA0ALAAAAgAOAA4AAAQ6kLGB0JA4M7QW0hrngRllkYyhKAYqKUGguAws0ypLS8JxCLQDgXAIDg+FRKIA6v0SAECCBpXSkstMBAAh+QQFAAANACwAAAAACgAQAAAEOJDJORAac6K1kDSKYmydpASBUl0mqmRfaGTCcQgwcxDEke+9XO2WkxQSiUIuAQAkls0n7JgsWq8RACH5BAUAAA0ALAAAAAAOAA4AAAQ6kMlplDIzTxWC0oxwHALnDQgySAdBHNWFLAvCukc215JIZihVIZEogDIJACBxnCSXTcmwGK1ar1hrBAAh+QQFAAANACwAAAAAEAAKAAAEN5DJKc4RM+tDyNFTkSQF5xmKYmQJACTVpQSBwrpJNteZSGYoFWjIGCAQA2IGsVgglBOmEyoxIiMAIfkEBQAADQAsAgAAAA4ADgAABDmQSVZSKjPPBEDSGucJxyGA1XUQxAFma/tOpDlnhqIYN6MEAUXvF+zldrMBAjHoIRYLhBMqvSmZkggAIfkEBQAADQAsBgAAAAoAEAAABDeQyUmrnSWlYhMASfeFVbZdjHAcgnUQxOHCcqWylKEohqUEAYVkgEAMfkEJYrFA6HhKJsJCNFoiACH5BAUAAA0ALAIAAgAOAA4AAAQ3kMlJq704611SKloCAEk4lln3DQgyUMJxCBKyLAh1EMRR3wiDQmHY9SQslyIQUMRmlmVTIyRaIgA7";

            var canvasNode = d.getElementById(d["ccConfig"].tag);
            canvasNode.style.backgroundColor = "black";
            canvasNode.parentNode.appendChild(jsLoadingImg);

            var canvasStyle = getComputedStyle?getComputedStyle(canvasNode):canvasNode.currentStyle;
            jsLoadingImg.style.left = canvasNode.offsetLeft + (parseFloat(canvasStyle.width) - jsLoadingImg.width)/2 + "px";
            jsLoadingImg.style.top = canvasNode.offsetTop + (parseFloat(canvasStyle.height) - jsLoadingImg.height)/2 + "px";
            jsLoadingImg.style.position = "absolute";
        }
        return jsLoadingImg;
    },
    //@MODE_END DEV

    /**
     * Load a single resource as txt.
     * @param {!string} url
     * @param {function} cb arguments are : err, txt
     */
    loadTxt : function(url, cb){
        var self = this;
        var fileUrl = cc.path.joinPath(self.resPath, url);
        var xhr = self.getXMLHttpRequest();
        xhr.open("GET", fileUrl, true);
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
            // IE-specific logic here
            xhr.setRequestHeader("Accept-Charset", "utf-8");
            xhr.onreadystatechange = function () {
                if(!cb) return;
                xhr.readyState == 4 && xhr.status == 200 ? cb(null, xhr.responseText) : cb();
            };
        } else {
            if (xhr.overrideMimeType) xhr.overrideMimeType("text\/plain; charset=utf-8");
            xhr.onload = function () {
                if(!cb) return;
                xhr.readyState == 4 && xhr.status == 200 ? cb(null, xhr.responseText) : cb();
            };
        }
        xhr.send(null);
    },

    /**
     * Load a single image.
     * @param {!string} url
     * @param [{object}] option
     * @param {function} cb
     * @returns {Image}
     */
    loadImg : function(url, option, cb){
        var self = this, l = arguments.length;
        var opt = {
            isAbs : false, isCrossOrigin : true
        };
        if(l == 3) {
            opt.isAbs = option.isAbs || opt.isAbs;
            opt.isCrossOrigin = option.isCrossOrigin == null ? opt.isCrossOrigin : option.isCrossOrigin;
        }
        else if(l == 2) cb = option;
        var fileUrl = opt.isAbs ? url : cc.path.joinPath(self.resPath, url);

        var img = new Image();
        if(opt.isCrossOrigin) img.crossOrigin = "Anonymous";

        img.addEventListener("load", function () {
            this.removeEventListener('load', arguments.callee, false);
            this.removeEventListener('error', arguments.callee, false);
            if(!cb) return;
            cb(null, img);
        });
        img.addEventListener("error", function () {
            this.removeEventListener('error', arguments.callee, false);
            if(!cb) return;
            cb("error");
        });
        img.src = fileUrl;
        return img;
    },
    /**
     * Iterator function to load res
     * @param {object} item
     * @param {function} cb
     * @returns {*}
     * @private
     */
    _loadResIterator : function(item, cb){
        var url = typeof item == "string" ? item : item.src;
        var type = cc.path.extname(url);
        type = type ? type.toLowerCase() : "";
        var loader = cc.loader._register[type];
        if(!loader) return cb("loader for [" + type + "] not exists!");
        loader.load(item, cb);
    },

    /**
     * Load resources then call the callback.
     * @example
     *      1. cc.loader.load(["a.png", "b.png"], function(err, results, r0, r1, ..., r9){...});
     *      2. cc.loader.load(["a.png", "b.png"], function(length, count){}, function(err, results, r0, r1, ..., r9){...});
     *
     * @param {[String]} res
     * @param [{Function}] trigger
     * @param {Function} arguments like :
     *      err, [result0, result1, ..., resultN], result0, ..., result9
     *      load([], function(){})
     *      load([], function(){}, this);
     *      load([], function(){}, function(){});
     *      load([], function(){}, function(){}, this);
     */
    load : function(res, option, cb){
        var l = arguments.length;
        if(l == 3) {
            if(typeof option == "function") option = {trigger : option};
            option.cb = cb || option.cb;
        }
        else if(l == 2){
            if(typeof option == "function") option = {trigger : option};
        }else if(l == 1) option = {};
        else throw "arguments error!";
        if(typeof res == "string") res = [res];
        option.iterator = this._loadResIterator;
        cc.async.map(res, option);
    },

    /**
     * Register a resource loader into loader.
     * @param {String} extname
     * @param {cc.BaseLoader} loader
     */
    register : function(extNames, loader){
        if(!extNames || !loader) return;
        var self = this;
        if(typeof extNames == "string") return this._register[extNames.trim().toLowerCase()] = loader;
        for(var i = 0, li = extNames.length; i < li; i++){
            self._register["." + extNames[i].trim().toLowerCase()] = loader;
        }
    }
};
//+++++++++++++++++++++++++something about loader end+++++++++++++++++++++++++++++

//+++++++++++++++++++++++++something about CCGame begin+++++++++++++++++++++++++++
cc.Game = function(jsList, config, onEnter, onExit, option){
    cc.setup(config);//TODO 先调用setup，之前还都要有用户自己来调用比较蛋疼。
    var self = this,
        isSingleEngine = false,//TODO 这个字段在单文件模式的时候设置为true。这个目的是为了让用户不必关心引擎是否为单文件，提高用户体验。
        animationInterval = 1.0 / config['frameRate'];//TODO 这个改为如此设置，因为new了Game之后马上就run了，所以set方法是没用的。
    self.config = config;
    self.onEnter = onEnter;
    self.onExit = onExit;
    if(option){
        self.onBeforeResume = option.onBeforeResume;
        self.onAfterResume = option.onAfterResume;
        self.onBeforePause = option.onBeforePause;
        self.onAfterPause = option.onAfterPause;
    }


    //TODO 这里，我去掉了很多Application和AppControl中的方法，用了resume和pause以及各自的onBefore和onAfter方法表示
    //TODO 感觉resume和pause会更加简单直观
    self.resume = function(){
        if(self.onBeforeResume && self.onBeforeResume()) return;
        cc.director.resume();
        if(self.onAfterResume) self.onAfterResume();
    };
    self.pause = function(){
        if(self.onBeforePause && self.onBeforePause()) return;
        cc.director.pause();
        if(self.onAfterPause) self.onAfterPause();
    };

    //TODO 还有部分方法，不知道什什么用途，也没有被调用到，所以没有添加进来：
    //statusBarFrame


    /**
     * Run the message loop.
     */
    self.run = function(){
        var callback, director = cc.director, w = window;
        if (w.requestAnimFrame && animationInterval == 1 / 60) {
            callback = function () {
                director.mainLoop();
                w.requestAnimFrame(callback);
            };
            w.requestAnimFrame(callback);
        } else {
            callback = function () {
                director.mainLoop();
            };
            setInterval(callback, animationInterval * 1000);
        }
    }

    //TODO 开始进行js列表加载
    //TODO 先判断下是否为单文件模式
    if(isSingleEngine){
        //TODO 只加载用户列表
        cc.loader.loadJsWidthImg("", jsList, function(err){
            if(err) throw err;
            self.run();
            self.onEnter();
        });
    }else{
        //TODO 先加载引擎中的jsList.js文件
        cc.loader.loadJs("", "jsList.js", function(err){
            if(err) throw err;
            var newJsList = cc.jsList.concat(jsList);
            cc.loader.loadJsWidthImg("", newJsList, function(err){
                if(err) throw err;
                self.onEnter();
            });
        });
    }
}

//TODO 使用
new cc.Game([
    //TODO 用户在此罗列用户js代码列表
    //TODO 这个配置项通常来说应该移到外部配置文件中，而不是直接写在main.js中，示例中应该也像这样加上注释进行说明
    "src/MyScene.js"
], {
    //TODO 这个配置项通常来说应该转移到外部配置文件中，而不是直接写在main.js中，示例中应该也像这样加上注释进行说明
    "id" : "gameCanvas", //TODO 这个配置key名字由tag改为id感觉会好点，默认可不填，如果不填将默认从界面中获取第一个canvas
    "COCOS2D_DEBUG": 2,
    "showFPS" : true,
    "frameRate" : 60,
    "renderMode":1       //Choose of RenderMode: 0(default), 1(Canvas only), 2(WebGL only)""
}, function(){
    cc.loader.audioPath = "res/audio";//TODO 音频资源路径
    //TODO 在此，用户可以进行资源的适配方案切换
    if(1/*HD*/) cc.loader.resPath = "res/HD";
    else cc.loader.resPath = "res/Normal";

    //TODO 通过调用runScene启动游戏界面，第二个参数传递loading资源时所用的scene。不传默认为cc.loaderScene。
    cc.director.runScene(new MyScene(), cc.loaderScene);
}, function(){
    //TODO 在此执行退出游戏的逻辑，例如提示用户，确定离开游戏？
    //TODO 目前来说，这个需求应该不大，所以可以设计为非必填
}, {
    //TODO 这个选项为option，是为了增加cc.Game的拓展功能所预留出来的参数。
});

//TODO getTargetPlatform和language应该是系统级的，不应该放在这里，可以转移到CCCommon中，作为一个cc的方法，而不是跟Game绑定在一起。

/*
 TODO
 这个地方我有些疑问，因为我们让开发者用new cc.Game的方式去启动一个游戏，会不会开发者认为可以有多个Game实例？
 但是实际上，我们只支持一个Game，多个是会出问题的。
 这里是否可以写cc.runGame()【运行游戏】，这样其实开发者也不会说难以理解，而且不会像上面那种认为可以有多个game的情况。
 */
//+++++++++++++++++++++++++something about CCGame end+++++++++++++++++++++++++++++
