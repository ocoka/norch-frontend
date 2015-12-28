modules.define('js-loader', function (provide) {
    var loading = {},
        loaded = {},
        head = document.getElementsByTagName('head')[0],
        runCallbacks = function (path, type) {
            var cbs = loading[path], cb, i = 0;
            delete loading[path];
            while (cb = cbs[i++]) {
                cb[type] && cb[type]();
            }
        },
        onSuccess = function (path) {
            loaded[path] = true;
            runCallbacks(path, 'success');
        },
        onError = function (path) {
            runCallbacks(path, 'error');
        };

    provide(
        /**
         * @exports
         * @param {String} path resource link
         * @param {Function} success to be called if the script succeeds
         * @param {Function} error to be called if the script fails
         */
        function (path, success, error) {
            if (loaded[path]) {
                success();
                return;
            }

            if (loading[path]) {
                loading[path].push({success: success, error: error});
                return;
            }

            loading[path] = [{success: success, error: error}];

            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.charset = 'utf-8';
            script.async = true;
            script.src = (location.protocol === 'file:' && !path.indexOf('//') ? 'http:' : '') + path;

            if ('onload' in script) {
                script.onload = function () {
                    script.onload = script.onerror = null;
                    onSuccess(path);
                };

                script.onerror = function () {
                    script.onload = script.onerror = null;
                    onError(path);
                };
            } else {
                script.onreadystatechange = function () {
                    var readyState = this.readyState;
                    if (readyState === 'loaded' || readyState === 'complete') {
                        script.onreadystatechange = null;
                        onSuccess(path);
                    }
                };
            }

            head.insertBefore(script, head.lastChild);
        }
    );

});
modules.define("jquery", ["js-loader"], function (provide, js_loader) {
    var url = '//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js';
    js_loader(url, function () {
        provide(window.jQuery);
    });
});
modules.define("js-init", ["jquery"], function (provide, $) {
    function _init() {
        var data = this.onclick();
        var dom=this;
        for (var block in data) {
            modules.require(block, function (block_js) {
                block_js(dom, data[block]);
            });
        }
    }

    var _impl = {
        reinit: function (ctx) {
            if (null != ctx) {
                $(ctx, ".js-init").each(_init);
            } else {
                $(".js-init").each(_init);
            }
        },
        init: function () {
            $(function () {
                _impl.reinit();
            });
        }
    }
    provide(_impl);
});
modules.require("js-init", function (js_init) {
    js_init.init();
});