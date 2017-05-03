if (typeof Hatena == 'undefined')
    var Hatena = {};
if (typeof Hatena.Bookmark == 'undefined')
    Hatena.Bookmark = {};

Ten.Browser.isWebKit = navigator.userAgent.indexOf('WebKit') != -1;

Ten.Geometry.setScroll = function(pos) {
     if (window.scrollTo) {
         window.scrollTo(pos.x, pos.y);
     } else {
         var d = document.documentElement; 
         var b = document.body;
         d.scrollLeft = b.scrollLeft = pos.x;
         d.scrollTop  = b.scrollTop  = pos.y;
     }
};

/* for tmpl... */
Ten._stash = {};

/* Ten.Timer */
Ten.Timer = new Ten.Class({
    base: [Ten.EventDispatcher],
    initialize: function(intarval, repeatCount) {
        this.constructor.SUPER.call(this);
        this.currentCount = 0;
        this.intarval = intarval || 60; // ms
        this.repeatCount = repeatCount || 0;
    }
}, {
    start: function() {
        this.running = true;
        var self = this;
        setTimeout(function() {
            self.loop();
        }, self.intarval);
    },
    reset: function() {
        this.stop();
        this.currentCount = 0;
    },
    loop: function() {
        if (!this.running) return;
        this.currentCount++;
        if (this.repeatCount && this.currentCount >= this.repeatCount) {
            this.stop();
            this.dispatchEvent('timer');
            this.dispatchEvent('timerComplete');
            return;
        }
        var self = this;
        this.dispatchEvent('timer', this.currentCount);
        setTimeout(function() {
            self.loop();
        }, self.intarval);
    },
    stop: function() {
        this.running = false;
    }
});

/* Ten.Position */
if (typeof Ten.Position == 'undefined') {
  Ten.Position = new Ten.Class({
    initialize: function(x,y) {
        this.x = x;
        this.y = y;
    },
    add: function(a,b) {
        return new Ten.Position(a.x + b.x, a.y + b.y);
    },
    subtract: function(a,b) {
        return new Ten.Position(a.x - b.x, a.y - b.y);
    }
  });
}

/* Ten.IFrameMessenger */
if (typeof Ten.IFrameMessenger == 'undefined') {
    Ten.IFrameMessenger = {};
    Ten.IFrameMessenger.Base = new Ten.Class({
        initialize: function(interval) {
            Ten.EventDispatcher.implementEventDispatcher(this);
            this.queue = [];
            this.timer = new Ten.Timer(interval || 60);
            var self = this;
            this.timer.addEventListener('timer', function(repeat) {
                self.timerHandler(repeat);
            });
        }
    }, {
        sendMessage: function(eventName, args/* args shoud be null or string or hash */) {
            if (this.canSendMessage()) {
                this._implSendMessage(eventName, args);
            } else {
                this.queue.push([eventName, args]);
            }
        },
        _implSendMessage: function(evemtName, args) {
        },
        timerHandler: function(repeatCount) {
            this.sendEvent();
        },
        sendEvent: function() {
            var rawMessage = this.getMessage();
            if (rawMessage) {
                var obj = this.unseriarize(rawMessage);
                this.dispatchEvent(obj.eventName, obj.args);
            }
        },
        unseriarize: function(raw) {
            var tmp = raw.split('?', 2);
            var res = {};
            res.eventName = tmp[0];
            if (tmp[1]) {
                if (tmp[1].indexOf('=') == -1) {
                    res.args = decodeURIComponent(tmp[1]);
                } else {
                    var ary = tmp[1].split('&');
                    args = {};
                    for (var i = 0;  i < ary.length; i++) {
                        var query = ary[i].split('=', 2);
                        if (query.length == 2) 
                            args[decodeURIComponent(query[0])] = decodeURIComponent(query[1]);
                    }
                    res.args = args;
                }
            }
            return res;
        },
        seriarize: function(args) {
            if (!args) return '';
    
            if (typeof args == 'string') {
                return encodeURIComponent(args);
            } else {
                var res = [];
                for (prop in args) {
                    if (!args.hasOwnProperty(prop)) continue;
                    res.push( encodeURIComponent(prop) + '=' + encodeURIComponent(args[prop]) );
                }
                return res.join('&');
            }
        },
        canSendMessage: function() {
            /* return bool */
            return true;
        }
    });
    
    
    Ten.IFrameMessenger.Manager = new Ten.Class({
        base: [Ten.IFrameMessenger.Base],
        initialize: function(url, interval) {
            this.constructor.SUPER.call(this, interval);
            this.url = url;
            this.iframeId = '__iframe_messenger';
        },
        onLoad: function() {
            Ten.IFrameMessenger.Manager.dispatchEvent('onload');
            if (Ten.Browser.isWebKit || Ten.Browser.isIE) {
                // XXX
                var pos = Ten._stash.lastPos;
                if (pos) {
                    setTimeout(function() {
                        Ten.Geometry.setScroll(pos);
                    }, 100);
                }
            }
        }
    }, {
        _implSendMessage: function(eventName, args) {
            this.replaceURL(this.url + '#' + eventName + '?' + this.seriarize(args));
        },
        getMessage: function() {
            var tmp = location.href.split('#');
            var hash, otherHash;
            if (tmp.length >= 3) {
                hash = tmp.pop();
                tmp.shift();
                otherHash = tmp;
            } else {
                hash = tmp.pop();
            }
            var re = /^Message-/;
            if (hash && hash.length && re.test(hash)) {
                hash = hash.replace(re, '');
                var pos = Ten.Geometry.getScroll();
                if (otherHash) {
                    location.replace(location.href.split("#")[0] + "#" + otherHash.join('#'));
                } else {
                    location.replace(location.href.split("#")[0] + "#");
                }
                return hash;
            }
        },
        getIFrame: function() {
            return document.getElementById(this.iframeId);
        },
        replaceURL: function(url) {
            if (Ten.Browser.isWebKit || Ten.Browser.isIE) var pos = Ten.Geometry.getScroll();
            this.iframe.contentWindow.location.replace(url);
            if (Ten.Browser.isWebKit || Ten.Browser.isIE) {
                Ten._stash.lastPos = pos;
                Ten.Geometry.setScroll(pos);
            }
        },
        observe: function(parentContainer) {
            if (!this.iframe) {
                var div = document.createElement('div');
                div.innerHTML = "<iframe onload='Ten.IFrameMessenger.Manager.onLoad();' frameborder='0' id='" + this.iframeId + "' style=''></iframe>";
                (parentContainer || document.body).appendChild(div);
                this.iframe = document.getElementById(this.iframeId);
                this.replaceURL(this.url + '#');
            }
            this.timer.start();
        }
    });
    Ten.EventDispatcher.implementEventDispatcher(Ten.IFrameMessenger.Manager);
}


Hatena.Bookmark.Draggable = new Ten.Class({
    base: [Ten.EventDispatcher],
    initialize: function(element,handle) {
        this.constructor.SUPER.call(this);
        this.element = element;
        this.handle = handle || element;
        this.startObserver = new Ten.Observer(this.handle, 'onmousedown', this, 'startDrag');
        this.handlers = [];
        this.dragging = false;
    }
},{
    startDrag: function(e) {
        if (e.targetIsFormElements()) return;
        if (this.dragging) 
            return this.endDrag(e);

        this.dragging = true;
        this.dispatchEvent('startDrag');
        this.delta = Ten.Position.subtract(
            e.mousePosition(),
            Ten.Geometry.getElementPosition(this.element)
        );
        this.handlers = [
            new Ten.Observer(document, 'onmousemove', this, 'drag'),
            new Ten.Observer(document, 'onmouseup', this, 'endDrag'),
            new Ten.Observer(this.element, 'onlosecapture', this, 'endDrag')
        ];
        e.stop();
    },
    drag: function(e) {
        var pos = Ten.Position.subtract(e.mousePosition(), this.delta);
        Ten.Style.applyStyle(this.element, {
            left: pos.x + 'px',
            top: pos.y + 'px'
        });
        e.stop();
    },
    endDrag: function(e) {
        this.dragging = false;
        this.dispatchEvent('endDrag');
        for (var i = 0; i < this.handlers.length; i++) {
            this.handlers[i].stop();
        }
        if(e) e.stop();
    }
});

Hatena.Bookmark.BookmarkLet = new Ten.Class({
    base: [Ten.EventDispatcher],
    instance: null,
    IDC: 0,
    initialize: function() {
        if (this.constructor.instance) return; // singleton
        this.idc = this.constructor.IDC++;
        this.constructor.instance = this;
        this.constructor.SUPER.call(this);
        this.createWindow();
        this.addImages();
    }
}, {
    addImages: function() {
        var images = document.getElementsByTagName('img');
        var thre = 30;
        var limit = 20;
        var srcs = [];
        for (var i = 0;  i < images.length; i++) {
            var image = images[i];
            if (Math.min(image.width, image.height) > thre) {
                srcs.push(image.src);
                if (srcs.length > limit) break;
                if (srcs.join('@').length > 1600) break; // get uri length
            }
        }
        if (srcs.length) {
            this.messenger.sendMessage('addImage', {srcs: srcs.join('@') });
        } else {
            this.messenger.sendMessage('imageNone');
        }
    },
    createWindow: function() {
        var E = Ten.Element;
        var baseURL = this.constructor.baseURL;

        // CSSを打ち消す
        var resetCSSText = 'div.hatena-bookmark-bookmarklet-container, div.hatena-bookmark-bookmarklet-container * {'
                + 'margin: 0;'
                + 'padding: 0;'
                + 'border: 0;'
                + 'text-align: right;'
                + 'font-size:medium;'
                + 'color:#222;'
                + 'font-weight:normal;'
                + 'line-height: 1;'
                + 'text-indent: 0;'
                + 'text-decoration: none;'
                + 'letter-spacing: normal;'
                + 'background: none;'
                + 'position: static;'
                + '-moz-box-sizing: content-box'
                + '}';
        if (Ten.Browser.isIE) {
            var resetCSS = document.createStyleSheet();
            resetCSS.cssText = resetCSSText;
        } else {
            var resetCSS = E('style', {type: 'text/css'});
            document.getElementsByTagName('head')[0].appendChild(resetCSS);
            resetCSS.appendChild(document.createTextNode(resetCSSText))
        }

        var tbody = E('tbody', {});
        var container = E('div', {className: 'hatena-bookmark-bookmarklet-container'},
            (this.header = (E('div', {className: 'hatena-bookmark-bookmarklet-header'}, 
              E('img', {src: baseURL + '/images/logo.gif', style: {position: "absolute", left: '5px', verticalAlign: 'middle'}}))))
        );
        with (container.style) {
             visibility = 'visible';
             position   = "absolute";
             display    = 'none';
             textAlign  = "right";
             padding    = "6px";
             width      = "840px";
             zIndex     = "10002";
             background = '#2c6ebd';
        }
        with (this.header.style) {
            background = '#2c6ebd';
            padding = '3px 0';
            cursor  = "move";
            height  = '15px';
        }
        this.toggleButton = E('img', {src: baseURL + '/images/bookmarklet_fold.gif', style: {verticalAlign: 'middle'}});
        this.header.appendChild(this.toggleButton);
        with (this.toggleButton.style) {
            cursor = 'pointer';
            marginRight = '3px';
        }
        this.toggleButton.observer = new Ten.Observer(this.toggleButton, 'onclick', this, 'toggleHandler');

        this.closeButton = E('img', {src: baseURL + '/images/bookmarklet_close.gif', style: {verticalAlign: 'middle'}});
        this.header.appendChild(this.closeButton);
        with (this.closeButton.style) {
            cursor = 'pointer';
        }
        this.closeButton.observer = new Ten.Observer(this.closeButton, 'onclick', this, 'closeHandler');

        this.container = container;
        var drag = new Hatena.Bookmark.Draggable(container, this.header);
        var href = location.href.replace(/#$/, '');
        this.url = href;
        this.canonical = this.getCanonicalURL();
/*
        var mURL = baseURL + '/bookmarklet?url=' + encodeURIComponent(href) + '&btitle=' + encodeURIComponent(document.title);
        if (this.canonical && href != this.canonical) 
            mURL += '&canonical=' + encodeURIComponent(this.canonical);
*/
        var mURL = baseURL + '/edit.php?req_mode=read&req_url=' + encodeURIComponent(href) + '&req_title=' + encodeURIComponent(document.title);
        var messenger = new Ten.IFrameMessenger.Manager(mURL);
        Ten.IFrameMessenger.Manager.addEventListener('onload', Ten.Function.method(this, 'iframeLoadHandler'));
        var self = this;
        messenger.addEventListener('complete', function() {
            self.completeHandler();
        });
        messenger.iframeId = 'hatena-bookmark-bookmarklet-iframe';
        this.messenger = messenger;
        document.body.appendChild(container);
        this.iframeContainer = E('div'); // iframe を格納するコンテナ
        with(this.iframeContainer.style) {
            padding = '4px 0 0 0';
            background = '#2c6ebd url(' + baseURL +'/images/bookmarklet_iframe_head.gif) center top no-repeat';
        }
        container.appendChild(this.iframeContainer);
        var loadingSpan = new Ten.Element('span', {
                style: {
                    padding: '23px',
                    fontSize: '85%',
                    background: 'url(http://b.hatena.ne.jp/images/loading.gif) left center no-repeat'
                }
            },  'ブックマークレットを起動しています');
        this.loadingMessage = E('div', {}, 
          E('p', {
               style: {
                   position: 'absolute',
                   top: '150px',
                   left: '5px',
                   width: '840px',
                   textAlign: 'center'
              } 
        }, loadingSpan));

        with (this.loadingMessage.style) {
            backgroundColor = '#FFF';
            textAlign = 'center';
        }
        this.iframeContainer.appendChild(this.loadingMessage);
        try {
            messenger.observe(this.iframeContainer);
        } catch(e) {
            // firefox text/plain error
            this.addRedirect();
            return;
        }

        var iframe = messenger.getIFrame();
        this.iframe = iframe;
//	iframe.width = container.style.width;
        iframe.width = '828px';
        iframe.height = '700px';
        iframe.style.background    = '#fff url(' + baseURL +'/images/bookmarklet_iframe_foot.gif) center bottom no-repeat';
        iframe.style.paddingBottom = '4px';

        // ToDo
        drag.addEventListener('startDrag', function() {
            self.iframeContainer.style.display = 'none';
        });
        drag.addEventListener('endDrag', function() {
            if (!self.nowMin)
                self.iframeContainer.style.display = 'block';
        });
        this.hideFlash();
        this.show();
    },
    getCanonicalURL: function() {
        var links = document.getElementsByTagName('link');
        for (var i = 0;  i < links.length; i++) {
            var link = links[i];
            if (link.rel == 'canonical' && link.href) {
                var a = document.createElement('a');
                a.setAttribute('href', link.href);
                // for IE6, 7
                var url = a.cloneNode(false).href;
                return url;
            }
        }
        return null;
    },
    iframeLoadHandler: function() {
        this.loadingMessage.style.display = 'none';
    },
    hideFlash: function() {
        var els = document.getElementsByTagName('embed');
        for (var i = 0;  i < els.length; i++) {
            var el = els[i];
            // none にして block にすると、wmode が適用される
            el.setAttribute('wmode', 'opaque');
            el.style.display = 'none';
            el.style.display = 'block';
        }
        els = document.getElementsByTagName('object');
        for (var i = 0;  i < els.length; i++) {
            var el = els[i];
            var classID = el.getAttribute('classid') || '';
            if (classID.toUpperCase() == 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'.toUpperCase()) {
                // XXX: IE でどうにかしたい
                //p( '<param name="wmode" value="transparent">' + el.innerHTML);
                //p(el);
                //var param = document.createElement("param");
                //param.setAttribute("name", "wmode");
                //param.setAttribute("value", "transparent");
                //el.appendChild(param);
                //el.style.display = 'none';
                //el.style.display = 'block';
            }
        }
    },
    toggleHandler: function(e) {
        e.stop();
        var t = e.target;
        var baseURL = this.constructor.baseURL;
        if (t.src.lastIndexOf('bookmarklet_fold.gif') >= 0) {
            this.nowMin = true;
            this.iframeContainer.style.display = 'none';
            t.src = baseURL + '/images/bookmarklet_open.gif';
        } else {
            this.nowMin = false;
            this.iframeContainer.style.display = 'block';
            t.src = baseURL + '/images/bookmarklet_fold.gif';
        }
    },
    show: function(fromBookmarklet) {
        if (fromBookmarklet) {
            if (this.container.style.display == 'block') {
                this.addRedirect();
                return;
            }
        }
        this.container.style.display = 'block';
        var pos = Ten.Geometry.getScroll();
        this.container.style.top = pos.y + 20 + 'px';
        this.container.style.right = 20 + 'px';
    },
    addRedirect: function() {
        var url = this.constructor.baseURL + '/add?b2=1&from_bookmarklet=1&url=' + encodeURIComponent(this.url);
        location.href = url;
    },
    closeHandler: function(e) {
        e.stop();
        this.container.style.display = 'none';
    },
    removeContainers: function() {
        var containers = Ten.DOM.getElementsByTagAndClassName('div', 'hatena-bookmark-bookmarklet-container');
        for (var i = 0;  i < containers.length; i++) {
            var c = containers[i];
            if (c.parentNode) {
                c.parentNode.removeChild(c);
            }
        }
    },
    completeHandler: function() {
        this.removeContainers(); // mmm...
        this.constructor.instance = null;
    }
});


