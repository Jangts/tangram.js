/*!
 * tangram.js framework source code
 *
 * class see.Sticker,
 *
 * Date: 2017-04-06
 */
;
tangram.block([
    '$_/util/bool.xtd',
    '$_/dom/Elements/animation.clsx',
], function(pandora, global, undefined) {
    var _ = pandora,
        declare = pandora.declareClass,
        cache = pandora.locker,
        document = global.document,
        location = global.location,
        infinity = global.Number.POSITIVE_INFINITY,
        $ = _.dom.select;

    _('see');

    var initScrollTop = $(document.body).scrollTop(),
        handlers = {};

    declare('see.Sticker', {
        animationDuration: 0,
        _init: function(elem, settings) {
            this.Element = _.util.type.isElement(elem) ? elem : document.getElementById(elem);
            this.uid = new _.Identifier().toString();
            handlers[this.uid] = {};
            settings = settings || {};
            var position = settings.position || 'fixed';
            var zIndex = settings.zIndex || infinity;
            $(this.Element).css('position', position).css('z-index', zIndex);
            if (settings.autoShow) {
                if (settings.autoShow.scrollTop) {
                    var autoShowScrollTop = settings.autoShow.scrollTop;
                } else {
                    var autoShowScrollTop = 0;
                }
                var that = this;
                handlers[this.uid][autoShowScrollTop] = {
                    up: [function() {
                        that.hide();
                    }],
                    down: [function() {
                        that.show();
                    }]
                };
                if (initScrollTop >= autoShowScrollTop) {
                    this.show();
                }
            } else {
                this.show();
            }
            if (settings.animation) {
                if (settings.animation.duration) {
                    this.animationDuration = settings.animation.duration;
                } else {
                    this.animationDuration = 500;
                }
            } else {
                this.animationDuration = 0;
            }
            this.bindListener();
        },
        show: function(callback) {
            var that = this;
            $(this.Element).show(this.animationDuration, function() {
                _.util.bool.isFn(callback) && callback.call(that);
            });
        },
        hide: function(callback) {
            var that = this;
            $(this.Element).hide(this.animationDuration, function() {
                _.util.bool.isFn(callback) && callback.call(that);
            });
        },
        bindListener: function() {
            var that = this,
                callback = function() {
                    var currScrollTop = $(document.body).scrollTop();
                    if (initScrollTop <= currScrollTop) {
                        //down
                        _.each(handlers[that.uid], function(scrollTop, callbacks) {
                            //console.log(currScrollTop, scrollTop, callbacks);
                            if (currScrollTop >= scrollTop && scrollTop >= initScrollTop) {
                                //console.log(callbacks);
                                //console.log(currScrollTop - scrollTop);
                                _.each(callbacks.down, function(i, callback) {
                                    callback(currScrollTop);
                                });
                            }
                        });
                    } else if (initScrollTop > currScrollTop) {
                        //up
                        _.each(handlers[that.uid], function(scrollTop, callbacks) {
                            if (currScrollTop < scrollTop && scrollTop <= initScrollTop) {
                                //console.log(callbacks);
                                _.each(callbacks.up, function(i, callback) {
                                    callback(currScrollTop);
                                });
                            }
                        });
                    }
                    initScrollTop = currScrollTop;
                };
            $(document).on('scroll', callback);
        },
        register: function(scrollTop, downCallback, upCallback) {
            handlers[this.uid][scrollTop] = handlers[this.uid][scrollTop] || {
                down: [],
                up: []
            };
            _.util.bool.isFn(downCallback) && handlers[this.uid][scrollTop].down.push(downCallback);
            _.util.bool.isFn(upCallback) && handlers[this.uid][scrollTop].up.push(upCallback);
        }
    });
});