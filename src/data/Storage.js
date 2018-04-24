/*!
 * tangram.js framework sugar compiled code
 *
 * Datetime: Tue, 24 Apr 2018 15:55:03 GMT
 */
;
// tangram.config({});
tangram.block([
	'$_/obj/',
	'$_/str/hash'
], function (pandora, global, imports, undefined) {
	var _ = pandora;
	var doc = global.document;
	var console = global.console;
	var location = global.location;
	var localStorage = global.localStorage;
	var data = {};
	pandora.declareClass('data.Storage', {
		_init: function (name) {
			if(name && (typeofname === 'string')) {
				this.id = _.str.hash.md5.pseudoIdentity(name);
			}else {
				this.id = new _.Identifier(name, 1).toString();
			}
			try {
				data[this.id] = global.JSON.parse(localStorage[this.id]);
				this.length = _.obj.length(data[this.id], true);
			}
			catch (e) {
				data[this.id] = {};
				localStorage[this.id] = '{}';
				this.length = 0;
			}
			return this;
		},
		set: function (key, value) {
			if (key &&  typeof key === 'string') {
				if (value === undefined) {
					if(data[this.id].hasOwnProperty(key)) {
						delete data[this.id][key];
						localStorage[this.id] = global.JSON.stringify(data[this.id]);
						this.length = _.obj.length(data[this.id], true);
					};
				}else {
					data[this.id][key] = value;
					localStorage[this.id] = global.JSON.stringify(data[this.id]);
					this.length = _.obj.length(data[this.id], true);
				};
			}
			return this;
		},
		get: function (key) {
			if (key === undefined) {
				return data[this.id];
			}
			if (key &&  typeof key === 'string') {
				if(data[this.id].hasOwnProperty(key)) {
					return data[this.id][key];
				};
			}
			return undefined;
		},
		clear: function (del) {
			if (del) {
				delete data[this.id];
				delete localStorage[this.id];
			}else {
				data[this.id] = {};
				localStorage[this.id] = '{}';
			}
			return null;
		}
	});
	return _.data.Storage;
});