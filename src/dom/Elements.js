/*!
 * tangram.js framework sugar compiled code
 *
 * Datetime: Fri, 04 May 2018 06:52:16 GMT
 */
;
// tangram.config({});
tangram.block([
	'$_/util/bool',
	'$_/arr/',
	'$_/math/easing',
	'$_/dom/Animation'
], function (pandora, root, imports, undefined) {
	var dom = pandora.ns('dom', {});
	var _ = pandora;
	var declare = pandora.declareClass;
	var query = dom.sizzle || dom.query;
	var insert = function (content, handler) {
		switch (typeof content) {
			case 'string':
			return this.each(function () {
				
				handler(this, content);
			})
			case 'object':
			if (content.nodeType === 1 && this[0]) {
				
				handler(this[0], content);
				return this;
			}
			if (content.lenth > this.lenth) {
				return this.each(function (i) {
					
					handler(this, content[i]);
				})
			}
			break
			case 'function':
			return this.each(function (i) {
				
				handler(this, content(i));
			})
		}
		return this;
	}
	var sizes = function (type, value, handler) {
		switch (typeof value) {
			case 'string':
			case 'number':
			return this.each(function () {
				dom.setStyle(this, type, value)
			})
			case 'function':
			return this.each(function (i) {
				dom.setStyle(this, type, value(i, dom.getStyle(this, type)))
			})
			case 'undefined':
			return this[0] && handler(this[0])
		}
		return this;
	}
	var scroll_offset = function (type, value) {
		if (_.util.bool.isNumeric(value)) {
			return this.each(function () {
				dom.setStyle(this, type, value)
			})
		}
		if (_.util.bool.isFn(value)) {
			return this.each(function (i) {
				dom.setStyle(this, type, value(i, dom.getStyle(this, type)))
			})
		}
		return this[0] && dom.getStyle(this[0], type)
	}
	pandora.declareClass('dom.Elements', _.Iterator, {
		context: document,
		_init: function (selector, context) {
			if (_.util.bool.isOuterHTML(selector)) {
				this.isElFragment = true;
				this.context = context || this.context;
				Elements = dom.createByString(this.selector = selector)
				for (var i = 0;i < Elements.length;i++) {
					this.push(Elements[i])
				}
			}
			else {
				this.selector = selector;
				this.context = context || this.context;
				var Elements = []
				if (selector) {
					switch (typeof (selector)) {
						case 'string':
						Elements = query(selector, this.context)
						break
						case 'object':
						switch (_.util.type(selector, true)) {
							case 'HTMLDocument':
							case 'Global':
							case 'Element':
							Elements.push(arguments[0])
							break
							case 'Object':
							Elements = dom.query.byAttr(selector)
							break
							case 'Elements':
							Elements = arguments[0]
							break
							case 'Array':
							console.log(arguments[0])
							for (var i = 0;
							i < arguments[0].length;i++) {
								_.util.type(arguments[0][i]) == 'Element' && Elements.push(arguments[0][i])
							}
							break
						}
						break
					}
					for (var i = 0;i < Elements.length;i++) {
						this.push(Elements[i])
					}
				}
			}
		}
	});
	pandora.extend(pandora.dom.Elements.prototype, {
		each: function (handler) {
			for (var i = 0;i < this.length;i++) {
				handler.call(this[i], i, this[i])
			}
			return this;
		},
		find: function (selector) {
			var Elements = []
			this.each(function () {
				Elements.push(query(selector, this))
			})
			this.prevObject = this;
			this.splice(0, this.length)
			for (var i in Elements) {
				for (var j = 0;
				j < Elements[i].length;j++) {
					this.push(Elements[i][j])
				}
			}
			return this;
		},
		closet: function (tagName) {
			var Elements = []
			var node = void 0;
			this.each(function () {
				if (node = dom.closest(this, tagName)) {
					Elements.push(node)
				}
			})
			this.prevObject = this;
			this.splice(0, this.length)
			for (var i = 0;i < Elements.length;i++) {
				this.push(Elements[i])
			}
			return this;
		},
		get: function (n) {
			if (typeof n === 'number') {
				if (n >= 0 && n < this.length) {
					return this[n]
				}
				else if (n < 0 && n + this.length >= 0) {
					return this[n + this.length]
				}
			}
			return null;
		},
		sub: function (part) {
			var Elements = []
			switch (typeof part) {
				case 'number':
				this.get(part) && Elements.push(this.get(part))
				break
				case 'string':
				switch (part) {
					case 'first':
					this[0] && Elements.push(this[0])
					break
					case 'last':
					this[this.length - 1] && Elements.push(this[this.length - 1])
					break
					case 'odd':
					for (var i = 0;i < part.length;i += 2) {
						Elements.push(this[i])
					}
					break
					case 'even':
					for (var i = 1;i < part.length;i += 2) {
						Elements.push(this[i])
					}
					break
				}
				break
				case 'object':
				if (part instanceof Array) {
					part = _.unique(part)
					for (var i = 0;i < part.length;i++) {
						this.get(part[i]) && Elements.push(this.get(part[i]))
					}
				}
				break
			}
			this.prevObject = this;
			this.splice(0, this.length)
			for (var i in Elements) {
				this.push(Elements[i])
			}
			return this;
		},
		concat: function (selector, context) {
			var res = query(selector, context || document)
			for (var i = 0;i < res.length;i++) {
				if (_.arr.has(this, res[i]) === false) {
					this.push(res[i])
				}
			}
			return this;
		},
		is: function (tagName, screen) {
			switch (typeof tagName) {
				case 'string':
				tagName = tagName.toUpperCase()
				switch (typeof screen) {
					case 'boolean':
					if (screen) {
						var list = []
						this.each(function () {
							if (this.tagName.toUpperCase() === tagName) {
								list.push(this)
							}
						})
						return list;
					}
					for (var i = 0;i < this.length;i++) {
						if (this.tagName.toUpperCase() !== tagName) {
							return false;
						}
					}
					return true;
					case 'number':
					if (this[screen]) {
						return this[screen].tagName.toUpperCase() === tagName ? true : false;
					}
					return false;
				}
				return this[0] && ((this[0].tagName.toUpperCase() === tagName)?true:false)
				case 'boolean':
				if (tagName) {
					var list = []
					this.each(function () {
						list.push(this.tagName.toUpperCase())
					})
					return list;
				}
				break
				case 'number':
				return this[tagName] && this[tagName].tagName.toUpperCase()
			}
			return this[0] && this[0].tagName.toUpperCase()
		},
		append: function (content) {
			switch (typeof content) {
				case 'string':
				return this.each(function () {
					this.innerHTML += content;
				})
				case 'function':
				return this.each(function (i) {
					this.innerHTML += content(i, this.innerHTML)
				})
				case 'object':
				if (content.nodeType == 1) {
					if (this[0]) {
						this[0].appendChild(content)
					}
				}
			}
			return this;
		},
		appendTo: function (selector) {
			var parents = new dom.Elements(selector)
			if (this.isElFragment) {
				var Elements = void 0;
				var that = this;
				that.length = 0;
				parents.each(function (i, parent) {
					console.log(parent)
					Elements = dom.createByString(that.selector, parent)
					for (var i = 0;i < Elements.length;i++) {
						that.push(Elements[i])
					}
				})
				return this;
			}
			if (parents.length == 1) {
				var node = this[0]
				while (node) {
					parents[0].appendChild(node)
					node = this[0]
				}
				return this;
			}
			return this;
		},
		remove: function () {
			this.each(function () {
				dom.remove(this)
			})
			return null;
		},
		before: function (content) {
			return insert.call(this, content, dom.before)
		},
		after: function (content) {
			return insert.call(this, content, dom.after)
		},
		index: function (list) {
			if (_.util.type.isElement(list)) {
				return dom.index(list, this)
			}
			return dom.index(this[0], list)
		},
		parent: function () {
			var nodes = []
			this.each(function () {
				nodes.push(this.parentNode)
			})
			return new dom.Elements(_.arr.unique(nodes))
		}
	});
	pandora.extend(pandora.dom.Elements.prototype, {
		attr: function (attr, value) {
			switch (typeof value) {
				case 'string':
				return this.each(function () {
					dom.setAttr(this, attr, value)
				})
				case 'function':
				return this.each(function (i) {
					dom.setAttr(this, attr, value(i, dom.getAttr(this, attr)))
				})
				case 'undefined':
				return this[0] && dom.getAttr(this[0], attr)
			}
			this;
		},
		removeAttr: function (attr) {
			if (typeof attr == 'string') {
				this.each(function () {
					dom.removeAttr(this, attr)
				})
			}
			return this;
		},
		data: function (dataName, data) {
			switch (typeof data) {
				case 'string':
				case 'number':
				this.each(function (index) {
					dom.setData(this, dataName, _.util.bool.isFn(data)? data.call(this, index): data)
				})
				break
				case 'function':
				return this.each(function (i) {
					dom.setData(this, attr, data(i, dom.getAttr(this, dataName)))
				})
				case 'undefined':
				return this[0] && dom.getData(this[0], dataName)
			}
			return this;
		},
		html: function (nodeString) {
			switch (typeof nodeString) {
				case 'string':
				case 'number':
				return this.each(function () {
					this.innerHTML = nodeString;
				})
				case 'function':
				this.each(function (i) {
					this.innerHTML = nodeString(i, this.innerHTML)
				})
				case 'undefined':
				return this[0]? this[0].innerHTML : ''
			}
			return this;
		},
		hasClass: function (className) {
			return this[0] && dom.hasClass(this[0], className)
		},
		toggleClass: function (className, isSwitch) {
			switch (typeof className) {
				case 'string':
				this.each(function () {
					dom.toggleClass(this, className, isSwitch)
				})
				break
				case 'function':
				this.each(function (i, el) {
					dom.toggleClass(this, className(i, dom.getAttr(el, 'class')), isSwitch)
				})
				break
				case 'boolean':
				if (className === false) {
					this.each(function (i, el) {
						dom.setAttr(this, 'class', '')
					})
				}
				break
			}
			return this;
		},
		addClass: function (className) {
			return this.toggleClass(className, true)
		},
		removeClass: function (className) {
			return this.toggleClass(className, false)
		}
	});
	pandora.extend(pandora.dom.Elements.prototype, {
		css: function (style, value) {
			if (typeof style === 'object') {
				this.each(function () {
					var _arguments = arguments;
					pandora.each(style, function (prop, value) {
						dom.setStyle(this, prop, value)
					}, this);
				})
			}
			else {
				switch (typeof value) {
					case 'string':
					case 'number':
					return this.each(function () {
						dom.setStyle(this, style, value)
					})
					case 'function':
					return this.each(function (i) {
						dom.setStyle(this, style, value(i, dom.getStyle(this, style)))
					})
					case 'undefined':
					if (typeof style === 'string') {
						return this[0] && dom.getStyle(this[0], style)
					}
				}
			}
			return this;
		},
		width: function (value) {
			return sizes.call(this, 'width', value, dom.getWidth)
		},
		outerWidth: function (includeMargin) {
			if (includeMargin) {
				return this[0] && dom.getWidth(this[0], 'box')
			}
			return this[0] && dom.getWidth(this[0], 'outer')
		},
		innerWidth: function () {
			return this[0] && dom.getWidth(this[0], 'inner')
		},
		height: function (value) {
			return sizes.call(this, 'height', value, dom.getHeight)
		},
		outerHeight: function (includeMargin) {
			if (includeMargin) {
				return this[0] && dom.getHeight(this[0], 'box')
			}
			return this[0] && dom.getHeight(this[0], 'outer')
		},
		innerHeight: function (includeMargin) {
			return this[0] && dom.getHeight(this[0], 'inner')
		},
		scrollHeight: function (value) {
			return scroll_offset.call(this, 'scrollHeight', value)
		},
		scrollLeft: function (value) {
			return scroll_offset.call(this, 'scrollLeft', value)
		},
		scrollTop: function (value) {
			return scroll_offset.call(this, 'scrollTop', value)
		},
		scrollWidth: function (value) {
			return scroll_offset.call(this, 'scrollWidth', value)
		},
		offsetHeight: function (value) {
			return scroll_offset.call(this, 'offsetHeight', value)
		},
		offsetLeft: function (value) {
			return scroll_offset.call(this, 'offsetLeft', value)
		},
		offsetTop: function (value) {
			return scroll_offset.call(this, 'offsetTop', value)
		},
		offsetWidth: function (value) {
			return scroll_offset.call(this, 'offsetWidth', value)
		},
		offset: function (value) {
			if (value) {
				switch (typeof value) {
					case 'object':
					return this.each(function () {
						dom.setStyle(this, 'offsetTop', value.top)
						dom.setStyle(this, 'offsetLeft', value.left)
					})
					case 'function':
					return this.each(function (i) {
						var style = dom.getStyle(this)
						dom.setStyle(this, 'offsetTop', value(i, style.offsetTop))
						dom.setStyle(this, 'offsetLeft', value(i, style.offsetLeft))
					})
				}
			}
			var style = this[0]? dom.getStyle(this[0]):{
				offsetTop: null,
				offsetLeft: null
			}
			return {
				top: style.offsetTop,
				left: style.offsetLeft
			}
		},
		widths: function () {
			var width = 0;
			this.each(function () {
				width += dom.getWidth(this, 'box')
			})
			return width;
		},
		heights: function () {
			var height = 0;
			this.each(function () {
				height += dom.getHeight(this, 'box')
			})
			return height;
		},
		show: function () {
			this.each(function () {
				dom.setStyle(this, 'display', 'block')
			})
			return this;
		},
		hide: function () {
			this.each(function () {
				dom.setStyle(this, 'display', 'none')
			})
			return this;
		}
	});
	pandora.extend(pandora.dom.Elements.prototype, {
		on: function (eventType, selector, data, handler) {
			switch (arguments.length) {
				case 3:
				handler = _.util.bool.isFn(data)? data : undefined;
				data = null;
				break
				case 2:
				handler = _.util.bool.isFn(selector)? selector : undefined;
				selector = null;
				data = null;
				break
			}
			this.each(function () {
				var _arguments = arguments;
				if (_.util.bool.isArr(eventType)) {
					pandora.each(eventType, function (i, et) {
						dom.events.add(this, et, selector, data, handler)
					}, this);
				}
				else {
					dom.events.add(this, eventType, selector, data, handler)
				}
			})
			return this;
		},
		off: function (eventType, selector, handler) {
			this.each(function () {
				var _arguments = arguments;
				if (_.util.bool.isArr(eventType)) {
					pandora.each(eventType, function (i, et) {
						dom.events.remove(this, et, selector, handler)
					}, this);
				}
				else {
					dom.events.remove(this, eventType, selector, handler)
				}
			})
			return this;
		},
		trigger: function (eventType, data) {
			this.each(function () {
				dom.events.trigger(this, eventType, data)
			})
			return this;
		},
		bind: function (eventType, data, handler) {
			if (arguments.length == 2) {
				handler = _.util.bool.isFn(data)? data : undefined;
				data = undefined;
			}
			return this.on(eventType, null, data, handler)
		},
		unbind: function (eventType, handler) {
			return this.off(eventType, null, handler)
		},
		mouseover: function (data, handler) {
			return this.bind('mouseover', data, handler)
		},
		mouseout: function (data, handler) {
			return this.bind('mouseout', data, handler)
		},
		hover: function (overCallback, outCallback) {
			return this.mouseover(overCallback).mouseout(outCallback || overCallback)
		},
		mousedown: function (data, handler) {
			return this.bind('mousedown', data, handler)
		},
		mouseup: function (data, handler) {
			return this.bind('mouseup', data, handler)
		},
		mousemove: function (data, handler) {
			this.bind('mousemove', data, handler)
		}
	});
	pandora.extend(pandora.dom.Elements.prototype, {
		val: function (value) {
			if (typeof value == 'string'|| typeof value == 'number') {
				this.each(function (i, el) {
					this.value = value;
				})
			}
			else {
				if (this[0]) {
					return this[0].value;
				}
				return null;
			}
			return this;
		}
	});
	dom.Animation.setTweens(_.math.easing.all);
	pandora.extend(pandora.dom.Elements.prototype, {
		transition: function (style, value, duration, easing, callback) {
			to = {}
			to[style]= value;
			this.each(function () {
				new dom.Animation(this,{
					to: to,
					duration: duration,
					tween: dom.Animation.getTween(easing),
					callback: callback
				}).play(1);
			})
			return this;
		},
		animate: function (styles, duration, easing, callback) {
			duration = duration || 1000;
			this.each(function () {
				dom.animator.play(this, styles, duration, easing, callback)
			})
			return this;
		},
		stop: function (stopAll, goToEnd) {
			this.each(function () {
				dom.animator.stop(this, stopAll, goToEnd)
			})
			return this;
		},
		animator: function (options) {
			this.each(function () {
				dom.animator(this, options).play()
			})
			return this;
		},
		show: function (duration, easing, callback) {
			this.each(function () {
				if (duration) {
					duration = duration;
					if (dom.getStyle(this, 'display') != 'none') {
						callback && callback.call(this)
					}
					else {
						var Animation = dom.animator(this)
						var len = Animation.length;
						var from = {
							width: 0,
							height: 0,
							paddingTop: 0,
							paddingRight: 0,
							paddingBottom: 0,
							paddingLeft: 0,
							marginTop: 0,
							marginRight: 0,
							marginBottom: 0,
							marginLeft: 0,
							opacity: 0
						}
						var to = {
							width: dom.getStyle(this, 'width'),
							height: dom.getStyle(this, 'height'),
							paddingTop: dom.getStyle(this, 'paddingTop'),
							paddingRight: dom.getStyle(this, 'paddingRight'),
							paddingBottom: dom.getStyle(this, 'paddingBottom'),
							paddingLeft: dom.getStyle(this, 'paddingLeft'),
							marginTop: dom.getStyle(this, 'marginTop'),
							marginRight: dom.getStyle(this, 'marginRight'),
							marginBottom: dom.getStyle(this, 'marginBottom'),
							marginLeft: dom.getStyle(this, 'marginLeft'),
							opacity: dom.getStyle(this, 'opacity')
						}
						if (len > 0) {
							for (var style in to) {
								for (var i = len - 1;i >= 0;i--) {
									if (Animation.scenes[i].over && Animation.scenes[i].over[style]) {
										to[style]= Animation.scenes[i].over[style]
										break
									}
								}
							}
						}
						dom.setStyle(this, from)
						dom.setStyle(this, 'display', 'block')
						Animation.push({
							from: from,
							to: to,
							over: to,
							duration: duration,
							tween: dom.Animation.getTween(easing),
							callback: callback
						})
						Animation.play(1)
					}
				}
				else {
					dom.setStyle(this, 'display', 'block')
				}
			})
			return this;
		},
		hide: function (duration, easing, callback) {
			this.each(function () {
				if (duration) {
					duration = duration;
					if (dom.getStyle(this, 'display') == 'none') {
						callback && callback.call(this)
					}
					else {
						var Animation = dom.animator(this)
						var len = Animation.length;
						var from = {
							width: dom.getStyle(this, 'width'),
							height: dom.getStyle(this, 'height'),
							paddingTop: dom.getStyle(this, 'paddingTop'),
							paddingRight: dom.getStyle(this, 'paddingRight'),
							paddingBottom: dom.getStyle(this, 'paddingBottom'),
							paddingLeft: dom.getStyle(this, 'paddingLeft'),
							marginTop: dom.getStyle(this, 'marginTop'),
							marginRight: dom.getStyle(this, 'marginRight'),
							marginBottom: dom.getStyle(this, 'marginBottom'),
							marginLeft: dom.getStyle(this, 'marginLeft'),
							opacity: dom.getStyle(this, 'opacity')
						}
						var to = {
							width: 0,
							height: 0,
							paddingTop: 0,
							paddingRight: 0,
							paddingBottom: 0,
							paddingLeft: 0,
							marginTop: 0,
							marginRight: 0,
							marginBottom: 0,
							marginLeft: 0,
							opacity: 0
						}
						if (len > 0) {
							for (var style in from) {
								for (var i = len - 1;i >= 0;i--) {
									if (Animation.scenes[i].over && Animation.scenes[i].over[style]) {
										from[style]= Animation.scenes[i].over[style]
										break
									}
								}
							}
						}
						Animation.push({
							from: from,
							to: to,
							over: from,
							duration: duration,
							tween: dom.Animation.getTween(easing),
							callback: function () {
								dom.setStyle(this, 'display', 'none')
								dom.setStyle(this, from)
								callback && callback.call(this)
							}
						})
						Animation.play(1)
					}
				}
				else {
					dom.setStyle(this, 'display', 'none')
				}
			})
			return this;
		},
		fadeIn: function (duration, easing, callback) {
			duration = duration || 1000;
			this.each(function () {
				var Animation = dom.animator(this)
				var len = Animation.length;
				var opacity = dom.getStyle(this, 'opacity')
				if (len > 0) {
					for (var i = len - 1;i >= 0;i--) {
						if (Animation.scenes[i].over && Animation.scenes[i].over.opacity) {
							opacity = Animation.scenes[i].over.opacity;
							break
						}
					}
				}
				dom.setStyle(this, 'opacity', 0)
				dom.setStyle(this, 'display', 'block')
				Animation.push({
					from: {opacity: 0},
					to: {opacity: opacity},
					over: {opacity: opacity},
					duration: duration,
					tween: dom.Animation.getTween(easing),
					callback: function () {
						callback && callback.call(this)
					}
				})
				Animation.play(1)
			})
			return this;
		},
		fadeOut: function (duration, easing, callback) {
			duration = duration || 1000;
			this.each(function () {
				if (dom.getStyle(this, 'display') == 'none') {
					callback && callback.call(this)
				}
				else {
					var Animation = dom.animator(this)
					var len = Animation.length;
					var opacity = dom.getStyle(this, 'opacity')
					if (len > 0) {
						for (var i = len - 1;i >= 0;i--) {
							if (Animation.scenes[i].over && Animation.scenes[i].over.opacity) {
								opacity = Animation.scenes[i].over.opacity;
								break
							}
						}
					}
					Animation.push({
						from: {opacity: opacity},
						to: {opacity: 0},
						over: {opacity: opacity},
						duration: duration,
						tween: dom.Animation.getTween(easing),
						callback: function () {
							dom.setStyle(this, 'display', 'block')
							callback && callback.call(this)
						}
					})
					Animation.play(1)
				}
			})
			return this;
		}
	});
	var select = function (selector, context) {
		return new dom.Elements(selector, context)
	}
	var $ = dom.select;
	pandora.ns('dom.select', {
		extend: function (object, rewrite) {
			_.extend(dom.Elements.prototype, rewrite, object)
		}
	});
	this.module.exports = select;
	pandora.dom.select = select;
	pandora.dom.$ = $;
}, true);
//# sourceMappingURL=./Elements.js.map