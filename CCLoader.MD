# CCLoader 改造

## net.js

在net.js中存放网络相关的操作，作为统一管理。

在这里，我们主要关注`loadRes`这个方法：

```script
(function(_){
    var net = _.net = {};
    var loaderRegister = net.loaderRegister = {};
    net.resRoot = "";
    net.audioRoot = "";

    ...

    function _loadRes(cb, index){
        var item = this.arr[index];
        var type = _.extName(item);
        var loader = loaderRegister[type];
        if(!loader) return cb("loader for [" + type + "] not exists!");
        loader.loadSgl(item, cb);
    }
    net.loadRes = function(res, trigger, cb){
        var l = arguments.length;
        var _trigger = null;
        if(l == 3) _trigger = trigger;
        else if(l == 2) cb = trigger;
        else throw "[net.loadRes] arguments error!";
        if(typeof res == "string") res = [res];
        _.series(res, _loadRes, _trigger, cb);
    }

    net.registerLoader = function(extName, loader){
        if(!extName || !loader) return;
        loaderRegister[extName.trim().toLowerCase()] = loader;
    }

})(cc);
```

`loadRes`是加载资源的接口， 支持两种传参模式：

两个参数：

```script
net.loadRes(["a.png", "b.png"], function(err, results){
    //TODO 这里是加载完成后的回调
});
```

三个参数：

```script
net.loadRes(["a.png", "b.png"], function(length, count){
    //TODO 这是数组中每个资源加载后的触发器，length 表示数组总长度，count表示加载了几个了
}, function(err, results){
    //TODO 这里是加载完成后的回调
});
```

用`net.loadRes` 方法取代了原来的`cc.Loader.preLoad`，应该说，cc.Loader将在这里被完全移除掉。

对于资源的加载，现在采用插件机制，每种资源都可以拥有属于自己的加载器，通过继承`cc.BaseLoader`类，重写`loadSgl`方法实现自己的加载逻辑。

例如，我们要实现添加一个Json的Loader：

```script
(function(_, net){
    _.JsonLoader = function(){
        _.BaseLoader.call(this);
        var cache = this.cache = {};
        this.loadSgl = function(url, cb){
            var json = cache[url];
            if(json) return cb(json);
            net.loadSglTxt(url, function(err, txt){
                if(err) return cb(err);
                if(txt == null) return cb(null);
                json = JSON.parse(txt);
                if(json == null) cb(null);
                cache[url] = json;
                cb(null, json);
            });
        };
    }
    var loader = _.jsonLoader = new _.JsonLoader();
    net.registerLoader("json", loader);
})(cc, cc.net);

```

我们只需要通过`net.registerLoader`进行注册就可以了，这样就不用想原来的CCLoader那样，通过switch来进行判断了，可以进行很好的解耦。


然后LoaderScene我这里先用一个Layer代替，但是原理一样：

```script
(function(cc, net){
    tt.LoaderLayer = cc.Layer.extend({
        _interval : null,
        _length : 0,
        _count : 0,
        _label : null,
        _millisec : 1,
        init : function(){
            var label = this._label = cc.LabelTTF.create("0%");
            this.addChild(label);
            label.setPosition(tt.winSize.width/2, tt.winSize.height/2);
            return true;
        },
        preLoad : function(res, cb){
            var self = this;
            this._interval = setInterval(function () {
                self.display();
            }, self._millisec);
            if(typeof res == "string") res = [res];
            self._length = res.length;
            net.loadRes(res, function(length, count){
                self._count = count;
            }, cb);
        },
        display : function(){
            var self = this;
            var count = self._count;
            var length = self._length;
            var c = (count / length * 100) | 0;
            self._label.setString(c + "%");
            if(count == length) clearInterval(self._interval);
        }
    });
    tt.LoaderLayer.create = function(args){
        var layer = new tt.LoaderLayer();
        layer.init();
        return layer;
    };

})(cc, cc.net);

```

调用：

```script

var loaderLayer = tt.LoaderLayer.create();
this.addChild(loaderLayer);
var resArr = [];
for(var j = 0; j < 50; j++){
    resArr.push(res.eff_0_plist.replace(/(\d+)(\D*)$/g, j + "$2"));
}
loaderLayer.preLoad(resArr, function(err){
    if(err) return console.log(err);
    console.log("success!")
});
```

对于用户来说，如果想自定义自己的LoaderLayer，只需要重写init和display就可以了。只需要关心表现，不需要关心加载。

大概写了下而已，没有贴完整代码。想看实际效果和实现的找我哈。