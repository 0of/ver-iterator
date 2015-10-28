'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Symbol$iterator = require('babel-runtime/core-js/symbol/iterator')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _semver = require('semver');

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _npmJs = require('./npm.js');

var _npmJs2 = _interopRequireDefault(_npmJs);

var VersionIterable = (function (_EventEmitter) {
    _inherits(VersionIterable, _EventEmitter);

    /**
     * construct iterable published versions via npm
     *
     * @param {Function} [task] ({name, version}) => {}
     * @param {Object} [opts]
     * @param {String} [opts.name] package name
     * @param {String} [opts.range] iterating version ranges in semver format
     * @param {String} [opts.dir] installing package directory
     * @public
     */

    function VersionIterable(task) {
        var _this = this;

        var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var name = _ref.name;
        var _ref$range = _ref.range;
        var range = _ref$range === undefined ? '*' : _ref$range;
        var _ref$dir = _ref.dir;
        var dir = _ref$dir === undefined ? '.' : _ref$dir;
        var _ref$restore = _ref.restore;
        var restore = _ref$restore === undefined ? true : _ref$restore;

        _classCallCheck(this, VersionIterable);

        _get(Object.getPrototypeOf(VersionIterable.prototype), 'constructor', this).call(this);
        if (typeof task !== 'function') throw new TypeError('expects task as a function');

        var allVers = _npmJs2['default'].publishedVers(name);
        this.name_ = name;
        this.vers_ = allVers.filter(function (v) {
            return (0, _semver.satisfies)(v, range);
        });

        this.task_ = function (ver) {
            try {
                _npmJs2['default'].installVer(name, ver, dir);
            } catch (e) {
                _this.emit('fatal', e);
                return false;
            }

            try {
                task.call(undefined, { name: name, version: ver });
            } catch (e) {
                _this.emit('failed', e);
                return false;
            }

            return true;
        };

        if (restore) {
            (function () {
                var preVer = _npmJs2['default'].listInstalledVer(name, dir);

                _this.restoreAction = function () {
                    // install the previous version of the package
                    if (preVer.length !== 0) {
                        _npmJs2['default'].installVer(name, preVer, dir);
                    } else {
                        // no record shows any version of the package has been previously installed
                        // just remove current one
                        try {
                            var curVer = _npmJs2['default'].listInstalledVer(name, dir);
                            _npmJs2['default'].uninstalledVer(name, curVer, dir);
                        } catch (e) {
                            // do nothing, ignore it
                        }
                    }
                };
            })();
        }
    }

    _createClass(VersionIterable, [{
        key: _Symbol$iterator,
        value: _regeneratorRuntime.mark(function value() {
            var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, ver;

            return _regeneratorRuntime.wrap(function value$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        this.emit('before');

                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        context$2$0.prev = 4;
                        _iterator = _getIterator(this.vers_);

                    case 6:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            context$2$0.next = 15;
                            break;
                        }

                        ver = _step.value;

                        this.emit('beforeEach', ver);
                        context$2$0.next = 11;
                        return this.task_(ver);

                    case 11:
                        this.emit('afterEach', ver);

                    case 12:
                        _iteratorNormalCompletion = true;
                        context$2$0.next = 6;
                        break;

                    case 15:
                        context$2$0.next = 21;
                        break;

                    case 17:
                        context$2$0.prev = 17;
                        context$2$0.t0 = context$2$0['catch'](4);
                        _didIteratorError = true;
                        _iteratorError = context$2$0.t0;

                    case 21:
                        context$2$0.prev = 21;
                        context$2$0.prev = 22;

                        if (!_iteratorNormalCompletion && _iterator['return']) {
                            _iterator['return']();
                        }

                    case 24:
                        context$2$0.prev = 24;

                        if (!_didIteratorError) {
                            context$2$0.next = 27;
                            break;
                        }

                        throw _iteratorError;

                    case 27:
                        return context$2$0.finish(24);

                    case 28:
                        return context$2$0.finish(21);

                    case 29:

                        this.emit('after');

                        // restore
                        if (this.restoreAction) {
                            this.restoreAction();
                        }

                    case 31:
                    case 'end':
                        return context$2$0.stop();
                }
            }, value, this, [[4, 17, 21, 29], [22,, 24, 28]]);
        })
    }]);

    return VersionIterable;
})(_events2['default']);

exports['default'] = VersionIterable;
module.exports = exports['default'];
//# sourceMappingURL=iterator.js.map
