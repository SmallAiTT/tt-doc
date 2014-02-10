# cc.loader
===============

## 概述

原来的`cc.Loader`被改造为一个单例`cc.loader`，采用了插件机制设计，让loader做更纯粹的事。

各种资源类型的loader可以在外部注册进来，而不是直接将所有的代码杂揉在`cc.Loader`中，更好的方便管理以及用户自定义loader的创建。

`cc.loader`中包含了一些网络资源获取的基本api，例如加载js、加载image等。

## API描述

##### resPath

资源的根路径（音频资源除外）。

##### audioPath

音频资源的根路径。

##### getXMLHttpRequest

获取XMPHttpRequest对象。

##### loadJs

加载js文件。

```script
参数：
url     资源路径（注意，必须是全路径）
cb      回调函数

返回值： 无
```

* 用法1：

```script
cc.loader.loadJs("src", [
    "a.js", "b.js"
], function(err){
    if(err) return console.log(err);//加载js失败
    //加载js成功
});
```

* 用法2：

```script
cc.loader.loadJs([
    "src/a.js", "src/b.js"
], function(err){
    if(err) return console.log(err);//加载js失败
    //加载js成功
});
```

* 用法3：

```script
cc.loader.loadJs("src/a.js", function(err){
    if(err) return console.log(err);//加载js失败
    //加载js成功
});
```

##### loadJsWidthImg

用法同`loadJs`，只是在加载js文件的时候会显示一个loading的图片而已。

##### loadTxt

加载文本资源。

```script
参数：
url     资源路径（注意，必须是全路径）
cb      回调函数

返回值： 无
```

用法：

```script
cc.loader.loadTxt("res/a.txt", function(err, data){
    if(err) return console.log("加载文本失败!");
    console.log(data);
});
```

##### loadImg

加载图片资源。

```script
参数：
url         资源路径（注意，必须是全路径）
option      选项，目前结构如：`{isCrossOrigin : true}`，`isCrossOrigin`默认为`true`（可选）
cb          回调函数

返回值： Image对象。
```

##### getUrl

获取到资源全路径。

```script
参数：
basePath    资源的根路径
url         资源路径

返回值：资源全路径。
```

##### load

加载资源的入口api。相当于原来的`cc.Loader.preload`。

```script
参数：
res         资源列表，可以是一个数组或者一个string或者一个包含`src`属性的对象。
option      选项（可选），有以下属性：
            cb              回调函数
            cbTarget        回调函数的执行者
            trigger         触发器（函数）
            triggerTarget   触发器的执行者
cb          回调函数（可选）
```

用法：

```script
var res = ["res/a.png", "res/a.plist", "audio/b.mp3", {src : "res/c.png"}];

/*
也可以是：
res = "res/a.png" 或者 res = {src : "res/c.png"}
*/

var testTarget = {
    name : "the name is testTarget",
    trigger : function(){...},
    cb : function(err){...}
};
var option = {
    trigger : testTarget.trigger,
    triggerTarget : testTarget,
    cbTarget : testTarget
}
//用法1：
cc.loader.load(res, option, function(err){
    if(err) return console.log("加载失败");
    console.log(this.name);//the name is testTarget
});

//用法2：
cc.loader.load(res, function(err){
    if(err) return console.log("加载失败");
});

//用法3：
option.cb = testTarget.cb;
cc.loader.load(res, option);

//用法4：
cc.loader.load(res);
```

##### register

注册loader。

```script
参数：
extNames        后缀名（String数组或者String）
loader          loader对象，
                必须包含一个名为"load"的方法，
                方法将接受三个参数：url, res, cb，分别表示资源全路径、res对象（就是cc.loader.load方法的资源列表的项），回调函数。
                可能包含一个名为"getBasePath"的方法，该方法返回该类型资源的根路径，不设置该方法默认为cc.loader.resPath。

返回值：无
```

用法：

```script
cc.txtLoader = {
    load : function(url, res, cb){
        var cache = cc.loader.cache, obj = cache[url];
        if(obj) return cb(obj);
        cc.loader.loadTxt(url, function(err, txt){
            if(err) return cb(err);
            if(txt == null) return cb(null, null);
            obj = txt;
            cache[url] = obj;
            cb(null, obj);
        });
    }
}
cc.loader.register(["plist", "xml", "fnt", "tmx", "tsx"], cc.txtLoader);
```

## 注册loader插件

引擎自带loader写在CCLoaders.js中。实现方式也很简单，相信看下源码就懂了，这里就不多说了。