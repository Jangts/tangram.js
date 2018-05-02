/*!
 * tangram.js framework syntactic sugar
 * Core Code
 *
 * Written and Designed By Jang Ts
 * http://tangram.js.cn
 */
;
(function (root, factory) {
    if (typeof exports === 'object') {
        exports = factory(root);
        if (typeof module === 'object') {
            module.exports = exports;
        }
    }
    else if (typeof root.define === 'function' && root.define.amd) {
        // AMD
        root.define('tangram_js_sugar', [], function () {
            return factory(root);
        });
    }
    else {
        root.tangram_js_sugar = factory(root);
    }
}(this, function (root) {
    var _this = this;
    if (Array.prototype['includes'] == undefined) {
        Array.prototype['includes'] = function (searchElement, fromIndex) {
            fromIndex = parseInt(fromIndex) || 0;
            for (fromIndex; fromIndex < _this.length; fromIndex++) {
                if (_this[fromIndex] === searchElement) {
                    return true;
                }
            }
            return false;
        };
    }
    var zero2z = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''), namingExpr = /^[A-Z_\$][\w\$]*(\.[A-Z_\$][\w\$]*)*$/i, argsExpr = /^...[A-Z_\$][\w\$]*(\.[A-Z_\$][\w\$]*)*$/i, reservedWords = ['if', 'for', 'while', 'switch', 'with', 'catch'], stringas = {
        '/': '_as_pattern___',
        '`': '_as_template___',
        '"': '_as_string___',
        "'": '_as_string___'
    }, 
    // '++ ', '-- ',
    // ' !', ' ~', ' +', ' -', ' ++', ' --',
    // ' ** ', ' * ', ' / ', ' % ', ' + ', ' - ',
    // ' << ', ' >> ', ' >>> ',
    // ' < ', ' <= ', ' > ', ' >= ',
    // ' == ', ' != ', ' === ', ' !== ',
    // ' & ', ' ^ ', ' | ', ' && ', ' || ',
    // ' = ', ' += ', ' -= ', ' *= ', ' /= ', ' %= ', ' <<= ', ' >>= ', ' >>>= ', ' &= ', ' ^= ', ' |= '
    operators = {
        // 因为打开所有括号后还有检查一次符号，所以运算量还是会带有括号
        mixed: /([\$\w]\s*(@\d+L\d+P\d+O*\d*:::)?)(\=\=|\!\=|\=|\!|\+|\-|\*|\/|\%|<<|>>|>>>|\&|\^|\||<|>)=\s*((\+|\-)?[\$\w\.])/g,
        bool: /([\$\w]\s*(@\d+L\d+P\d+O*\d*:::)?)(\&\&|\|\||\<|\<\<|\>\>\>|\>\>|\>)\s*((\+|\-)?[\$\w\.])/g,
        op: /([\$\w]\s*(@\d+L\d+P\d+O*\d*:::)?)(\+|\-|\*\*|\*|\/|\%|\&)\s*((\s+(\+|\-))?[\$\w\.])/g,
        owords: /\s+(in|of)\s+/g,
        sign: /(^|\s*[^\+\-])(\+|\-)([\$\w\.])/g,
        swords: /(^|[^\$\w])(typeof|instanceof|void|delete)\s+(\+*\-*[\$\w\.])/g,
        before: /(\+\+|\-\-|\!|\~)\s*([\$\w])/g,
        after: /([\$\w\.])\s*(\+\+|\-\-)/g,
        error: /(.*)(\+\+|\-\-|\+|\-)(.*)/g
    }, replaceWords = /(@\d+L\d+P\d+O?\d*:::)?(return|else|try)\s*(\s|;|___boundary_[A-Z0-9_]{36}_(\d+)_as_([a-z]+)___)/g, replaceExpRegPattern = {
        await: /^((\s*@\d+L\d+P0:::)*\s*(@\d+L\d+P0*):::(\s*))?"await"\s*/,
        // using: /^\s*use\s+/g,
        namespace: /((@\d+L\d+P0):::)?(\s*)namespace\s+([\$\w\.]+)\s*(;|\r|\n)/g,
        // 位置是在replace usings 和 strings 之后才tidy的，所以还存在后接空格
        use: /(@\d+L\d+P\d+:::)\s*use\s+([\$\w\.\/\\]+)(\s+as(\s+(@\d+L\d+P\d+:::\s*[\$\w]+)|\s*(@\d+L\d+P\d+:::\s*)?\{(@\d+L\d+P\d+:::\s*[\$\w]+(\s*,@\d+L\d+P\d+:::\s*[\$\w]+)*)\})(@\d+L\d+P\d+:::\s*)?)?\s*[;\r\n]/g,
        include: /\s*@include\s+___boundary_[A-Z0-9_]{36}_(\d+)_as_string___[;\r\n]+/g,
        // return: /[\s;\r\n]+$/g,
        extends: /(@\d+L\d+P\d+O*\d*:::)?((ns|namespace|global|extends)\s+([\$\w\.]+)\s*(return\s*)?\{([^\{\}]*?)\})/g,
        class: /(@\d+L\d+P\d+O*\d*:::)?((class|expands)\s+([\$\w\.]+\s+)?(extends\s+[\$\w\.]+\s*)?\{[^\{\}]*?\})/g,
        fnlike: /(@\d+L\d+P\d+O*\d*:::)?(^|(function|def)\s+)?([\$\w]*\s*\([^\(\)]*\))\s*\{([^\{\}]*?)\}/g,
        parentheses: /(@\d+L\d+P\d+O*\d*:::)?\(\s*([^\(\)]*?)\s*\)/g,
        arraylike: /(@\d+L\d+P\d+O*\d*:::)?\[(\s*[^\[\]]*?)\s*\]/g,
        call: /(@\d+L\d+P\d+O*\d*:::)?((new)\s+([\$\w\.]+)|(\.)?([\$\w]+))\s*(___boundary_[A-Z0-9_]{36}_(\d+)_as_parentheses___)\s*([^\$\w\s\{]|[\r\n].|\s*___boundary_[A-Z0-9_]{36}_\d+_as_array___|\s*@boundary_\d+_as_operator::|$)/g,
        callschain: /\s*\.___boundary_[A-Z0-9_]{36}_(\d+)_as_callmethod___((@\d+L\d+P\d+O*\d*:::)?\.___boundary_[A-Z0-9_]{36}_\d+_as_callmethod___)*/g,
        arrowfn: /(___boundary_[A-Z0-9_]{36}_(\d+)_as_parentheses___)\s*(->|=>)\s*([^,;\r\n]+)\s*(,|;|\r|\n|$)/g,
        closure: /((@\d+L\d+P\d+O*\d*:::)?@*[\$\w]+|\)|\=|\(\s)?(@\d+L\d+P\d+O*\d*:::)?\s*\{(\s*[^\{\}]*?)\s*\}/g,
        expression: /(@\d+L\d+P\d+O*\d*:::)?(if|for|while|switch|with|catch|each)\s*(___boundary_[A-Z0-9_]{36}_(\d+)_as_parentheses___)\s*(___boundary_[A-Z0-9_]{36}_(\d+)_as_closure___)/g,
        log: /log\s+(.+?)\s*[;\r\n]+/g
    }, matchExpRegPattern = {
        string: /(\/|\#|`|"|')([\*\/\=])?/,
        strings: {
            // 位置是在replace usings 和 strings 之后才tidy的，所以还存在后接空格
            '/': /(\s*@\d+L\d+P\d+O?\d*:::\s*)?(\/[^\/\r\n]+\/[img]*)(\s+in\s|\s*@boundary_\d+_as_(preoperator|operator|aftoperator|comments)::|\s*[\r\n]|(\s*[\$\w])|\s*[^\$\w]|\s*$)/,
            '`': /(\s*@\d+L\d+P\d+O*\d*:::\s*)?(`[^`]*`)(\s+in\s|\s*@boundary_\d+_as_(preoperator|operator|aftoperator|comments)::|\s*[\r\n]|(\s*[\$\w])|\s*[^\$\w]|\s*$)/,
            '"': /(\s*@\d+L\d+P\d+O*\d*:::\s*)?("[^\"\r\n]*")(\s+in\s|\s*@boundary_\d+_as_(preoperator|operator|aftoperator|comments)::|\s*[\r\n]|(\s*[\$\w])|\s*[^\$\w]|\s*$)/,
            "'": /(\s*@\d+L\d+P\d+O*\d*:::\s*)?('[^\'\r\n]*')(\s+in\s|\s*@boundary_\d+_as_(preoperator|operator|aftoperator|comments)::|\s*[\r\n]|\s*([\$\w])|\s*[^\$\w]|\s*$)/
        },
        index: /(\d+)_as_([a-z]+)/,
        index3: /^_(\d+)_as_([a-z]+)___([\s\S]*)$/,
        extends: /(ns|nsassign|global|globalassign|extends)\s+(\.)?([\$\w\.]+)\s*\{([^\{\}]*?)\}/,
        class: /(class|dec|expands)\s+(\.)?([\$\w\.]+\s+)?(extends\s+([\$\w\.]+)\s*)?\{([^\{\}]*?)\}/,
        fnlike: /(^|(var|public|let|function|def)\s+)?([\$\w]*)\s*\(([^\(\)]*)\)\s*\{([^\{\}]*?)\}/,
        call: /([\$\w][\$\w\.]*)\s*___boundary_[A-Z0-9_]{36}_(\d+)_as_parentheses___/,
        arrowfn: /(___boundary_[A-Z0-9_]{36}_(\d+)_as_parentheses___)\s*(->|=>)\s*([^,;\r\n]+)/,
        objectattr: /^\s*(@\d+L\d+P\d+O?\d*:::)?((([\$\w]+)))\s*(\:*)([\s\S]*)$/,
        classelement: /^\s*(@\d+L\d+P\d+O?\d*:::)?((public|static|set|get|om)\s+)?([\$\w]*)\s*(\=*)([\s\S]*)$/,
        travelargs: /^((@\d+L\d+P\d+O*\d*:::)?[\$a-zA-Z_][\$\w\.-]+)\s+as\s(@\d+L\d+P\d+O*\d*:::)([\$\w]+)(\s*,((@\d+L\d+P\d+O*\d*:::)([\$\w]*)))?/
    }, boundaryMaker = function () {
        var radix = 36;
        var uid = new Array(36);
        for (var i = 0; i < 36; i++) {
            uid[i] = zero2z[Math.floor(Math.random() * radix)];
        }
        uid[8] = uid[13] = uid[18] = uid[23] = '_';
        return uid.join('');
    }, stringRepeat = function (string, number) {
        return new Array(number + 1).join(string);
    };
    var Sugar = /** @class */ (function () {
        function Sugar(input, source, toES6, run) {
            if (source === void 0) { source = ''; }
            if (toES6 === void 0) { toES6 = false; }
            if (run === void 0) { run = false; }
            this.isMainBlock = true;
            this.namespace = '';
            this.stringReplaceTimes = 65536;
            this.positions = [];
            this.imports = [];
            this.using_as = {};
            this.ast = {};
            this.configinfo = '{}';
            this.toES6 = false;
            this.posimap = [];
            this.sources = [];
            this.tess = {};
            this.closurecount = 0;
            this.uid = boundaryMaker();
            this.markPattern = new RegExp('@boundary_(\\\d+)_as_(mark)::', 'g');
            this.trimPattern = new RegExp('(___boundary_' + this.uid + '_(\\\d+)_as_(string|pattern|template)___|___boundary_(\\\d+)_as_propname___)', 'g');
            this.lastPattern = new RegExp('(___boundary_' + this.uid + '_(\\\d+)_as_(string|pattern|template)___|___boundary_(\\\d+)_as_propname___|@boundary_(\\\d+)_as_(preoperator|operator|aftoperator|comments)::)', 'g');
            this.input = input;
            this.output = undefined;
            this.replacements = [['{}'], ['/='], ['/'], [' +'], [' -'], [' === ']];
            this.mappings = [];
            if (toES6) {
                this.toES6 = true;
            }
            if (source) {
                this.sources.push({
                    id: 0,
                    src: source
                });
                this.sources[source] = true;
            }
            if (run) {
                this.run();
            }
        }
        Sugar.prototype.compile = function () {
            // console.log(this.input);
            var newcontent = this.markPosition(this.input, 0);
            var string = this.encode(newcontent);
            var vars = {
                namespace: this.namespace,
                parent: {
                    body: null,
                    fixed: ['window'],
                    fix_map: {}
                },
                body: {
                    public: []
                },
                self: {
                    this: 'var',
                    arguments: 'var'
                },
                fixed: [],
                fix_map: {},
                type: 'block'
            };
            this.buildAST(this.pickReplacePosis(this.getLines(string, vars), vars), vars);
            // this.output = 'console.log("Hello, world!");';
            this.generate();
            // console.log(this.replacements);
            return this;
        };
        Sugar.prototype.error = function (str) {
            throw 'tangram.js sugar Error: ' + str;
        };
        Sugar.prototype.markPosition = function (string, sourceid) {
            if (sourceid === void 0) { sourceid = 0; }
            var lines = string.split(/\r{0,1}\n/);
            // console.log(lines);
            var positions = [];
            for (var l = 0; l < lines.length; l++) {
                var elements = lines[l].split(/(,|;|\{|\[|\(|\}|\sas\s|->|=>)/);
                // console.log(elements);
                var newline = [];
                for (var c = 0, length_1 = 0; c < elements.length; c++) {
                    var element = elements[c];
                    if (c === 0) {
                        length_1 = 0;
                    }
                    if (element === ',' || element === ';' || element === '{' || element === '[' || element === '(' || element === '}' || element === ' as ' || element === '->' || element === '=>') {
                        newline.push(element);
                    }
                    else {
                        newline.push('@' + sourceid + 'L' + l + 'P' + length_1 + ':::' + element);
                    }
                    length_1 += element.length;
                }
                positions.push(newline);
            }
            var newlines = positions.map(function (line) {
                return line.join("");
            });
            this.positions.push(positions);
            // console.log(newlines.join("\r\n"));
            return newlines.join("\r\n");
        };
        Sugar.prototype.tidyPosition = function (string) {
            var on = true;
            while (on) {
                on = false;
                string = string.replace(/(@\d+L\d+P\d+O?\d*:::\s*)+(@\d+L\d+P0:::)/g, function (match, last, newline) {
                    // console.log(match);
                    on = true;
                    return "\r\n" + newline;
                });
            }
            on = true;
            while (on) {
                on = false;
                string = string.replace(/[\r\n]*(@\d+L\d+P)0:::(\s+)/g, function (match, pre, space) {
                    // console.log(pre, space);
                    on = true;
                    return "\r\n" + pre + space.length + 'O0:::';
                });
            }
            on = true;
            while (on) {
                on = false;
                string = string.replace(/(@\d+L\d+P)(\d+):::(\s+)/g, function (match, pre, num, space) {
                    // console.log(pre, num, space);
                    on = true;
                    return pre + (parseInt(num) + space.length) + 'O' + num + ':::';
                });
            }
            on = true;
            while (on) {
                on = false;
                string = string.replace(/(\{|\[|\(|\)|\]|\})\s*@\d+L\d+P\d+O?\d*:::\s*(\)|\]|\})/g, function (match, before, atfer) {
                    // console.log(match);
                    on = true;
                    return before + atfer;
                });
            }
            on = true;
            while (on) {
                on = false;
                string = string.replace(/(@\d+L\d+P\d+O?\d*:::\s*)+(\)|\]|\})/g, function (match, posi, panbrackets) {
                    // console.log(match);
                    on = true;
                    return panbrackets;
                });
            }
            on = true;
            while (on) {
                on = false;
                string = string.replace(/(\s*@\d+L\d+P\d+O?\d*:::)+(,|;)/g, function (match, posi, panstop) {
                    // console.log(match);
                    on = true;
                    return panstop;
                });
            }
            return string;
        };
        Sugar.prototype.encode = function (string) {
            var _this = this;
            // console.log(string);
            string = string
                .replace(replaceExpRegPattern.await, function (match, gaps, preline, posi, gap) {
                _this.isMainBlock = false;
                if (gaps) {
                    _this.maintag_posi = posi;
                    if (!!gap) {
                        _this.maintag_posi += 'O' + gap.length;
                    }
                }
                else {
                    _this.maintag_posi = '@0L0P0';
                }
                // console.log(gaps, preline, posi, !!gap, gap.length);
                // console.log('This is not a main block.', this.maintag_posi);
                return '';
            })
                .replace(replaceExpRegPattern.namespace, function (match, posi, at, gap, namespace) {
                if (_this.namespace === '') {
                    _this.namespace += namespace + '.';
                    _this.namespace_posi = at;
                    if (gap) {
                        _this.namespace_posi += 'O' + gap.length;
                    }
                    // console.log('namespace:' + namespace, this.namespace_posi);
                }
                return '';
            });
            // console.log(string);
            string = this.replaceUsing(string);
            // console.log(string);
            string = this.replaceStrings(string);
            string = this.replaceIncludes(string);
            // console.log(string);
            string = this.tidyPosition(string);
            // console.log(string);
            string = string.replace(/(@\d+L\d+P\d+O?\d*:::)?((public|static|set|get|om)\s+)?___boundary_[A-Z0-9_]{36}_(\d+)_as_string___\s*(\:|\(|\=)/g, function (match, posi, desc, type, index, after) {
                // console.log(posi, desc, this.replacements[index][1]);
                if (_this.replacements[index][1]) {
                    return /*"\r\n" + */ _this.replacements[index][1] + '___boundary_' + index + '_as_propname___' + after;
                }
                if (desc) {
                    return /*"\r\n" + */ posi + desc + '___boundary_' + index + '_as_propname___' + after;
                }
                return /*"\r\n" + */ '___boundary_' + index + '_as_propname___' + after;
            });
            string = string
                .replace(/([\$\w]+)\s*(->|=>)/g, "($1)$2");
            // console.log(string);
            // console.log(this.replacements);
            string = this.replaceBrackets(string);
            // console.log(string);
            string = this.replaceBraces(string);
            // console.log(string);
            string = this.replaceParentheses(string);
            // console.log(string);
            string = string
                .replace(/@\d+L\d+P\d+O?\d*:::(___boundary_|$)/g, "$1")
                .replace(/@\d+L\d+P\d+O?\d*:::(___boundary_|$)/g, "$1")
                .replace(/\s*(,|;)\s*/g, "$1\r\n");
            // console.log(string);
            // console.log(this.replacements);
            return string;
        };
        Sugar.prototype.replaceUsing = function (string) {
            var _this = this;
            return string.replace(replaceExpRegPattern.use, function (match, posi, url, as, alias, variables, posimembers, members) {
                // console.log(arguments);
                // console.log(match, ':', posi, url, as, alias);
                var index = _this.replacements.length;
                if (members) {
                    // console.log(members);
                    // url = url.replace(array, '[]');
                    _this.replacements.push([url, members, posi]);
                    return '___boundary_' + _this.uid + '_' + index + '_as_usings___;';
                }
                _this.replacements.push([url, variables, posi]);
                return '___boundary_' + _this.uid + '_' + index + '_as_using___;';
            });
        };
        Sugar.prototype.replaceStrings = function (string, ignoreComments) {
            var _this = this;
            if (ignoreComments === void 0) { ignoreComments = false; }
            string = string.replace(/\\+(`|")/g, function (match) {
                var index = _this.replacements.length;
                _this.replacements.push([match]);
                return '@boundary_' + index + '_as_mark::';
            }).replace(/\\[^\r\n](@\d+L\d+P\d+O?\d*:::)*/g, function (match) {
                var index = _this.replacements.length;
                _this.replacements.push([match]);
                return '@boundary_' + index + '_as_mark::';
            });
            // console.log(string);
            var count = 0;
            var matches = string.match(matchExpRegPattern.string);
            var _loop_1 = function () {
                count++;
                // console.log(count, matches );
                // console.log(matches);
                var index_1 = this_1.replacements.length;
                switch (matches[1]) {
                    case '#':
                        string = string.replace(/(\S*)\s*\#.+/, "$1");
                        matches = string.match(matchExpRegPattern.string);
                        return "continue";
                    case '/':
                        switch (matches[2]) {
                            case '*':
                                if (ignoreComments) {
                                    // console.log(true);
                                    string = string.replace(/\/\*{1,2}[\s\S]*?(\*\/|$)/, function (match) {
                                        _this.replacements.push([match]);
                                        return '@boundary_' + index_1 + '_as_comments::';
                                    });
                                }
                                else {
                                    string = string.replace(/\/\*{1,2}[\s\S]*?(\*\/|$)/, "");
                                }
                                matches = string.match(matchExpRegPattern.string);
                                return "continue";
                            case '/':
                                string = string.replace(/(\S*)\s*\/\/.*/, "$1");
                                matches = string.match(matchExpRegPattern.string);
                                return "continue";
                            case '=':
                                string = string.replace(matches[0], '@boundary_1_as_operator::');
                                matches = string.match(matchExpRegPattern.string);
                                return "continue";
                        }
                        break;
                }
                var match = string.match(matchExpRegPattern.strings[matches[1]]);
                if (match && (matches.index >= match.index) && !match[5]) {
                    // console.log(matches, match);
                    if (match[1]) {
                        this_1.replacements.push([match[2].replace(/@\d+L\d+P\d+O?\d*:::/g, ''), match[1].trim(), match[4]]);
                    }
                    else {
                        this_1.replacements.push([match[2].replace(/@\d+L\d+P\d+O?\d*:::/g, ''), void 0, match[4]]);
                    }
                    string = string.replace(match[0], '___boundary_' + this_1.uid + '_' + index_1 + stringas[matches[1]] + match[3]);
                }
                else if (matches[0] === '/') {
                    string = string.replace(matches[0], '@boundary_2_as_operator::');
                }
                else {
                    // console.log(string, matches, match);
                    // console.log(matches, match);
                    this_1.error('Unexpected `' + matches[1] + '` in `' + this_1.decode(string.substr(matches.index, 256)) + '`');
                }
                matches = string.match(matchExpRegPattern.string);
            };
            var this_1 = this;
            while ((count < this.stringReplaceTimes) && matches) {
                _loop_1();
            }
            // console.log(string);
            // console.log(this.replacements);
            return string;
        };
        Sugar.prototype.replaceIncludes = function (string) {
            var _this = this;
            if (this.sources.length) {
                var on_1 = true;
                var id_1 = this.sources.length - 1;
                while (on_1) {
                    on_1 = false;
                    string = string.replace(replaceExpRegPattern.include, function (match, index) {
                        // console.log(match, this.replacements[index][0]);
                        // console.log(this.sources);
                        // console.log(id, this.sources[id].src);
                        on_1 = true;
                        var str = _this.onReadFile(_this.replacements[index][0].replace(/('|"|`)/g, '').trim(), _this.sources[id_1].src.replace(/[^\/\\]+$/, ''));
                        str = _this.markPosition(str, _this.sources.length - 1);
                        // console.log(str);
                        str = _this.replaceStrings(str);
                        // console.log(str);
                        str = _this.replaceIncludes(str);
                        return str + "\r\n"; //this.onReadFile(match);
                    });
                }
            }
            else {
                var on_2 = true;
                while (on_2) {
                    on_2 = false;
                    string = string.replace(replaceExpRegPattern.include, function (match, index) {
                        // console.log(match);
                        on_2 = true;
                        return _this.onReadFile(_this.replacements[index][0].replace(/('|"|`)/g, '').trim());
                    });
                }
            }
            return string;
        };
        Sugar.prototype.onReadFile = function (match, source) {
            if (source === void 0) { source = void 0; }
            // console.log(match, source);
            return "/* include '" + match + "' not be supported. */\r\n";
        };
        Sugar.prototype.replaceBrackets = function (string) {
            var _this = this;
            var left = string.indexOf('[');
            var right = string.indexOf(']');
            var count = 0;
            while ((count < this.stringReplaceTimes) && (left >= 0)) {
                count++;
                // console.log(left, right);
                if (left < right) {
                    string = string.replace(replaceExpRegPattern.arraylike, function (match, posi, elements) {
                        // console.log(match);
                        elements = _this.replaceBraces(elements);
                        elements = _this.replaceParentheses(elements);
                        var index = _this.replacements.length;
                        _this.replacements.push(['[' + elements + ']', posi && posi.trim()]);
                        return '___boundary_' + _this.uid + '_' + index + '_as_array___';
                    });
                    left = string.indexOf('[');
                    right = string.indexOf(']');
                }
                else {
                    if (right >= 0) {
                        var index = right;
                    }
                    else {
                        var index = left;
                    }
                    this.error('Unexpected `' + (right >= 0 ? ']' : '[') + '` in `' + this.decode(string.substr(index, 256)) + '`');
                }
            }
            if (right >= 0) {
                var index = right;
                this.error('Unexpected `]` in `' + this.decode(string.substr(index, 256)) + '`');
            }
            return string;
        };
        Sugar.prototype.replaceBraces = function (string) {
            var left = string.indexOf('{');
            var right = string.indexOf('}');
            var count = 0;
            while ((count < this.stringReplaceTimes) && (left >= 0)) {
                count++;
                // console.log(left, right);
                if (left < right) {
                    string = this.replaceCodeSegments(string);
                    string = this.recheckFunctionsLike(string);
                    left = string.indexOf('{');
                    right = string.indexOf('}');
                }
                else {
                    if (right >= 0) {
                        var index = right;
                    }
                    else {
                        var index = left;
                    }
                    this.error('Unexpected `' + (right >= 0 ? '}' : '{') + '` in `' + this.decode(string.substr(index, 256)) + '`');
                }
            }
            if (right >= 0) {
                var index = right;
                // console.log(string);
                this.error('Unexpected `}` in `' + this.decode(string.substr(index, 256)) + '`');
            }
            return string;
        };
        Sugar.prototype.replaceCodeSegments = function (string) {
            var _this = this;
            if (string.match(replaceExpRegPattern.class)) {
                return string.replace(replaceExpRegPattern.class, function (match, posi, body) {
                    body = _this.replaceParentheses(body);
                    var index = _this.replacements.length;
                    _this.replacements.push([body, posi && posi.trim()]);
                    return '___boundary_' + _this.uid + '_' + index + '_as_class___';
                });
            }
            if (string.match(replaceExpRegPattern.extends)) {
                return string.replace(replaceExpRegPattern.extends, function (match, posi, body, exp, name, assign, closure) {
                    if (assign) {
                        if (exp === 'extends') {
                            _this.error('Unexpected `extends`: extends ' + name + ' return');
                        }
                        else if (exp === 'global') {
                            body = 'globalassign ' + name + '{' + _this.replaceParentheses(closure) + '}';
                        }
                        else {
                            body = 'nsassign ' + name + '{' + _this.replaceParentheses(closure) + '}';
                        }
                    }
                    else {
                        body = exp.replace('namespace', 'ns') + ' ' + name + '{' + _this.replaceParentheses(closure) + '}';
                    }
                    var index = _this.replacements.length;
                    _this.replacements.push([body, posi && posi.trim()]);
                    return '___boundary_' + _this.uid + '_' + index + '_as_extends___';
                });
            }
            if (string.match(replaceExpRegPattern.fnlike)) {
                return string.replace(replaceExpRegPattern.fnlike, function (match, posi, typewithgap, type, call, closure) {
                    // console.log(match);
                    closure = _this.replaceParentheses(closure);
                    call = _this.replaceOperators(call);
                    match = (typewithgap || '') + call + ' {' + closure + '}';
                    var index = _this.replacements.length;
                    // console.log(match);
                    _this.replacements.push([match, posi && posi.trim()]);
                    return '___boundary_' + _this.uid + '_' + index + '_as_function___';
                });
            }
            return string.replace(replaceExpRegPattern.closure, function (match, word, posi2, posi3, closure) {
                // console.log(match, '|', word, '|', posi2, '|', posi3, '|', closure);
                // if (!word && match.match(/\s*\{\s*\}/)) {
                //     console.log(posi2, '|', posi3);
                //     return '@boundary_0_as_mark::';
                // }
                closure = _this.replaceParentheses(closure);
                // closure = this.replaceOperators(closure, false);
                // console.log(closure);
                if (posi2) {
                    word = word.replace(posi2, '');
                    posi2 = posi2.trim();
                }
                else {
                    posi2 = '';
                }
                if (posi3) {
                    posi3 = posi3.trim();
                }
                else {
                    posi3 = '';
                }
                var index = _this.replacements.length;
                if (word === '@config') {
                    if (_this.configinfo === '{}') {
                        _this.configinfo_posi = posi2 || posi3;
                        _this.configinfo = _this.decode(match.replace('@config', ''));
                    }
                    return '';
                }
                if (word === 'return' || word === 'typeof') {
                    // console.log(true, word);
                    _this.replacements.push(['{' + closure + '}']);
                    // console.log(posi2, posi3);
                    var index2 = _this.replacements.length;
                    _this.replacements.push([word + ' ', posi2]);
                    return '@boundary_' + index2 + '_as_preoperator::___boundary_' + _this.uid + '_' + index + '_as_object___';
                }
                if (word) {
                    if (word === '=') {
                        // console.log(true, word);
                        _this.replacements.push(['{' + closure + '}']);
                        return '= ___boundary_' + _this.uid + '_' + index + '_as_object___';
                    }
                    if (word.indexOf('(') === 0) {
                        // console.log(true, word);
                        _this.replacements.push(['{' + closure + '}']);
                        return word + '___boundary_' + _this.uid + '_' + index + '_as_object___';
                    }
                    // console.log(word, closure);
                    _this.replacements.push(['{' + closure + '}', posi3]);
                    return posi2 + word + posi3 + ' ___boundary_' + _this.uid + '_' + index + '_as_closure___;';
                }
                if ((closure.indexOf(';') >= 0) ||
                    !closure.match(/^\s*(@\d+L\d+P\d+O?\d*:::)?(___boundary_[A-Z0-9_]{36}_\d+_as_function___|[\$\w]+\s*(,|:|$))/) ||
                    closure.match(/^\s*___boundary_[A-Z0-9_]{36}_\d+_as_function___\s*$/)) {
                    _this.replacements.push(['{' + closure + '}', posi3]);
                    return posi2 + (word || '') + posi3 + ' ___boundary_' + _this.uid + '_' + index + '_as_closure___';
                }
                // console.log(closure);
                // console.log(word, '|', posi2, '|', posi3);
                _this.replacements.push(['{' + closure + '}', posi3]);
                return '___boundary_' + _this.uid + '_' + index + '_as_object___';
            });
        };
        Sugar.prototype.replaceParentheses = function (string) {
            var _this = this;
            string = this.replaceWords(string);
            var left = string.indexOf('(');
            var right = string.indexOf(')');
            var count = 0;
            while ((count < this.stringReplaceTimes) && (left >= 0)) {
                count++;
                // console.log(left, right);
                if (left < right) {
                    string = string.replace(replaceExpRegPattern.parentheses, function (match, posi, paramslike) {
                        paramslike = _this.replaceOperators(paramslike);
                        paramslike = _this.replaceCalls(paramslike);
                        paramslike = _this.replaceArrowFunctions(paramslike);
                        var index = _this.replacements.length;
                        _this.replacements.push(['(' + paramslike + ')', posi && posi.trim()]);
                        return '___boundary_' + _this.uid + '_' + index + '_as_parentheses___';
                    });
                    // console.log(string);
                    string = this.recheckFunctionsLike(string);
                    left = string.indexOf('(');
                    right = string.indexOf(')');
                }
                else {
                    if (right >= 0) {
                        var index = right;
                    }
                    else {
                        var index = left;
                    }
                    // console.log(string);
                    this.error('Unexpected `' + (right >= 0 ? ')' : '(') + '` in `' + this.decode(string.substr(index, 256)) + '`');
                }
            }
            if (right >= 0) {
                var index = right;
                this.error('Unexpected `)` in `' + this.decode(string.substr(index, 256)) + '`');
            }
            string = this.replaceOperators(string);
            string = this.replaceCalls(string);
            string = this.replaceArrowFunctions(string);
            return string;
        };
        Sugar.prototype.replaceWords = function (string) {
            var _this = this;
            // console.log(string);
            return string.replace(replaceWords, function (match, posi, word, after) {
                var index = _this.replacements.length;
                // console.log(word, after);
                if (after === ';') {
                    _this.replacements.push([word, posi && posi.trim()]);
                    return ';@boundary_' + index + '_as_preoperator::;';
                }
                _this.replacements.push([word + ' ', posi && posi.trim()]);
                return ';@boundary_' + index + '_as_preoperator::' + after;
            });
        };
        Sugar.prototype.recheckFunctionsLike = function (string) {
            var _this = this;
            var on = true;
            while (on) {
                on = false;
                // console.log(string);
                string = string.replace(replaceExpRegPattern.expression, function (match, posi, expname, exp, expindex, closure, closureindex) {
                    // console.log(match, posi, expname, exp, expindex, closure, closureindex);
                    // console.log(expindex, closureindex);
                    on = true;
                    var expressioncontent = _this.replacements[expindex][0];
                    var body = _this.replacements[closureindex][0];
                    var index = _this.replacements.length;
                    // console.log(index, match, expname + '(' + expressioncontent + ')' + body);
                    // console.log(expressioncontent, body);
                    _this.replacements.push([expname + expressioncontent + body, posi]);
                    return '___boundary_' + _this.uid + '_' + index + '_as_expression___';
                });
            }
            return string;
        };
        Sugar.prototype.replaceOperators = function (string) {
            var _this = this;
            var on = true;
            while (on) {
                on = false;
                string = string.replace(operators.owords, function (match, word) {
                    // console.log(match);
                    on = true;
                    var index = _this.replacements.length;
                    _this.replacements.push([' ' + word + ' ']);
                    return '@boundary_' + index + '_as_operator::';
                });
            }
            // console.log(string);
            on = true;
            while (on) {
                on = false;
                string = string.replace(operators.swords, function (match, before, word, right) {
                    // console.log(match, before, word);
                    on = true;
                    var index = _this.replacements.length;
                    if (word === 'instanceof') {
                        // console.log(match, before, word)
                        _this.replacements.push([' ' + word + ' ']);
                        before = before.trim();
                        return before + '@boundary_' + index + '_as_operator::' + right;
                    }
                    else {
                        _this.replacements.push([word + ' ']);
                    }
                    return before + '@boundary_' + index + '_as_preoperator::' + right;
                });
            }
            on = true;
            while (on) {
                // console.log(string);
                on = false;
                string = string.replace(operators.mixed, function (match, left, posi, op, right, sign) {
                    // console.log(string);
                    // console.log(match, left, op, right, sign);
                    on = true;
                    if (sign) {
                        var _index = sign === '+' ? 3 : 4;
                        right = right.replace(sign, '@boundary_' + _index + '_as_preoperator::');
                    }
                    var index = _this.replacements.length;
                    _this.replacements.push([' ' + op + '= ', posi]);
                    return left + '@boundary_' + index + '_as_operator::' + right;
                });
            }
            on = true;
            while (on) {
                on = false;
                string = string.replace(operators.bool, function (match, left, posi, op, right, sign) {
                    // console.log(match);
                    on = true;
                    if (sign) {
                        var _index = sign === '+' ? 3 : 4;
                        right = right.replace(sign, '@boundary_' + _index + '_as_preoperator::');
                    }
                    var index = _this.replacements.length;
                    _this.replacements.push([' ' + op + ' ', posi]);
                    return left + '@boundary_' + index + '_as_operator::' + right;
                });
            }
            on = true;
            while (on) {
                on = false;
                // console.log(string);
                string = string.replace(operators.op, function (match, left, posi, op, right, sign) {
                    // console.log(match);
                    on = true;
                    if (sign) {
                        var _index = sign === '+' ? 3 : 4;
                        right = right.replace(sign, '@boundary_' + _index + '_as_preoperator::');
                    }
                    var index = _this.replacements.length;
                    _this.replacements.push([' ' + op + ' ', posi]);
                    // console.log(left + '@boundary_' + index + '_as_operator::' + right);
                    return left + '@boundary_' + index + '_as_operator::' + right;
                });
            }
            on = true;
            while (on) {
                on = false;
                string = string.replace(operators.sign, function (match, before, sign, number) {
                    on = true;
                    // let index = this.replacements.length;
                    // this.replacements.push(' ' + sign);
                    var index = sign === '+' ? 3 : 4;
                    return before + '@boundary_' + index + '_as_preoperator::' + number;
                });
            }
            on = true;
            while (on) {
                on = false;
                string = string.replace(operators.before, function (match, op, number) {
                    on = true;
                    var index = _this.replacements.length;
                    _this.replacements.push([op]);
                    return '@boundary_' + index + '_as_preoperator::' + number;
                });
            }
            on = true;
            while (on) {
                on = false;
                string = string.replace(operators.after, function (match, number, op) {
                    on = true;
                    var index = _this.replacements.length;
                    _this.replacements.push([op]);
                    return number + '@boundary_' + index + '_as_aftoperator::';
                });
            }
            return string.replace(operators.error, function (match, before, op, after) {
                // console.log(string, match);
                if (after && after.indexOf('>') === 0) {
                    return match;
                }
                _this.error('Unexpected `' + op + '` in `' + _this.decode(match) + '`');
                return '';
            });
        };
        Sugar.prototype.replaceCalls = function (string) {
            var _this = this;
            // console.log(string);
            string = string.replace(replaceExpRegPattern.log, function (match, params) {
                console.log(match, params);
                var index1 = _this.replacements.length;
                _this.replacements.push(['(' + params + ')', undefined]);
                var index2 = _this.replacements.length;
                _this.replacements.push(['log___boundary_' + _this.uid + '_' + index1 + '_as_parentheses___', undefined]);
                var index3 = _this.replacements.length;
                _this.replacements.push(['.___boundary_' + _this.uid + '_' + index2 + '_as_callmethod___', undefined]);
                return 'root.console___boundary_' + _this.uid + '_' + index3 + '_as_callschain___;';
            });
            return this.replaceCallsChain(string.replace(replaceExpRegPattern.call, function (match, posi, fullname, constructor, methodname, dot, callname, args, argindex, after) {
                // console.log(fullname);
                if (fullname.match(/^___boundary_[A-Z0-9_]{36}_\d+_as_(if|class|object|closure)___/)) {
                    return match;
                }
                var index = _this.replacements.length;
                if (constructor) {
                    _this.replacements.push([fullname + args, posi && posi.trim()]);
                    return '___boundary_' + _this.uid + '_' + index + '_as_construct___' + after;
                }
                else {
                    _this.replacements.push([callname + args, posi && posi.trim()]);
                    if (dot) {
                        return '.___boundary_' + _this.uid + '_' + index + '_as_callmethod___' + after;
                    }
                    else if (callname === 'if') {
                        return '___boundary_' + _this.uid + '_' + index + '_as_if___' + after;
                    }
                    return '___boundary_' + _this.uid + '_' + index + '_as_call___' + after;
                }
            }));
        };
        Sugar.prototype.replaceCallsChain = function (string) {
            var _this = this;
            // console.log(string);
            return string.replace(replaceExpRegPattern.callschain, function (match, _index) {
                var index = _this.replacements.length;
                _this.replacements.push([match, _this.replacements[_index][1]]);
                return '___boundary_' + _this.uid + '_' + index + '_as_callschain___';
            });
        };
        Sugar.prototype.replaceArrowFunctions = function (string) {
            var _this = this;
            var arrow = string.match(/(->|=>)/);
            // console.log(arrow);
            if (arrow) {
                if (string.match(replaceExpRegPattern.arrowfn)) {
                    // console.log(string.match(matchExpRegPattern.arrowfn));
                    return string.replace(replaceExpRegPattern.arrowfn, function (match, params, paramsindex, arrow, body, end) {
                        // console.log(match, params, paramsindex, arrow, body, end);
                        // console.log(body);
                        var posi = _this.replacements[paramsindex][1];
                        // console.log(match);
                        // console.log(body);
                        var matches = body.match(/^(@\d+L\d+P\d+O*\d*:::)?\s*___boundary_[A-Z0-9_]{36}_(\d+)_as_(parentheses|object|closure)___\s*$/);
                        // console.log(matches);
                        if (matches) {
                            var code = _this.replacements[matches[2]][0];
                            var posi_1 = _this.replacements[matches[2]][1];
                            if (matches[3] === 'parentheses') {
                                body = code.replace(/^\(\s*(.*?)\s*\)$/, function (match, code) {
                                    var index = _this.replacements.length;
                                    _this.replacements.push(['return ', posi_1]);
                                    return '@boundary_' + index + '_as_preoperator:: ' + code;
                                });
                            }
                            else {
                                // console.log(code);
                                body = code.replace(/(^\{|\}$)/g, '');
                            }
                        }
                        else {
                            var index_2 = _this.replacements.length;
                            _this.replacements.push(['return ', void 0]);
                            body = '@boundary_' + index_2 + '_as_preoperator:: ' + body;
                            // console.log(body);
                        }
                        var index = _this.replacements.length;
                        _this.replacements.push([params + arrow + body, posi]);
                        return '___boundary_' + _this.uid + '_' + index + '_as_arrowfn___' + end;
                    });
                }
                else {
                    // console.log(string);
                    this.error('Unexpected `' + arrow[0] + '` in `' + this.decode(string.substr(arrow.index, 256)) + '`');
                }
            }
            return string;
        };
        Sugar.prototype.getPosition = function (string) {
            if (string) {
                // console.log(string);
                var match = string.match(/@(\d+)L(\d+)P(\d+)(O*)(\d*):*/);
                if (match) {
                    if (match[4]) {
                        var index = parseInt(match[5]);
                    }
                    else {
                        var index = parseInt(match[3]);
                    }
                    return {
                        match: match[0],
                        head: !index,
                        file: parseInt(match[1]),
                        line: parseInt(match[2]) + 1,
                        col: parseInt(match[3]) + 1,
                        o: [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), index],
                    };
                }
            }
            return void 0;
        };
        Sugar.prototype.getLines = function (string, vars) {
            // console.log(string);
            string = string
                .replace(/:::(var|let|public)\s+(@\d+L\d+P(\d+O)?0:::)/g, ':::$1 ')
                .replace(/([^,;\s])\s*(@\d+L\d+P(\d+O)?0:::[^\.\(\[)])/g, '$1;$2')
                .replace(/[\r\n]+(___boundary_[A-Z0-9_]{36}_\d+_as_(if|class|function|extends|call|object|closure|parentheses)___)/g, ";$1")
                .replace(/(___boundary_[A-Z0-9_]{36}_\d+_as_(if)___)[;\s]+/g, "$1 ");
            var sentences = string.split(/\s*;+\s*/);
            var lines = [];
            // console.log(string, sentences);
            for (var s = 0; s < sentences.length; s++) {
                var sentence = sentences[s].trim();
                // console.log(sentence);
                if (sentence) {
                    var array = sentence.split(/:::(var|let|public)\s+/);
                    // console.log(array, sentence);
                    // continue;
                    // if(1)var a =2;
                    if (array.length === 1) {
                        var definition = sentence.match(/(^|\s+)(var|let|public)(\s+|$)/);
                        if (definition) {
                            var definitions = sentence.match(/(@boundary_(\d+)_as_preoperator::|___boundary_[A-Z0-9_]{36}_\d+_as_(if|closure)___)\s*(var|let|public)\s+([\s\S]+)/);
                            if (definitions) {
                                if (!definitions[2] || this.replacements[definitions[2]][0] === 'else ') {
                                    this.pushSentenceToLines(lines, definitions[1], 'inline');
                                    var clauses = definitions[5].split(/,\s*(@\d+L\d+P\d+O?\d*:::)/);
                                    clauses.unshift(undefined);
                                    // console.log(definitions[5], clauses);
                                    for (var c = 0; c < clauses.length; c += 2) {
                                        if (c) {
                                            _symbol = '';
                                        }
                                        else {
                                            if (this.toES6 && definitions[4] !== 'public') {
                                                var _symbol = definitions[4];
                                            }
                                            else {
                                                var _symbol = 'var';
                                            }
                                        }
                                        if (c === clauses.length - 2) {
                                            var endmark = ';';
                                        }
                                        else {
                                            var endmark = ',';
                                        }
                                        this.pushVariablesToLine(lines, vars, clauses[c + 1], definitions[4], clauses[c], 'inline', _symbol, endmark);
                                    }
                                    continue;
                                }
                            }
                            // console.log(sentence);
                            this.error('Unexpected `' + definition[1] + '` in `' + this.decode(sentence) + '`.');
                        }
                        else {
                            // console.log(sentence);
                            this.pushSentenceToLines(lines, sentence, 'block');
                        }
                    }
                    else if (array.length === 3) {
                        var clauses = array[2].split(/,\s*(@\d+L\d+P\d+O?\d*:::)/);
                        clauses.unshift(array[0]);
                        // console.log(array, clauses);
                        for (var c = 0; c < clauses.length; c += 2) {
                            this.pushVariablesToLines(lines, vars, clauses[c], clauses[c + 1], array[1]);
                        }
                        // console.log(spilitarray, sentences);
                    }
                    else {
                        // console.log(spilitarray[3], spilitarray);
                        var position = this.getPosition(array[2]);
                        this.error('Unexpected `' + array[3] + '` at char ' + position.col + ' on line ' + position.line + '， near ' + this.decode(array[2]) + '.');
                    }
                }
            }
            // console.log(lines);
            return lines;
        };
        Sugar.prototype.pushSentenceToLines = function (lines, code, display) {
            value = code.trim();
            if (value && !value.match(/^@\d+L\d+P\d+O?\d*:::$/)) {
                var match_as_statement = value.match(/^___boundary_[A-Z0-9_]{36}_(\d+)_as_([a-z]+)___([\r\n]+|$)/);
                if (match_as_statement) {
                    if (display === 'block' && !['class', 'function', 'closure', 'if']['includes'](match_as_statement[2])) {
                        // console.log(match_as_statement[2]);
                        value = value + ';';
                    }
                    // console.log(this.replacements[match_as_statement[1]]);
                    lines.push({
                        type: 'line',
                        subtype: match_as_statement[2],
                        posi: this.replacements[match_as_statement[1]][1],
                        display: display,
                        index: match_as_statement[1],
                        value: value
                    });
                }
                else {
                    // console.log(value, display === 'block');
                    if ((display === 'block') && !/_as_closure___$/.test(value)) {
                        value += ';';
                    }
                    else if (/_as_aftoperator::$/.test(value)) {
                        value += ';';
                        display === 'block';
                    }
                    // console.log(value);
                    var clauses = value.split(',');
                    // console.log(clauses);
                    for (var c = 0; c < clauses.length; c++) {
                        var element = clauses[c];
                        var position = this.getPosition(element);
                        // console.log(position, value)
                        if (position) {
                            if (display === 'block') {
                                position.head = true;
                            }
                            var value = element.replace(position.match, '');
                        }
                        else {
                            var value = element.trim();
                            var match_as_mark = value.match(/^@boundary_(\d+)_as_([a-z]+)::/);
                            if (match_as_mark && this.replacements[match_as_mark[1]][1]) {
                                position = this.getPosition(this.replacements[match_as_mark[1]][1]);
                                if (position && (display === 'block')) {
                                    position.head = true;
                                }
                            }
                        }
                        // if (display === 'block') {
                        //     value = value + ';';
                        // }
                        lines.push({
                            type: 'line',
                            subtype: 'sentence',
                            display: display,
                            posi: position,
                            value: value
                        });
                    }
                }
            }
        };
        Sugar.prototype.pushVariablesToLines = function (lines, vars, posi, code, symbol) {
            if (code) {
                if (this.toES6 && symbol !== 'public') {
                    var _symbol = symbol;
                }
                else {
                    var _symbol = 'var';
                }
                this.pushVariablesToLine(lines, vars, code, symbol, posi, 'block', _symbol, ';');
            }
        };
        Sugar.prototype.pushVariablesToLine = function (lines, vars, code, symbol, posi, display, _symbol, endmark) {
            if (posi === void 0) { posi = ''; }
            if (display === void 0) { display = 'inline'; }
            if (_symbol === void 0) { _symbol = ''; }
            if (endmark === void 0) { endmark = ','; }
            if (code) {
                var position = this.getPosition(posi);
                var array = code.split(/\s*=\s*/);
                // console.log(array);
                if (array.length === 1) {
                    var value = 'void 0';
                }
                else {
                    var value = array.pop();
                }
                for (var index_3 = 0; index_3 < array.length; index_3++) {
                    var element = array[index_3].trim();
                    if (element.match(/^[\$\w]+$/)) {
                        // console.log(element);                    
                        if (position && display === 'block')
                            position.head = true;
                        if (index_3) {
                            lines.push({
                                type: 'line',
                                subtype: 'assignment',
                                posi: position,
                                display: display,
                                value: element + ' = ' + value + endmark
                            });
                        }
                        else {
                            if (vars.self[element] === void 0) {
                                vars.self[element] = symbol;
                                if (symbol === 'public') {
                                    vars.body.public.push(element);
                                }
                            }
                            else if (vars.self[element] === 'let' || symbol === 'let') {
                                this.error(' Variable `' + element + '` has already been declared at char ' + position.col + ' on line ' + position.line + '.');
                            }
                            lines.push({
                                type: 'line',
                                subtype: 'variable',
                                display: 'inline',
                                posi: position,
                                value: _symbol + ' ' + element + ' = '
                            });
                            lines.push({
                                type: 'line',
                                subtype: 'sentence',
                                display: 'inline',
                                posi: void 0,
                                value: value + endmark
                            });
                        }
                        value = element;
                    }
                    else {
                        // console.log(element);
                        this.error('Unexpected Definition `' + symbol + '` at char ' + position.col + ' on line ' + position.line + ' in file [' + position.file + '][' + this.sources[position.file].src + '].');
                    }
                }
            }
        };
        Sugar.prototype.pickReplacePosis = function (lines, vars) {
            var imports = [], using_as = {}, preast = [];
            for (var index_4 = 0; index_4 < lines.length; index_4++) {
                // console.log(lines[index]);
                switch (lines[index_4].subtype) {
                    case 'sentence':
                        // console.log(lines[index]);
                        var code = lines[index_4].value.trim();
                        if (code) {
                            var inline = [];
                            var statements = code.split('___boundary_' + this.uid);
                            while (!statements[0].trim()) {
                                statements.shift();
                            }
                            // console.log(statements)
                            for (var s = 0; s < statements.length; s++) {
                                var statement = statements[s];
                                if (statement.trim()) {
                                    var match_as_statement = statement.match(matchExpRegPattern.index3);
                                    // console.log(match_as_statement);
                                    if (match_as_statement) {
                                        var tret_of_match = match_as_statement[3];
                                        if (tret_of_match.trim() && !(tret_of_match === ';' && ['class', 'function', 'closure', 'if']['includes'](match_as_statement[2]))) {
                                            inline.push({
                                                index: match_as_statement[1],
                                                display: 'inline',
                                                type: match_as_statement[2]
                                            });
                                            var rows = tret_of_match.split(/[\r\n]+/);
                                            for (var r = 0; r < rows.length; r++) {
                                                var row = rows[r];
                                                if (row.trim()) {
                                                    this.pushCodeToAST(inline, vars, row, false, undefined);
                                                }
                                            }
                                        }
                                        else {
                                            // console.log(lines[index].display);
                                            if (statements.length === 1) {
                                                inline.push({
                                                    index: match_as_statement[1],
                                                    display: lines[index_4].display,
                                                    type: match_as_statement[2]
                                                });
                                            }
                                            else {
                                                inline.push({
                                                    index: match_as_statement[1],
                                                    display: 'inline',
                                                    type: match_as_statement[2]
                                                });
                                            }
                                        }
                                    }
                                    else {
                                        if ((statements.length === 1) && (lines[index_4].display === 'block')) {
                                            var isblock = true;
                                        }
                                        else {
                                            var isblock = false;
                                        }
                                        // console.log(array[0], lines[index].posi);
                                        var rows = statements[0].split(/[\r\n]+/);
                                        // console.log(rows, array.length);
                                        for (var r = 0; r < rows.length; r++) {
                                            var row = rows[r];
                                            if (row.trim()) {
                                                this.pushCodeToAST(inline, vars, row, isblock, (r === 0) && lines[index_4].posi);
                                            }
                                        }
                                    }
                                }
                            }
                            preast.push(inline);
                        }
                        break;
                    case 'variable':
                    case 'assignment':
                        preast.push([{
                                type: 'code',
                                posi: lines[index_4].posi,
                                display: lines[index_4].display,
                                vars: vars,
                                value: lines[index_4].value
                            }]);
                        break;
                    case 'using':
                    case 'usings':
                        // console.log(lines[index]);.return
                        var posi = this.replacements[lines[index_4].index][2];
                        var src = this.replacements[lines[index_4].index][0].trim();
                        // let alias = .trim();
                        if (!imports['includes'](src)) {
                            imports.push(src);
                            imports.push(posi);
                        }
                        if (this.replacements[lines[index_4].index][1]) {
                            if (lines[index_4].subtype === 'usings') {
                                var members = this.replacements[lines[index_4].index][1].split(',');
                                for (var m = 0; m < members.length; m++) {
                                    var position = this.getPosition(members[m]);
                                    var alias = members[m].replace(position.match, '').trim();
                                    using_as[alias] = [src, alias, position];
                                }
                                // console.log(this.replacements[lines[index].index][1]);
                            }
                            else {
                                var position = this.getPosition(this.replacements[lines[index_4].index][1]);
                                var alias = this.replacements[lines[index_4].index][1].replace(position.match, '').trim();
                                // console.log(alias);
                                using_as[alias] = [src, '*', position];
                            }
                        }
                        break;
                    default:
                        preast.push([{
                                index: lines[index_4].index,
                                display: lines[index_4].display,
                                type: lines[index_4].subtype
                            }]);
                        break;
                }
            }
            this.imports = imports;
            this.using_as = using_as;
            // console.log(using_as);
            // console.log(imports, preast);
            return preast;
        };
        Sugar.prototype.buildAST = function (preast, vars) {
            // console.log(preast);
            var ast = {
                type: 'codes',
                vars: vars,
                body: []
            };
            for (var index_5 = 0; index_5 < preast.length; index_5++) {
                var block = preast[index_5];
                if (block.length === 1) {
                    var element = block[0];
                    if (element.type === 'code') {
                        ast.body.push(element);
                    }
                    else {
                        ast.body.push(this.walk(element, vars, false));
                    }
                }
                else {
                    var codes = {
                        type: 'codes',
                        vars: vars,
                        body: []
                    };
                    for (var b = 0; b < block.length; b++) {
                        var element = block[b];
                        if (element.type === 'code') {
                            codes.body.push(element);
                        }
                        else {
                            codes.body.push(this.walk(element, vars, true));
                        }
                    }
                    ast.body.push(codes);
                }
            }
            // console.log(ast, this.replacements);
            this.ast = ast;
            return this;
        };
        Sugar.prototype.pushBodyToAST = function (body, vars, code) {
            if (body === void 0) { body = []; }
            var lines = code ? this.getLines(code, vars) : [];
            // console.log(code, lines);
            for (var index_6 = 0; index_6 < lines.length; index_6++) {
                switch (lines[index_6].subtype) {
                    case 'sentence':
                        var line = lines[index_6].value.trim();
                        // console.log(lines[index].display === 'block', line);
                        // console.log(lines[index].display);
                        this.pushSentencesToAST(body, vars, line, lines[index_6].display === 'block', lines[index_6].posi);
                        break;
                    case 'variable':
                        body.push({
                            type: 'code',
                            posi: lines[index_6].posi,
                            display: lines[index_6].display,
                            vars: vars,
                            value: lines[index_6].value
                        });
                        break;
                    default:
                        body.push(this.walk({
                            index: lines[index_6].index,
                            display: 'block',
                            type: lines[index_6].subtype
                        }, vars, false));
                        break;
                }
            }
            return body;
        };
        Sugar.prototype.pushSentencesToAST = function (body, vars, code, isblock, blockposi) {
            if (body === void 0) { body = []; }
            if (isblock === void 0) { isblock = true; }
            if (code) {
                // console.log(isblock, blockposi);
                var inline = [];
                var array = code.split('___boundary_' + this.uid);
                // console.log(array);
                while (array.length && !array[0].trim()) {
                    array.shift();
                }
                // console.log(array);
                if (array.length === 1) {
                    this.pushReplacementsToAST(inline, vars, array[0], isblock, blockposi);
                }
                else {
                    for (var index_7 = 0; index_7 < array.length; index_7++) {
                        this.pushReplacementsToAST(inline, vars, array[index_7], false, (index_7 === 0) && blockposi);
                    }
                }
                if (inline.length === 1) {
                    body.push(inline[0]);
                }
                else {
                    body.push({
                        type: 'codes',
                        vars: vars,
                        body: inline
                    });
                }
            }
            return body;
        };
        Sugar.prototype.pushReplacementsToAST = function (body, vars, code, isblock, blockposi) {
            // console.log(code);
            // code = code.trim();
            if (code.trim()) {
                var match_as_statement = code.match(matchExpRegPattern.index3);
                // console.log(code, match_as_statement, isblock, blockposi);
                if (match_as_statement) {
                    var tret_of_match = match_as_statement[3].trim();
                    // console.log(code, match_as_statement, isblock, blockposi);
                    if (tret_of_match && tret_of_match !== ';') {
                        body.push(this.walk({
                            index: match_as_statement[1],
                            display: 'inline',
                            type: match_as_statement[2]
                        }, vars, true));
                        var rows = tret_of_match.split(/[\r\n]+/);
                        for (var r = 0; r < rows.length; r++) {
                            var row = rows[r];
                            if (row.trim()) {
                                this.pushCodeToAST(body, vars, row, false, undefined);
                            }
                        }
                    }
                    else {
                        body.push(this.walk({
                            index: match_as_statement[1],
                            display: isblock ? 'block' : 'inline',
                            type: match_as_statement[2]
                        }, vars, true));
                    }
                }
                else {
                    var rows = code.split(/[\r\n]+/);
                    // console.log(array);
                    for (var r = 0; r < rows.length; r++) {
                        var row = rows[r];
                        if (row.trim()) {
                            this.pushCodeToAST(body, vars, row, isblock, (r === 0) && blockposi);
                        }
                    }
                }
            }
            return body;
        };
        Sugar.prototype.pushCodeToAST = function (body, vars, code, isblock, blockposi) {
            var display = isblock ? 'block' : 'inline';
            var position = this.getPosition(code) || blockposi;
            if (position) {
                var element = code.replace(position.match, '');
                if (position.head) {
                    if (element.indexOf('.') === 0) {
                        display = 'member';
                    }
                }
            }
            else {
                var element = code;
            }
            // console.log(element, position);
            if (element) {
                body.push({
                    type: 'code',
                    posi: position,
                    vars: vars,
                    display: display,
                    value: element
                });
            }
            return body;
        };
        Sugar.prototype.walk = function (element, vars, inOrder) {
            if (vars === void 0) { vars = false; }
            // console.log(element);
            switch (element.type) {
                case 'array':
                    return this.walkArray(element.index, element.display, vars);
                case 'arrowfn':
                    return this.walkArrowFn(element.index, element.display, vars);
                case 'if':
                // console.log(element);
                case 'call':
                case 'callmethod':
                case 'construct':
                    return this.walkCall(element.index, element.display, vars, element.type);
                case 'callschain':
                    return this.walkCallsChain(element.index, element.display, vars, element.type);
                case 'class':
                    return this.walkClass(element.index, element.display, vars);
                case 'closure':
                    if (inOrder) {
                        console.log(true, element);
                        element.type = 'object';
                        return this.walkObject(element.index, element.display, vars);
                    }
                    return this.walkClosure(element.index, element.display, vars);
                case 'expression':
                    return this.walkFnLike(element.index, element.display, vars, 'exp');
                case 'extends':
                    return this.walkExtends(element.index, element.display, vars);
                case 'function':
                    // console.log(element.index, element.display, vars, 'def');
                    return this.walkFnLike(element.index, element.display, vars, 'def');
                case 'object':
                    return this.walkObject(element.index, element.display, vars);
                case 'parentheses':
                    return this.walkParentheses(element.index, element.display, vars);
                case 'pattern':
                case 'string':
                case 'template':
                    var that_1 = this;
                    var position = this.getPosition(this.replacements[element.index][1]);
                    // console.log(position);
                    return {
                        type: 'code',
                        posi: position,
                        display: element.display || 'inline',
                        vars: vars,
                        value: this.replacements[element.index][0].replace(this.markPattern, function () {
                            return that_1.replacements[arguments[1]][0];
                        })
                    };
                default:
                    return {
                        type: 'code',
                        posi: void 0,
                        display: 'hidden',
                        vars: vars,
                        value: ""
                    };
            }
        };
        Sugar.prototype.walkArray = function (index, display, vars) {
            var body = [], position = this.getPosition(this.replacements[index][1]), clauses = this.replacements[index][0].replace(/([\[\s\]])/g, '').split(',');
            // console.log(this.replacements[index], clauses);
            for (var c = 0; c < clauses.length; c++) {
                if (c) {
                    var posi = this.getPosition(clauses[c]);
                }
                else {
                    var posi = this.getPosition(clauses[c]) || position;
                }
                this.pushSentencesToAST(body, vars, clauses[c], false, posi);
            }
            // console.log(body);
            return {
                type: 'array',
                posi: position,
                display: display,
                vars: vars,
                body: body
            };
        };
        Sugar.prototype.walkArrowFn = function (index, display, vars) {
            var matches = this.replacements[index][0].match(matchExpRegPattern.arrowfn);
            // console.log(this.replacements[index], matches);
            var subtype = 'fn';
            var selfvas = {
                this: 'var',
                arguments: 'var'
            };
            if (matches[3] === '=>') {
                subtype = '=>';
                selfvas = {
                    this: 'let',
                    arguments: 'let'
                };
            }
            var localvars = {
                parent: vars,
                self: selfvas,
                fixed: [],
                fix_map: {},
                type: 'fnbody'
            };
            var args = this.checkArgs(this.replacements[matches[2]][0].replace(/(^\(|\)$)/g, ''), localvars);
            return {
                type: 'def',
                posi: this.getPosition(this.replacements[index][1]),
                display: 'inline',
                subtype: subtype,
                args: args.keys,
                defaults: args.vals,
                body: this.checkFnBody(localvars, args, matches[4])
            };
        };
        Sugar.prototype.walkCall = function (index, display, vars, type) {
            // console.log(this.replacements[index]);
            var name = [], params = [], matches = this.replacements[index][0].match(matchExpRegPattern.call), position = this.getPosition(this.replacements[index][1]), nameArr = matches[1].split('___boundary_' + this.uid), paramArr = this.replacements[matches[2]][0].split(/([\(,\)])/);
            // console.log(this.getLines(this.replacements[matches[2]][0], vars));
            // console.log(this.replacements[index], matches);
            for (var n = 0; n < nameArr.length; n++) {
                var element = nameArr[n];
                if (element) {
                    if (type === 'construct') {
                        this.pushReplacementsToAST(name, vars, element, false, undefined);
                    }
                    else {
                        this.pushReplacementsToAST(name, vars, element, false, (n === 0) && position);
                    }
                }
            }
            // console.log(matches, paramArr);
            for (var p = 0; p < paramArr.length; p++) {
                var paramPosi = this.getPosition(paramArr[p]);
                if (paramPosi) {
                    var param = paramArr[p].replace(paramPosi.match, '').trim();
                }
                else {
                    var param = paramArr[p].trim();
                }
                // console.log(paramPosi);
                if (param && param != '(' && param != ')' && param != ',') {
                    // console.log(p, param, paramPosi);
                    var statements = param.split('___boundary_' + this.uid);
                    var inline = [];
                    for (var s = 0; s < statements.length; s++) {
                        this.pushReplacementsToAST(inline, vars, statements[s], false, (s === 0) && paramPosi);
                    }
                    if (inline.length) {
                        params.push({
                            type: 'parameter',
                            posi: inline[0].posi || paramPosi,
                            display: 'inline',
                            vars: vars,
                            body: inline
                        });
                    }
                    else {
                        params.push({
                            type: 'parameter',
                            posi: paramPosi,
                            display: 'inline',
                            vars: vars,
                            body: [{
                                    type: 'code',
                                    posi: paramPosi,
                                    display: 'inline',
                                    vars: vars,
                                    value: 'void 0'
                                }]
                        });
                    }
                }
            }
            if (type === 'callmethod') {
                if (position)
                    position.head = false;
                display = 'inline';
            }
            // console.log(this.replacements[index]);
            return {
                type: type,
                posi: position,
                display: display,
                name: name,
                vars: vars,
                params: params
            };
        };
        Sugar.prototype.walkCallsChain = function (index, display, vars, type) {
            var _this = this;
            var code = this.replacements[index][0], position = this.getPosition(this.replacements[index][1]), calls = [];
            code.replace(/(@\d+L\d+P\d+O*\d*:::)?\.___boundary_[A-Z0-9_]{36}_(\d+)_as_callmethod___/g, function (match, posi, _index) {
                // console.log(match, posi, _index);
                if (posi) {
                    _this.replacements[_index][1] = posi;
                }
                calls.push(_this.walkCall(_index, 'inline', vars, 'callmethod'));
                return '';
            });
            // console.log(code, calls, position);
            return {
                type: 'callschain',
                posi: position,
                display: (position && position.head) ? 'blocks' : 'inline',
                vars: vars,
                calls: calls
            };
        };
        Sugar.prototype.walkClass = function (index, display, vars) {
            if (vars === void 0) { vars = true; }
            // console.log(this.replacements[index]);
            var matches = this.replacements[index][0].match(matchExpRegPattern.class);
            // console.log(matches);
            var type = matches[1];
            if (matches[2]) {
                var subtype = 'stdClass';
            }
            else {
                if (type === 'dec') {
                    var subtype = 'stdClass';
                }
                else {
                    var subtype = 'anonClass';
                }
            }
            var cname = matches[3] && matches[3].trim();
            if (type === 'class') {
                if (subtype === 'anonClass') {
                    if (cname) {
                        if (vars.self[cname] === void 0) {
                            vars.self[cname] = 'var';
                        }
                        else if (vars.self[cname] === 'let') {
                            this.error(' Variable `' + cname + '` has already been declared.');
                        }
                        // vars.self.push('var ' + cname);
                    }
                }
                // 标准类必须是块元素，否则无地方拓展静态属性和方法
            }
            return {
                type: type,
                posi: this.getPosition(this.replacements[index][1]),
                display: display,
                subtype: subtype,
                cname: cname,
                base: matches[5],
                vars: vars,
                body: this.checkClassBody(vars, matches[6] || '')
            };
        };
        Sugar.prototype.walkClosure = function (index, display, vars) {
            // console.log(this.replacements[index]);
            var localvars = {
                parent: vars,
                body: vars.body,
                self: {},
                fixed: [],
                fix_map: {},
                type: 'closure'
            };
            var array = this.replacements[index][0].split(/\s*(\{|\})\s*/);
            var position = this.getPosition(this.replacements[index][1]);
            var body = this.pushBodyToAST([], localvars, array[2]);
            for (var varname in localvars.self) {
                if (localvars.self.hasOwnProperty(varname) && (localvars.self[varname] !== 'let')) {
                    if (vars.self[varname] === void 0) {
                        vars.self[varname] = 'var';
                    }
                }
            }
            // console.log(array);
            return {
                type: 'closure',
                posi: position,
                display: display,
                vars: localvars,
                body: body
            };
        };
        Sugar.prototype.walkExtends = function (index, display, vars) {
            // console.log(this.replacements[index]);
            var matches = this.replacements[index][0].match(matchExpRegPattern.extends);
            var position = this.getPosition(this.replacements[index][1]);
            var subtype = 'ext';
            var objname = matches[3];
            // console.log(matches);
            if ((matches[1] === 'ns') || (matches[1] === 'global')) {
                subtype = matches[1];
                var localvars = {
                    parent: vars,
                    body: {
                        public: []
                    },
                    self: {
                        this: 'var',
                        arguments: 'var'
                    },
                    fixed: [],
                    fix_map: {},
                    type: 'body'
                };
                var body = this.pushBodyToAST([], localvars, matches[4]);
                // console.log(localvars);
                vars = localvars;
            }
            else {
                if ((matches[1] === 'nsassign') || matches[2]) {
                    subtype = 'nsassign';
                }
                else if ((matches[1] === 'globalassign')) {
                    subtype = 'globalassign';
                }
                var body = this.checkObjMember(vars, matches[4]);
            }
            // console.log(matches);
            return {
                type: 'extends',
                posi: position,
                display: display,
                subtype: subtype,
                oname: objname,
                vars: vars,
                body: body
            };
        };
        Sugar.prototype.walkFnLike = function (index, display, vars, type) {
            var _this = this;
            // console.log(index, this.replacements[index]);
            var matches = this.replacements[index][0].match(matchExpRegPattern.fnlike);
            // console.log(matches);
            var fname = matches[3] !== 'function' ? matches[3] : '';
            if (type === 'def' || type === 'exp') {
                if ((type === 'exp') || (matches[1] == null)) {
                    if (reservedWords['includes'](fname)) {
                        var headline = matches[4];
                        var localvars_1 = {
                            parent: vars,
                            body: vars.body,
                            self: {},
                            fixed: [],
                            fix_map: {},
                            type: 'closure'
                        };
                        if (fname === 'for') {
                            // console.log(matches);
                            var firstSentence = headline.split(/\s*;\s*/)[0];
                            var match = firstSentence.match(/^\s*(var|let)\s+([\$\w]+\s*=.+)$/);
                            // console.log(firstSentence, match);
                            if (match) {
                                this.pushVariablesToLines([], localvars_1, '', match[2], match[1]);
                            }
                            // console.log(localvars);
                        }
                        var head = this.pushSentencesToAST([], localvars_1, headline, false, this.getPosition(headline))[0] || (function () {
                            _this.error(' Must have statements in head of ' + fname + ' expreesion.');
                        })();
                        var body = this.pushBodyToAST([], localvars_1, matches[5]);
                        for (var varname in localvars_1.self) {
                            if (localvars_1.self.hasOwnProperty(varname)) {
                                if (vars.self[varname] === void 0) {
                                    vars.self[varname] = 'var';
                                }
                                else if (vars.self[varname] === 'let') {
                                    this.error(' Variable `' + varname + '` has already been declared.');
                                }
                            }
                        }
                        return {
                            type: 'exp',
                            display: 'block',
                            vars: localvars_1,
                            expression: fname,
                            head: head,
                            body: body
                        };
                    }
                    if (fname === 'each') {
                        var condition = matches[4].match(matchExpRegPattern.travelargs);
                        // console.log(matches, condition);
                        if (condition) {
                            var self_1 = {
                                this: 'var',
                                arguments: 'var',
                            }, agrs = [];
                            if (condition[5]) {
                                if (condition[8]) {
                                    self_1[condition[4]] = 'var';
                                    self_1[condition[8]] = 'var';
                                    agrs = [[condition[4], this.getPosition(condition[3])], [condition[8], this.getPosition(condition[7])]];
                                }
                                else {
                                    self_1[condition[4]] = 'var';
                                    agrs = [[condition[4], condition[3]]];
                                }
                            }
                            else {
                                self_1['_index'] = 'var';
                                self_1[condition[4]] = 'var';
                                agrs = [['_index', undefined], [condition[4], this.getPosition(condition[3])]];
                            }
                            var localvars_2 = {
                                parent: vars,
                                body: vars.body,
                                self: self_1,
                                fixed: [],
                                fix_map: {},
                                type: 'travel'
                            };
                            var iterator = this.pushSentencesToAST([], localvars_2, condition[1], false, this.getPosition(condition[2]))[0] || (function () {
                                _this.error(' Must have statements in head of each expreesion.');
                            })();
                            return {
                                type: 'travel',
                                display: 'block',
                                iterator: iterator,
                                vars: localvars_2,
                                callback: {
                                    type: 'def',
                                    display: 'inline',
                                    fname: '',
                                    args: agrs,
                                    body: this.pushBodyToAST([], localvars_2, matches[5])
                                }
                            };
                        }
                    }
                }
                var subtype = matches[2] === 'def' ? 'def' : 'fn';
                var position = this.getPosition(this.replacements[index][1]);
                // console.log(matches);
                if (fname && display === 'block') {
                    if (matches[2]) {
                        if ((matches[2] === 'var') || (matches[2] === 'let')) {
                            if (vars.self[fname] === void 0) {
                                vars.self[fname] = 'var';
                            }
                            else if (vars.self[fname] === 'let' || matches[2] === 'let') {
                                this.error(' Variable `' + fname + '` has already been declared.');
                            }
                            subtype = this.toES6 ? matches[2] : 'var';
                        }
                        else if (matches[2] === 'public') {
                            subtype = 'public';
                            // console.log(matches[5]);
                        }
                    }
                }
                else {
                    if (matches[2] === 'public') {
                        subtype = 'public';
                        display = 'block';
                    }
                }
            }
            var localvars = {
                parent: vars,
                body: {
                    public: []
                },
                self: {
                    this: 'var',
                    arguments: 'var'
                },
                fixed: [],
                fix_map: {},
                type: 'body'
            };
            var args = this.checkArgs(matches[4], localvars);
            if (display === 'block') {
                if (!fname) {
                    fname = 'default_function_name';
                }
            }
            return {
                type: type,
                vars: localvars,
                posi: this.getPosition(this.replacements[index][1]),
                display: display,
                subtype: subtype,
                fname: fname,
                args: args.keys,
                defaults: args.vals,
                body: this.checkFnBody(localvars, args, matches[5])
            };
        };
        Sugar.prototype.walkParentheses = function (index, display, vars) {
            var body = [], clauses = this.replacements[index][0].replace(/([\[\s\]])/g, '').split(/\s*(,)/), position = this.getPosition(this.replacements[index][1]);
            for (var c = 0; c < clauses.length; c++) {
                if (c) {
                    var posi = this.getPosition(clauses[c]);
                }
                else {
                    var posi = this.getPosition(clauses[c]) || position;
                }
                this.pushSentencesToAST(body, vars, clauses[c], false, posi);
            }
            // console.log(body);
            if (body.length === 1) {
                return body[0];
            }
            return {
                type: 'codes',
                display: 'inline',
                vars: vars,
                body: body
            };
        };
        Sugar.prototype.walkObject = function (index, display, vars) {
            if (vars === void 0) { vars = true; }
            return {
                type: 'object',
                display: display || 'inline',
                posi: this.getPosition(this.replacements[index][1]),
                vars: vars,
                body: this.checkObjMember(vars, this.replacements[index][0])
            };
        };
        Sugar.prototype.checkProp = function (vars, posi, type, attr, array) {
            // console.log(posi);
            // console.log(type, posi, attr, array);
            var position = this.getPosition(posi);
            // position.head = false;
            // console.log(position);
            if (array.length > 1) {
                var body = [];
                if (attr[6]) {
                    body.push({
                        type: 'code',
                        posi: void 0,
                        display: 'inline',
                        vars: vars,
                        value: attr[6].trim()
                    });
                }
                for (var index_8 = 1; index_8 < array.length; index_8++) {
                    var element = array[index_8];
                    var match_as_statement = element.trim().match(matchExpRegPattern.index3);
                    // console.log(matches);
                    if (match_as_statement) {
                        body.push(this.walk({
                            index: match_as_statement[1],
                            type: match_as_statement[2]
                        }, vars, true));
                        if (match_as_statement[3]) {
                            body.push({
                                type: 'code',
                                posi: void 0,
                                display: 'inline',
                                vars: vars,
                                value: match_as_statement[3].trim()
                            });
                        }
                    }
                    else {
                        // console.log(element);
                        body.push({
                            type: 'code',
                            posi: void 0,
                            display: 'inline',
                            vars: vars,
                            value: element.trim()
                        });
                    }
                }
                return {
                    type: type,
                    posi: position,
                    display: 'inline',
                    pname: attr[4].trim() || 'myAttribute',
                    vars: vars,
                    body: body
                };
            }
            return {
                type: type,
                posi: position,
                display: 'inline',
                pname: attr[4].trim() || 'myAttribute',
                vars: vars,
                body: [
                    {
                        type: 'code',
                        posi: void 0,
                        display: 'inline',
                        vars: vars,
                        value: attr[6].trim()
                    }
                ]
            };
        };
        Sugar.prototype.checkClassBody = function (vars, code) {
            // console.log(code);
            var body = [], array = code.replace('_as_function___', '_as_function___;').split(/[;,\r\n]+/);
            // console.log(code);
            for (var index_9 = 0; index_9 < array.length; index_9++) {
                var element = array[index_9].trim();
                var type = 'method';
                // console.log(element);
                if (element) {
                    var elArr = element.split('___boundary_' + this.uid);
                    // console.log(elArr);
                    if (elArr[0] && elArr[0].trim()) {
                        var match_0 = elArr[0].match(matchExpRegPattern.classelement);
                        // console.log(match_0[4].trim(), match_0, elArr);
                        if (match_0) {
                            if (match_0[4].trim()) {
                                switch (match_0[3]) {
                                    case undefined:
                                    case 'public':
                                        type = 'prop';
                                        break;
                                    case 'static':
                                        type = 'staticProp';
                                        break;
                                    default:
                                        this.error('Cannot use `' + match_0[3] + '` on property `' + match_0[4] + '`');
                                }
                                if (match_0[5] != '=') {
                                    if ((elArr.length === 1)) {
                                        match_0[6] = 'undefined';
                                    }
                                    else {
                                        continue;
                                    }
                                }
                                body.push(this.checkProp(vars, match_0[1], type, match_0, elArr));
                                continue;
                            }
                            switch (match_0[3]) {
                                case 'om':
                                    type = 'overrideMethod';
                                    break;
                                case 'get':
                                    type = 'getPropMethod';
                                    break;
                                case 'set':
                                    type = 'setPropMethod';
                                    break;
                                case 'static':
                                    // console.log(match_0[5], elArr);
                                    if (match_0[5] === '=') {
                                        match_0[4] = 'static';
                                        if ((elArr.length === 1)) {
                                            match_0[6] = 'undefined';
                                        }
                                        body.push(this.checkProp(vars, match_0[1], 'prop', match_0, elArr));
                                        continue;
                                    }
                                    type = 'staticMethod';
                                    break;
                            }
                        }
                    }
                    if (elArr[1] && elArr[1].trim()) {
                        var match_1 = elArr[1].trim().match(matchExpRegPattern.index);
                        if (match_1[2] === 'function') {
                            body.push(this.walkFnLike(parseInt(match_1[1]), 'inline', vars, type));
                        }
                    }
                }
            }
            return body;
        };
        Sugar.prototype.checkObjMember = function (vars, code) {
            var that = this, body = [], bodyIndex = -1, lastIndex = 0, array = code.split(/\s*[\{,\}]\s*/);
            // console.log(code, array);
            for (var index_10 = 0; index_10 < array.length; index_10++) {
                var element = array[index_10].trim();
                if (element) {
                    var elArr = element.split('___boundary_' + this.uid);
                    if (elArr[0] && elArr[0].trim()) {
                        var match_0 = elArr[0].match(matchExpRegPattern.objectattr);
                        if (match_0) {
                            if (match_0[5] != ':') {
                                if ((elArr.length === 1)) {
                                    match_0[6] = match_0[4];
                                }
                                else {
                                    // console.log(elArr);
                                    continue;
                                }
                            }
                            // console.log(elArr);
                            body.push(this.checkProp(vars, match_0[1], 'objProp', match_0, elArr));
                            bodyIndex++;
                            continue;
                        }
                        else {
                            // console.log(elArr);
                        }
                    }
                    else {
                        // console.log(elArr);
                        for (var i = 1; i < elArr.length; i++) {
                            var match_as_statement = elArr[i].trim().match(matchExpRegPattern.index3);
                            switch (match_as_statement[2]) {
                                case 'string':
                                case 'pattern':
                                case 'tamplate':
                                    console.log(body, bodyIndex);
                                    body[bodyIndex].body.push({
                                        type: 'code',
                                        posi: void 0,
                                        display: 'inline',
                                        vars: vars,
                                        value: ',' + this.replacements[parseInt(match_as_statement[1])][0].replace(this.markPattern, function () {
                                            return that.replacements[arguments[1]][0];
                                        })
                                    });
                                    if (match_as_statement[3]) {
                                        body[bodyIndex].body.push({
                                            type: 'code',
                                            posi: void 0,
                                            display: 'inline',
                                            vars: vars,
                                            value: match_as_statement[3]
                                        });
                                    }
                                    break;
                                case 'function':
                                    if (elArr.length === 2) {
                                        body.push(this.walkFnLike(parseInt(match_as_statement[1]), 'inline', vars, 'method'));
                                        bodyIndex++;
                                    }
                                    break;
                            }
                        }
                    }
                }
            }
            return body;
        };
        Sugar.prototype.checkArgs = function (code, localvars) {
            var args = code.split(/\s*,\s*/), keys = [], keysArray = void 0, vals = [];
            // console.log(code, args);
            for (var index_11 = 0; index_11 < args.length; index_11++) {
                var arg = args[index_11];
                if (arg) {
                    var array = arg.split(/\s*=\s*/);
                    var position = this.getPosition(array[0]);
                    if (position) {
                        var varname = array[0].replace(position.match, '');
                    }
                    else {
                        var varname = array[0];
                    }
                    // console.log(arg, array, position, varname);
                    if (varname.match(namingExpr)) {
                        keys.push([varname, position]);
                        vals.push(array[1]);
                        localvars.self[varname] = 'var';
                    }
                    else if (varname.match(argsExpr)) {
                        keysArray = [varname, position];
                        localvars.self[varname] = 'var';
                        break;
                    }
                }
            }
            return {
                keys: keys,
                keysArray: keysArray,
                vals: vals
            };
        };
        Sugar.prototype.checkFnBody = function (vars, args, code) {
            code = code.trim();
            // console.log(code);
            var body = [];
            // console.log(args, lines);
            for (var index_12 = 0; index_12 < args.vals.length; index_12++) {
                if (args.vals[index_12] !== undefined) {
                    var valArr = args.vals[index_12].split('___boundary_' + this.uid);
                    if (valArr[1]) {
                        body.push({
                            type: 'code',
                            posi: args.keys[index_12][1],
                            display: 'block',
                            value: 'if (' + args.keys[index_12][0] + '@boundary_5_as_operator::void 0) { ' + args.keys[index_12][0] + ' = ' + valArr[0]
                        });
                        this.pushReplacementsToAST(body, vars, valArr[1], false, this.getPosition(args.vals[index_12]));
                        body.push({
                            type: 'code',
                            posi: void 0,
                            display: 'inline',
                            value: '; }'
                        });
                    }
                    else {
                        body.push({
                            type: 'code',
                            posi: args.keys[index_12][1],
                            display: 'block',
                            value: 'if (' + args.keys[index_12][0] + '@boundary_5_as_operator::void 0) { ' + args.keys[index_12][0] + ' = ' + valArr[0] + '; }'
                        });
                    }
                }
            }
            if (args.keysArray) {
                body.push({
                    type: 'code',
                    posi: args.keysArray[1],
                    display: 'block',
                    value: 'var ' + args.keysArray[0].replace('...', '') + ' = Array.prototype.slice.call(arguments, ' + args.keys.length + ');'
                });
            }
            this.pushBodyToAST(body, vars, code);
            // console.log(code, body);
            return body;
        };
        Sugar.prototype.generate = function () {
            // console.log(this.replacements);
            // console.log(this.ast.body);
            var head = [];
            var body = [];
            var foot = [];
            this.fixVariables(this.ast.vars);
            this.pushHeader(head, this.imports);
            this.pushAlias(body, this.using_as);
            this.pushCodes(body, this.ast.vars, this.ast.body, 1, this.namespace);
            this.pushFooter(foot);
            this.preoutput = head.join('') + this.trim(body.join('')) + foot.join('');
            this.output = this.pickUpMap(this.restoreStrings(this.preoutput, true));
            // console.log(this.output);
            return this;
        };
        Sugar.prototype.pushPostionsToMap = function (position, codes) {
            if (codes === void 0) { codes = undefined; }
            if (position && (typeof position === 'object')) {
                var index_13 = this.posimap.length;
                this.posimap.push(position);
                var replace = '/* @posi' + index_13 + ' */';
                if (codes) {
                    codes.push(replace);
                }
                return replace;
            }
            return '';
        };
        Sugar.prototype.pushHeader = function (codes, array) {
            codes.push('/*!');
            codes.push("\r\n" + ' * tangram.js framework sugar compiled code');
            codes.push("\r\n" + ' *');
            codes.push("\r\n" + ' * Datetime: ' + (new Date()).toUTCString());
            codes.push("\r\n" + ' */');
            codes.push("\r\n" + ';');
            codes.push("\r\n");
            if (this.configinfo === '{}') {
                codes.push("// ");
            }
            else {
                this.pushPostionsToMap(this.getPosition(this.configinfo_posi), codes);
            }
            codes.push('tangram.config(' + this.configinfo + ');');
            codes.push("\r\n" + 'tangram.block([');
            if (this.imports.length) {
                var imports = [];
                for (var index_14 = 0; index_14 < this.imports.length; index_14 += 2) {
                    imports.push(this.pushPostionsToMap(this.getPosition(this.imports[index_14 + 1])) + "'" + this.imports[index_14] + "'");
                }
                // console.log(this.imports, imports);
                codes.push("\r\n\t" + imports.join(",\r\n\t") + "\r\n");
            }
            codes.push('], function (pandora, root, imports, undefined) {');
            return codes;
        };
        Sugar.prototype.pushAlias = function (codes, alias) {
            // console.log(alias);
            for (var key in alias) {
                // console.log(key);
                // let position = this.getPosition(key);
                // let _key = key.replace(position.match, '').trim();
                codes.push("\r\n\t" + this.pushPostionsToMap(alias[key][2]) + "var " + key);
                codes.push(" = imports['" + alias[key][0]);
                codes.push("'] && imports['" + alias[key][0]);
                if (alias[key][1] === '*') {
                    codes.push("'];");
                }
                else {
                    codes.push("']['" + key + "'];");
                }
            }
            return codes;
        };
        Sugar.prototype.pushCodes = function (codes, vars, array, layer, namespace) {
            if (namespace === void 0) { namespace = this.namespace; }
            // console.log(codes, array);
            // console.log(array);
            // console.log(layer, array);
            for (var index_15 = 0; index_15 < array.length; index_15++) {
                var element = array[index_15];
                // console.log(element);
                this.pushElement(codes, vars, element, layer, namespace);
            }
            // this.fixVariables(vars);
            return codes;
        };
        Sugar.prototype.pushElement = function (codes, vars, element, layer, namespace) {
            if (namespace === void 0) { namespace = this.namespace; }
            var indent = "\r\n" + stringRepeat("\t", layer);
            switch (element.type) {
                case 'array':
                    this.pushArrayCodes(codes, element, layer, namespace);
                    break;
                case 'if':
                case 'call':
                case 'callmethod':
                case 'construct':
                    // console.log(layer);
                    this.pushCallCodes(codes, element, layer, namespace);
                    break;
                case 'callschain':
                    this.pushCallsCodes(codes, element, layer, namespace);
                    break;
                case 'class':
                case 'dec':
                    this.pushClassCodes(codes, element, layer, namespace);
                    break;
                case 'code':
                    if (element.value) {
                        // console.log(element.posi&&element.posi.head, element.display, element.value);
                        var code = this.patchVariables(element.value, vars);
                        if (element.display === 'block') {
                            codes.push(indent + this.pushPostionsToMap(element.posi) + code);
                        }
                        else {
                            if (element.posi) {
                                if (element.posi.head) {
                                    codes.push(indent);
                                    if (element.display === 'member') {
                                        codes.push("\t");
                                    }
                                }
                                this.pushPostionsToMap(element.posi, codes);
                            }
                            codes.push(code);
                        }
                        break;
                    }
                    break;
                case 'codes':
                    // console.log(element);
                    this.pushCodes(codes, element.vars, element.body, layer + ((element.posi && element.posi.head) ? 1 : 0), namespace);
                    break;
                case 'def':
                    this.pushFunctionCodes(codes, element, layer, namespace);
                    break;
                case 'extends':
                    this.pushExtendsCodes(codes, element, layer, namespace);
                    break;
                case 'exp':
                case 'closure':
                    this.pushExpressionCodes(codes, element, layer, namespace);
                    break;
                case 'expands':
                    this.pushExpandClassCodes(codes, element, layer, namespace);
                    break;
                case 'object':
                    // console.log(element);
                    this.pushObjCodes(codes, element, layer, namespace);
                    break;
                case 'travel':
                    this.pushTravelCodes(codes, element, layer, namespace);
                    break;
            }
            // this.fixVariables(vars);
            return codes;
        };
        Sugar.prototype.pushArrayCodes = function (codes, element, layer, namespace) {
            var elements = [];
            if (element.posi) {
                this.pushPostionsToMap(element.posi, codes);
            }
            codes.push('[');
            if (element.body.length) {
                var _layer = layer;
                var indent1 = void 0, indent2 = void 0;
                var _break = false;
                // console.log(element.body[0]);
                if (element.body[0].posi && element.body[0].posi.head) {
                    indent1 = "\r\n" + stringRepeat("\t", _layer);
                    _layer++;
                    indent2 = "\r\n" + stringRepeat("\t", _layer);
                    codes.push(indent2);
                    _break = true;
                }
                // console.log(element.body);
                for (var index_16 = 0; index_16 < element.body.length; index_16++) {
                    if (element.body[index_16].value) {
                        elements.push(this.pushPostionsToMap(element.body[index_16].posi) + element.body[index_16].value);
                    }
                    else {
                        var elemCodes = [];
                        this.pushPostionsToMap(element.body[index_16].posi, elemCodes);
                        this.pushElement(elemCodes, element.vars, element.body[index_16], _layer, namespace);
                        if (elemCodes.length) {
                            elements.push(elemCodes.join('').trim());
                        }
                    }
                }
                while (elements.length && !elements[0].trim()) {
                    elements.shift();
                }
                if (elements.length) {
                    if (_break) {
                        codes.push(elements.join(',' + indent2) + indent1);
                    }
                    else {
                        codes.push(elements.join(', '));
                    }
                }
            }
            codes.push(']');
            return codes;
        };
        Sugar.prototype.pushCallCodes = function (codes, element, layer, namespace) {
            var naming = this.pushCodes([], element.vars, element.name, layer, namespace);
            // console.log(element);
            if (element.posi) {
                if (element.type === 'callmethod') {
                    element.posi.head = false;
                }
                if (element.posi.head) {
                    var indent = "\r\n" + stringRepeat("\t", layer);
                    codes.push(indent);
                }
                this.pushPostionsToMap(element.posi, codes);
            }
            var name = naming.join('');
            if (name === 'new') {
                codes.push('new (');
            }
            else {
                if (element.type === 'construct') {
                    codes.push('new ');
                }
                codes.push(name + '(');
            }
            var parameters = [];
            if (element.params.length) {
                var _layer = layer;
                var indent2 = void 0;
                var _break = false;
                // console.log(element.params[0]);
                if ((element.params.length > 1) && element.params[0].posi && element.params[0].posi.head) {
                    // console.log(true);
                    _layer++;
                    indent2 = "\r\n" + stringRepeat("\t", _layer);
                    // codes.push(indent2);
                    _break = true;
                }
                for (var index_17 = 0; index_17 < element.params.length; index_17++) {
                    var param = element.params[index_17].body;
                    var paramCodes = [];
                    this.pushPostionsToMap(element.params[index_17].posi, paramCodes);
                    this.pushCodes(paramCodes, element.vars, param, _layer, namespace);
                    if (paramCodes.length) {
                        parameters.push(paramCodes.join('').trim());
                    }
                }
                while (parameters.length && !parameters[0].trim()) {
                    parameters.shift();
                }
                if (parameters.length) {
                    if (_break) {
                        codes.push(indent2 + parameters.join(',' + indent2));
                        // console.log(codes);
                    }
                    else {
                        codes.push(parameters.join(', '));
                    }
                }
            }
            // console.log(element.display);
            if (element.display === 'block' && element.type !== 'if') {
                codes.push(');');
            }
            else {
                codes.push(')');
            }
            return codes;
        };
        Sugar.prototype.pushCallsCodes = function (codes, element, layer, namespace) {
            var elements = [];
            var _layer = layer;
            var indent;
            var _break = false;
            // console.log(element);
            if (element.posi && element.posi.head) {
                _layer++;
                indent = "\r\n" + stringRepeat("\t", _layer);
                _break = true;
            }
            for (var index_18 = 0; index_18 < element.calls.length; index_18++) {
                var method = element.calls[index_18];
                elements.push(this.pushElement([], element.vars, method, _layer, namespace).join(''));
            }
            if (_break) {
                codes.push(indent + '.' + elements.join(indent + '.'));
            }
            else {
                codes.push('.' + elements.join('.'));
            }
            return codes;
        };
        Sugar.prototype.pushClassCodes = function (codes, element, layer, namespace) {
            var indent1 = "\r\n" + stringRepeat("\t", layer);
            var indent2 = "\r\n" + stringRepeat("\t", layer + 1);
            var elements = [];
            var static_elements = [];
            var cname = '';
            var toES6 = false;
            if (element.subtype === 'stdClass') {
                cname = 'pandora.' + namespace + element.cname.trim();
                codes.push(indent1 + this.pushPostionsToMap(element.posi) + 'pandora.declareClass(\'' + namespace + element.cname.trim() + '\', ');
            }
            else {
                if (element.cname && element.cname.trim()) {
                    cname = element.cname.trim();
                    if (cname.match(/^[\$\w]+$/)) {
                        if (this.toES6) {
                            codes.push(indent1 + this.pushPostionsToMap(element.posi) + 'class ' + cname + ' ');
                            toES6 = true;
                        }
                        else {
                            codes.push(indent1 + 'var ' + this.pushPostionsToMap(element.posi) + cname + ' = ' + 'pandora.declareClass(');
                        }
                    }
                    else {
                        codes.push(indent1 + this.pushPostionsToMap(element.posi) + cname + ' = ' + 'pandora.declareClass(');
                    }
                }
                else {
                    this.pushPostionsToMap(element.posi, codes);
                    if (this.toES6) {
                        codes.push('class ');
                        toES6 = true;
                    }
                    else {
                        codes.push('pandora.declareClass(');
                    }
                }
            }
            if (element.base) {
                if (toES6) {
                    codes.push('extends ' + element.base.trim() + ' ');
                }
                else {
                    codes.push(element.base.trim() + ', ');
                }
            }
            codes.push('{');
            // console.log(element);
            if (toES6) {
                for (var index_19 = 0; index_19 < element.body.length; index_19++) {
                    var member = element.body[index_19];
                    var elem = [];
                    // console.log(member);
                    switch (member.type) {
                        case 'method':
                            if (member.fname === '_init') {
                                member.fname === 'constructor';
                            }
                            elem.push(indent2 + member.fname + ' ');
                            this.pushFunctionCodes(elem, member, layer + 1, namespace);
                            // console.log(member.fname, elem);
                            elements.push(elem.join('').replace(/\s*function\s*\(/, '('));
                            break;
                        case 'prop':
                            elem.push(indent2 + member.pname + ' = ');
                            this.pushCodes(elem, member.vars, member.body, layer + 1, namespace);
                            static_elements.push(elem.join('') + ';');
                            break;
                        case 'setPropMethod':
                            elem.push(indent2 + 'set ' + member.fname + ' ');
                            this.pushFunctionCodes(elem, member, layer + 1, namespace);
                            elements.push(elem.join('').replace(/\s*function\s*\(/, '('));
                            break;
                        case 'getPropMethod':
                            elem.push(indent2 + 'get ' + member.fname + ' ');
                            this.pushFunctionCodes(elem, member, layer + 1, namespace);
                            elements.push(elem.join('').replace(/\s*function\s*\(/, '('));
                            break;
                        case 'staticMethod':
                            elem.push(indent2 + 'static ' + member.fname + ' ');
                            this.pushFunctionCodes(elem, member, layer + 1, namespace);
                            elements.push(elem.join('').replace(/\s*function\s*\(/, '('));
                            break;
                        case 'staticProp':
                            elem.push(indent2 + 'static ' + member.fname + ' = ');
                            this.pushCodes(elem, member.vars, member.body, layer + 1, namespace);
                            static_elements.push(elem.join('') + ';');
                            break;
                    }
                }
            }
            else {
                var overrides = {};
                var setters = [];
                var getters = [];
                var indent3 = "\r\n" + stringRepeat("\t", layer + 2);
                for (var index_20 = 0; index_20 < element.body.length; index_20++) {
                    var member = element.body[index_20];
                    var elem = [];
                    // console.log(member);
                    switch (member.type) {
                        case 'method':
                            elem.push(indent2 + member.fname + ': ');
                            this.pushFunctionCodes(elem, member, layer + 1, namespace);
                            if (this.toES6) {
                                elements.push(elem.join('').replace(/\:\s+function\s*\(/, '('));
                            }
                            else {
                                elements.push(elem.join(''));
                            }
                            break;
                        case 'overrideMethod':
                            overrides[member.fname] = overrides[member.fname] || {};
                            var argslen = member.args.length;
                            if (!overrides[member.fname][argslen]) {
                                var fname = overrides[member.fname][argslen] = '___override_callmethod_' + member.fname + '_' + argslen;
                                elem.push(indent2 + fname + ': ');
                                this.pushFunctionCodes(elem, member, layer + 1, namespace);
                                if (this.toES6) {
                                    elements.push(elem.join('').replace(/\:\s+function\s*\(/, '('));
                                }
                                else {
                                    elements.push(elem.join(''));
                                }
                            }
                            break;
                        case 'prop':
                            elem.push(indent2 + member.pname + ': ');
                            this.pushCodes(elem, member.vars, member.body, layer + 1, namespace);
                            elements.push(elem.join(''));
                            break;
                        case 'setPropMethod':
                            elem.push(indent3 + member.fname + ': ');
                            this.pushFunctionCodes(elem, member, layer + 2, namespace);
                            if (this.toES6) {
                                setters.push(elem.join('').replace(/\:\s+function\s*\(/, '('));
                            }
                            else {
                                setters.push(elem.join(''));
                            }
                            break;
                        case 'getPropMethod':
                            elem.push(indent3 + member.fname + ': ');
                            this.pushFunctionCodes(elem, member, layer + 2, namespace);
                            if (this.toES6) {
                                getters.push(elem.join('').replace(/\:\s+function\s*\(/, '('));
                            }
                            else {
                                getters.push(elem.join(''));
                            }
                            break;
                        case 'staticMethod':
                            elem.push(indent2 + member.fname + ': ');
                            this.pushFunctionCodes(elem, member, layer + 1, namespace);
                            if (this.toES6) {
                                static_elements.push(elem.join('').replace(/\:\s+function\s*\(/, '('));
                            }
                            else {
                                static_elements.push(elem.join(''));
                            }
                            break;
                        case 'staticProp':
                            elem.push(indent2 + member.pname + ': ');
                            this.pushCodes(elem, member.vars, member.body, layer + 1, namespace);
                            static_elements.push(elem.join(''));
                            break;
                    }
                }
                this.pushOverrideMethod(elements, overrides, indent2, indent3);
                if (setters.length) {
                    elements.push(indent2 + '_setters: {' + setters.join(',') + '}');
                }
                if (getters.length) {
                    elements.push(indent2 + '_getters: {' + getters.join(',') + '}');
                }
            }
            if (toES6) {
                if (elements.length) {
                    codes.push(elements.join(''));
                }
                codes.push(indent1 + '}');
                codes.push(indent1);
            }
            else {
                if (elements.length) {
                    codes.push(elements.join(','));
                }
                codes.push(indent1 + '})');
                if (cname) {
                    if (static_elements.length) {
                        codes.push(';' + indent1 + 'pandora.extend(' + cname + ', {');
                        codes.push(static_elements.join(','));
                        codes.push(indent1 + '});');
                    }
                    else {
                        codes.push(';');
                    }
                    codes.push(indent1);
                }
            }
            return codes;
        };
        Sugar.prototype.pushFunctionCodes = function (codes, element, layer, namespace) {
            var indent = "\r\n" + stringRepeat("\t", layer);
            if (element.posi) {
                var posi = this.pushPostionsToMap(element.posi);
            }
            else {
                var posi = '';
            }
            if (element.type === 'def' && element.fname) {
                if (element.fname === 'return') {
                    codes.push(indent + posi + 'return function (');
                }
                else {
                    if ((element.subtype === 'var') || (element.subtype === 'let')) {
                        codes.push(indent + posi + element.subtype + ' ' + element.fname + ' = function (');
                    }
                    else if ((element.subtype === 'public')) {
                        codes.push(indent + posi + 'pandora.' + namespace + element.fname + ' = function (');
                    }
                    else {
                        if (element.display === 'block') {
                            codes.push(indent + posi + 'function ' + element.fname + ' (');
                        }
                        else {
                            codes.push(posi + 'function ' + element.fname + ' (');
                        }
                    }
                }
            }
            else {
                codes.push(posi + 'function (');
            }
            if (element.args.length) {
                var args = [];
                for (var index_21 = 0; index_21 < element.args.length; index_21++) {
                    args.push(this.pushPostionsToMap(element.args[index_21][1]) + element.args[index_21][0]);
                }
                codes.push(args.join(', '));
            }
            codes.push(') {');
            // console.log(element.body);
            if (element.body.length) {
                // console.log(element.body);
                this.pushCodes(codes, element.vars, element.body, layer + 1, namespace);
            }
            else {
                indent = '';
            }
            // console.log(element.display, element.subtype);
            if ((element.subtype === 'var') || (element.subtype === 'let')) {
                codes.push(indent + '};');
                codes.push(indent);
            }
            else {
                codes.push(indent + '}');
            }
            return codes;
        };
        Sugar.prototype.pushExtendsCodes = function (codes, element, layer, namespace) {
            var indent1 = "\r\n" + stringRepeat("\t", layer);
            var indent2 = "\r\n" + stringRepeat("\t", layer + 1);
            var indent3 = "\r\n" + stringRepeat("\t", layer + 2);
            if (element.posi) {
                var posi = this.pushPostionsToMap(element.posi);
            }
            else {
                var posi = '';
            }
            if (element.subtype === 'global' || element.subtype === 'globalassign') {
                namespace = '';
            }
            if (element.subtype === 'ns' || element.subtype === 'global') {
                codes.push(indent1 + posi + 'pandora.ns(\'' + namespace + element.oname.trim() + '\', function () {');
                this.pushCodes(codes, element.vars, element.body, layer + 1, namespace + element.oname.trim() + '.');
                // console.log(element.body);
                var exports_1 = [];
                codes.push(indent2 + 'return {');
                for (var key in element.vars.self) {
                    if (element.vars.self.hasOwnProperty(key) && element.vars.self[key] === 'public') {
                        exports_1.push(key + ': ' + key);
                    }
                }
                if (exports_1.length) {
                    codes.push(indent3 + exports_1.join(',' + indent3));
                }
                codes.push(indent2 + '}');
                codes.push(indent1 + '}');
            }
            else if (element.subtype === 'nsassign' || element.subtype === 'globalassign') {
                codes.push(indent1 + posi + 'pandora.ns(\'' + namespace + element.oname.trim() + '\', ');
                this.pushObjCodes(codes, element, layer, namespace);
            }
            else {
                codes.push(indent1 + posi + 'pandora.extend(' + element.oname + ', ');
                this.pushObjCodes(codes, element, layer, namespace);
            }
            codes.push(');');
            codes.push(indent1);
            return codes;
        };
        Sugar.prototype.pushExpressionCodes = function (codes, element, layer, namespace) {
            var indent1 = "\r\n" + stringRepeat("\t", layer);
            var indent2 = "\r\n" + stringRepeat("\t", layer);
            if (element.posi) {
                var posi = this.pushPostionsToMap(element.posi);
            }
            else {
                var posi = '';
            }
            if (element.type === 'closure') {
                if (element.posi) {
                    codes.push(indent1 + posi + '{');
                }
                else {
                    codes.push(' {');
                }
            }
            else {
                codes.push(indent1 + posi + element.expression + ' (');
                // console.log(element.head);
                this.pushElement(codes, element.vars.parent, element.head, layer, namespace);
                codes.push(') {');
            }
            if (element.body.length) {
                codes.push(indent2);
                // console.log(element.body);
                this.pushCodes(codes, element.vars, element.body, layer + 1, namespace);
                codes.push(indent1 + '}');
            }
            else {
                codes.push('}');
            }
            return codes;
        };
        Sugar.prototype.pushExpandClassCodes = function (codes, element, layer, namespace) {
            var indent1 = "\r\n" + stringRepeat("\t", layer);
            var indent2 = "\r\n" + stringRepeat("\t", layer + 1);
            if (element.posi) {
                var posi = this.pushPostionsToMap(element.posi);
            }
            else {
                var posi = '';
            }
            var elements = [];
            var static_elements = [];
            var cname = '';
            if (element.subtype === 'stdClass') {
                cname = 'pandora.' + namespace + element.cname.trim();
            }
            else {
                if (element.cname && element.cname.trim()) {
                    cname = element.cname.trim();
                }
                else {
                    return codes;
                }
            }
            codes.push(indent1 + posi + 'pandora.extend(' + cname + '.prototype, ');
            // if (element.base) {
            //     codes.push(element.base.trim() + ', ');
            // }
            codes.push('{');
            // console.log(element);
            var overrides = {};
            var indent3 = "\r\n" + stringRepeat("\t", layer + 2);
            for (var index_22 = 0; index_22 < element.body.length; index_22++) {
                var member = element.body[index_22];
                var elem = [];
                // console.log(member);
                switch (member.type) {
                    case 'method':
                        elem.push(indent2 + member.fname + ': ');
                        this.pushFunctionCodes(elem, member, layer + 1, namespace);
                        if (this.toES6) {
                            elements.push(elem.join('').replace(/\:\s+function\s*\(/, '('));
                        }
                        else {
                            elements.push(elem.join(''));
                        }
                        break;
                    case 'overrideMethod':
                        overrides[member.fname] = overrides[member.fname] || {};
                        var argslen = member.args.length;
                        if (!overrides[member.fname][argslen]) {
                            var fname = overrides[member.fname][argslen] = '___override_callmethod_' + member.fname + '_' + argslen;
                            elem.push(indent2 + fname + ': ');
                            this.pushFunctionCodes(elem, member, layer + 1, namespace);
                            if (this.toES6) {
                                elements.push(elem.join('').replace(/\:\s+function\s*\(/, '('));
                            }
                            else {
                                elements.push(elem.join(''));
                            }
                        }
                        break;
                    case 'prop':
                        elem.push(indent2 + member.pname + ': ');
                        this.pushCodes(elem, member.vars, member.body, layer + 1, namespace);
                        elements.push(elem.join(''));
                        break;
                    case 'staticMethod':
                        elem.push(indent2 + member.fname + ': ');
                        this.pushFunctionCodes(elem, member, layer + 1, namespace);
                        if (this.toES6) {
                            static_elements.push(elem.join('').replace(/\:\s+function\s*\(/, '('));
                        }
                        else {
                            static_elements.push(elem.join(''));
                        }
                        break;
                    case 'staticProp':
                        elem.push(indent2 + member.pname + ': ');
                        this.pushCodes(elem, member.vars, member.body, layer + 1, namespace);
                        static_elements.push(elem.join(''));
                        break;
                }
            }
            this.pushOverrideMethod(elements, overrides, indent2, indent3);
            if (elements.length) {
                codes.push(elements.join(','));
            }
            codes.push(indent1 + '})');
            // console.log(element.display);
            if (static_elements.length) {
                codes.push(';' + indent1 + 'pandora.extend(' + cname + ', {');
                codes.push(static_elements.join(','));
                codes.push(indent1 + '});');
            }
            else {
                codes.push(';');
            }
            codes.push(indent1);
            // console.log(elements, static_elements); 
            return codes;
        };
        Sugar.prototype.pushOverrideMethod = function (elements, overrides, indent2, indent3) {
            for (var fname in overrides) {
                if (overrides.hasOwnProperty(fname)) {
                    // console.log(overrides[fname]);
                    var elem = [];
                    elem.push(indent2 + fname + ': ');
                    if (this.toES6) {
                        elem.push('(){');
                    }
                    else {
                        elem.push('function(){');
                    }
                    var element = overrides[fname];
                    for (var args in element) {
                        if (element.hasOwnProperty(args)) {
                            elem.push(indent3 + 'if (arguments.length@boundary_5_as_operator::' + args + ') { return this.' + element[args] + '.apply(this, arguments); }');
                        }
                    }
                    elem.push(indent3 + 'return this.' + element[args] + '.apply(this, arguments);');
                    elem.push(indent2 + '}');
                    elements.push(elem.join(''));
                }
            }
        };
        Sugar.prototype.pushTravelCodes = function (codes, element, layer, namespace) {
            var indent = "\r\n" + stringRepeat("\t", layer);
            // console.log(element);
            codes.push(indent + 'pandora.each(');
            this.pushElement(codes, element.vars, element.iterator, layer, namespace);
            codes.push(', ');
            this.pushFunctionCodes(codes, element.callback, layer, namespace);
            codes.push(', this);');
            codes.push(indent);
            return codes;
        };
        Sugar.prototype.pushObjCodes = function (codes, element, layer, namespace) {
            var indent1 = "\r\n" + stringRepeat("\t", layer);
            var indent2 = "\r\n" + stringRepeat("\t", layer + 1);
            console.log(element);
            if (element.display === 'block') {
                codes.push(indent1 + this.pushPostionsToMap(element.posi) + '{');
            }
            else {
                codes.push('{');
            }
            if (element.body.length) {
                var elements = [];
                var _layer = layer;
                var _break = false;
                // console.log(element.body[0]);
                if ((element.body.length > 1) || (element.body[0].posi && element.body[0].posi.head)) {
                    _layer++;
                    codes.push(indent2);
                    _break = true;
                }
                // console.log(_break, element);
                for (var index_23 = 0; index_23 < element.body.length; index_23++) {
                    var member = element.body[index_23];
                    var elem = [];
                    // console.log(member);
                    switch (member.type) {
                        case 'method':
                            elem.push(member.fname + ': ');
                            this.pushFunctionCodes(elem, member, _layer, namespace);
                            if (this.toES6) {
                                elements.push(elem.join('').replace(/\:\s+function\s*\(/, '('));
                            }
                            else {
                                elements.push(elem.join(''));
                            }
                            break;
                        case 'objProp':
                            elem.push(member.pname + ': ');
                            this.pushCodes(elem, member.vars, member.body, _layer, namespace);
                            elements.push(elem.join(''));
                            break;
                    }
                }
                if (_break) {
                    codes.push(elements.join(',' + indent2));
                    codes.push(indent1);
                }
                else {
                    codes.push(elements.join(','));
                }
            }
            codes.push('}');
            return codes;
        };
        Sugar.prototype.fixVariables = function (vars) {
            this.closurecount++;
            // console.log(vars.type, vars);
            if (1) {
                for (var index_24 = 0; index_24 < vars.self.length; index_24++) {
                    var element = vars.self[index_24].split(/\s+/)[1];
                    if (['pandora', 'global', 'imports', 'undefined']['includes'](element)) {
                        if (!vars.fix_map[element]) {
                            var i = 1;
                            var newname = element + '_' + i;
                            while (vars.fixed['includes'](newname)) {
                                i++;
                                newname = element + '_' + i;
                            }
                            vars.fixed.push(newname);
                            vars.fix_map[element] = newname;
                        }
                    }
                }
                switch (vars.type) {
                    case 'block':
                        break;
                }
                return;
            }
            switch (vars.type) {
                case 'block':
                    vars.fixed = vars.parent;
                    for (var index_25 = 0; index_25 < vars.self.length; index_25++) {
                        var element = vars.self[index_25].split(/\s+/)[1];
                        while (!vars.fixed['includes'](element)) {
                            vars.fixed.push(element);
                        }
                    }
                    for (var index_26 = 0; index_26 < vars.self.length; index_26++) {
                        var element = vars.self[index_26].split(/\s+/)[1];
                        if (['pandora', 'global', 'imports', 'undefined']['includes'](element)) {
                            while (!vars.fixed['includes'](element)) {
                                vars.fixed.push(element);
                            }
                            var newname = element + '_1';
                            if (!vars.fix_map[newname]) {
                                vars.fixed.push(newname);
                                vars.fix_map[newname] = element;
                            }
                        }
                        else {
                            if (vars.fix_map[element]) {
                                var newname = element + '_fixed';
                                vars.fixed.push(newname);
                                vars.fix_map[newname] = element;
                            }
                            else {
                                // console.log(vars.fixed);
                                if (vars.fixed['includes'](element)) {
                                    vars.fixed.push(element);
                                }
                            }
                        }
                    }
                    break;
                default:
                    break;
            }
            console.log(vars);
        };
        Sugar.prototype.patchVariables = function (code, vars) {
            var _this = this;
            // console.log(code, vars);
            if (code) {
                // console.log(code);
                return code.replace(/(^|[^\$\w\.]\s*)([\$a-z_][\$\w]*)(\*[\$\w]|$)/i, function (match, before, varname, after) {
                    // console.log(match, before, varname, after);
                    return before + _this.patchVariable(varname, vars) + after;
                });
            }
            // console.log(code);
            return '';
        };
        Sugar.prototype.patchVariable = function (varname, vars) {
            // console.log(varname, vars);
            return varname;
        };
        Sugar.prototype.pushFooter = function (codes) {
            if (this.isMainBlock) {
                codes.push("\r\n" + '}, true);');
            }
            else {
                codes.push("\r\n" + '});');
            }
            return codes;
        };
        Sugar.prototype.restoreStrings = function (string, last) {
            var that = this;
            if (last) {
                var pattern = this.lastPattern;
            }
            else {
                var pattern = this.trimPattern;
            }
            return string.replace(pattern, function () {
                if (arguments[5]) {
                    return that.replacements[arguments[5]][0];
                }
                return that.replacements[arguments[2] || arguments[4]][0];
            }).replace(this.markPattern, function () {
                return that.replacements[arguments[1]][0];
            }).replace(/(@\d+L\d+P\d+O?\d*:::)/g, '');
        };
        Sugar.prototype.decode = function (string) {
            string = string.replace(/@\d+L\d+P\d+(O\d+)?:*/g, '');
            var matches = string.match(/___boundary_([A-Z0-9_]{37})?(\d+)_as_[a-z]+___/);
            while (matches) {
                // console.log(matches, this.replacements[matches[2]]);
                string = string.replace(matches[0], this.replacements[matches[2]][0]).replace(/@\d+L\d+P\d+(O\d+)?:*/g, '');
                matches = string.match(/___boundary_([A-Z0-9_]{37})?(\d+)_as_[a-z]+___/);
            }
            // console.log(string);
            return string.replace(/(@\d+L\d+P\d+O?\d*:::)/g, '');
        };
        Sugar.prototype.trim = function (string) {
            var _this = this;
            // 此处的replace在整理完成后，将进行分析归纳，最后改写为callback形式的
            // console.log(string);
            // string = this.restoreStrings(string, false);
            // return string;
            // this.replacements = [['{}'], ['/='], ['/'], [' +'], [' -'], ['return ']];
            // console.log(string);
            string = this.replaceStrings(string, true);
            // console.log(string);
            // string = this.replaceOperators(string, false);
            // console.log(string);
            // return '';
            // 删除多余头部
            // string = string.replace(/^[,;\s]+[\r\n]+/g, "\r\n");
            // string = string.replace(/^[,;\s]+/g, "\r\n\t");
            //去除多余符号
            // string = string.replace(/\s*;(\s*;)+/g, ";");
            // string = string.replace(/\s*;([^\s])/g, "; $1");
            // string = string.replace(/(\{|\[|\(|\.|\:)\s*[,;]+/g, "$1");
            // string = string.replace(/\s*[,;]+(\s*)(\.|\:|\)|\])/g, "$1$2");
            // string = string.replace(/\s+(\=|\?|\:)[,;\s]*/g, " $1 ");
            // string = string.replace(/([\r\n]*\s*[\$\w])\s+(\:)/g, "$1$2");
            // // 关键字处理
            // string = string.replace(/if\s*\(([^\)]+)\)\s*[,;]+/g, "if ($1)");
            // string = string.replace(/([^\$\w])else\s*[,;]+/g, "$1else");
            // string = string.replace(/([^\s])\s*(instanceof)\s+/g, " $1 ");
            // string = string.replace(/(,|;)?[\r\n]+(\s*)(var|delete|return)\s+/g, "$1\r\n$2$3 ");
            // 删除多余空白
            // string = string.replace(/\{\s+\}/g, '{}');
            // string = string.replace(/\[\s+\]/g, '[]');
            // string = string.replace(/\(\s+\)/g, '()');
            // console.log(string);
            // 去除多余符号
            string = string.replace(/\s*;(\s*;)*/g, ";");
            string = string.replace(/(.)(\{|\[|\(|\.|\:)\s*[,;]+/g, function (match, before, mark) {
                if ((before === mark) && (before === ':')) {
                    return match;
                }
                return before + mark;
            });
            // 格式化相应符号
            string = string.replace(/\s+(\=|\?|\:)[,;\s]*/g, " $1 ");
            // 删除多余换行
            string = string.replace(/\s*[\r\n]+([\r\n])?/g, "\r\n$1");
            // console.log(string);
            // 运算符处理
            string = string.replace(/(\s*)(@boundary_(\d+)_as_(operator|aftoperator)::)\s*/g, function (match, pregap, operator, index) {
                // console.log(this.replacements[index]);
                if (_this.replacements[index][1]) {
                    // console.log(this.replacements[index]);
                    return pregap + operator;
                }
                return operator;
            });
            string = string.replace(/(@boundary_\d+_as_(preoperator)::)(\s*;+|(\s+([^;])))/g, function (match, operator, word, right, afterwithgap, after) {
                if (after) {
                    return operator + after;
                }
                return operator;
            });
            return string;
            // console.log(string);
            // 关键字处理
            // console.log(string);
            // string = string.replace(/(\(|\[)\s+([\r\n]+)/g, "$1$2");
            // string = string.replace(/([^\r\n])\s+(\)|\])/g, "$1$2");
            // console.log(string);
            // return string;
            {
                // string = string.replace(/[;\r\n]+?(\s*)if\s*\(([\s\S]+?)\)/g, ";\r\n$1if ($2) ");
                // string = string.replace(/if\s*\(([\s\S]+?)\)[\s,;]*{/g, "if ($1) {");
                // string = string.replace(/;+\s*(instanceof)\s+/g, " $1 ");
                // string = string.replace(/(var|else|delete)(;|\s)+[;\s]*/g, "$1 ");
                // string = string.replace(/[;\r\n]+(\s*)(var|delete|return)\s+/g, ";\r\n$1$2 ");
                //前置运算符处理
                // string = string.replace(/[,\s]*(@boundary_\d+_as_preoperator::)[,;\s]*/g, "$1");
                // string = string.replace(/((\<|\!|\>)\=*)\s+(\+|\-)\s+(\d)/g, '$1 $3$4');
                // 中置运算符前后不能结非标量
                // string = string.replace(/[,;\s]*(@boundary_\d+_as_operator::)[,;\s]*/g, "$1");
                // string = string.replace(/[,;\s]*(\=|\!|\+|\-|\*|\/|\%|\&|\^|\||<|>)[,;\s]*/g, " $1 ");
                // string = string.replace(/\s*;+\s*(<+|\+|\-|\*|\/|>+)\s+/g, " $1 ");
                // string = string.replace(/\s+(<+|\+|\-|\*|\/|>+)\s*;+\s*/g, " $1 ");
                // string = string.replace(/[,;\s]*(\?)[,;\s]*/g, " $1 ");
                // 后置运算符前面必须有内容
                // string = string.replace(/[,;\s]*(@boundary_\d+_as_aftoperator::)/g, "$1");
                // string = string.replace(/[,;\s]*(\(|\))/g, "$1");
                //去除多余符号
                // string = string.replace(/\s*;+/g, "; ");
                // string = string.replace(/[,;\s]*,[,;]*/g, ',');
                // string = string.replace(/(\{|\[|\(|\.|\:)\s*;+/g, "$1");
                // string = string.replace(/\s*,+\s*(\.|\:|\)|\]|\})/g, "$1");
                // string = string.replace(/(\{|\[|\(|\.|\:)\s*,+(\s*)/g, "$1$2");
                // string = string.replace(/[;\s]+(\{|\[|\(|\.|\:|\)|\])/g, "$1");
                // 删除多余换行
                // string = string.replace(/(,|;)[\r\n]+/g, "$1\r\n");
                // 删除多余空白
                // string = string.replace(/\{\s+\}/g, '{}');
                // string = string.replace(/\[\s+\]/g, '[]');
                // string = string.replace(/\(\s+\)/g, '()');
                // 删除多余头部
                // string = string.replace(/^[,;\s]+/g, "");
                // string = string.replace(/[\r\n]+(\s+)\}\s*([\$\w+]+)/g, "\r\n$1}\r\n$1$2");
                // string = this.restoreStrings(string);
            }
            // return string;
        };
        Sugar.prototype.pickUpMap = function (string) {
            var lines = string.split(/\r{0,1}\n/);
            var _lines = [];
            var mappings = [];
            for (var l = 0; l < lines.length; l++) {
                var line = lines[l];
                var mapping = [];
                var match = void 0;
                while (match = line.match(/\/\*\s@posi(\d+)\s\*\//)) {
                    var index_27 = match.index;
                    var position = this.posimap[match[1]];
                    // console.log(position);
                    mapping.push([index_27, position.o[0], position.o[1], position.o[2], 0]);
                    line = line.replace(match[0], '');
                }
                _lines.push(line);
                mappings.push(mapping);
            }
            this.mappings = mappings;
            // console.log(mappings)
            return _lines.join("\r\n");
        };
        Sugar.prototype.run = function (precall, callback) {
            if (precall === void 0) { precall = null; }
            if (callback === void 0) { callback = function (content) { }; }
            if (!this.output) {
                this.compile();
            }
            precall && precall.call(this, this.output);
            eval(this.output);
            callback.call(this);
        };
        return Sugar;
    }());
    return function (input, run) {
        return new Sugar(input, run);
    };
}));
//# sourceMappingURL=sugar.js.map