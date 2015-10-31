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

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _npmJs = require('./npm.js');

var _npmJs2 = _interopRequireDefault(_npmJs);

var _gitJs = require('./git.js');

var _gitJs2 = _interopRequireDefault(_gitJs);

var VersionIterable = (function (_EventEmitter) {
    _inherits(VersionIterable, _EventEmitter);

    /**
     * construct iterable published versions via npm
     *
     * @param {Function} [task] ({name, version}) => {}
     * @param {Object} [opts]
     * @param {String} [opts.name] package name or git URL
     * @param {String|Function} [opts.range] iterating version ranges in semver format
     *  or customized version filter
     * @param {String} [opts.dir] installing package directory
     * @public
     */

    function VersionIterable(task) {
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

        var versionFilter = typeof range === 'function' ? range : function (v) {
            return (0, _semver.satisfies)(v, range);
        };

        var _url$parse = _url2['default'].parse(name);

        var pathname = _url$parse.pathname;

        if (_path2['default'].extname(pathname) == '.git') {
            // check the name is kind of git repo url
            var repoName = _path2['default'].basename(pathname, '.git');
            this.name = repoName;
            this.source = makeGitSource(repoName, name, /* passing url */versionFilter, dir, restore);
            this.sourceName = 'git';
        } else {
            this.name = pathname;
            this.source = makeNPMPackageSource(pathname, versionFilter, dir, restore);
            this.sourceName = 'npm';
        }

        this.task = task;
    }

    _createClass(VersionIterable, [{
        key: 'runEashTask',
        value: function runEashTask(ver) {
            try {
                this.source.switchVersion(ver);
            } catch (e) {
                this.emit('fatal', e);
                return false;
            }

            try {
                this.task.call(undefined, { name: this.name, version: ver });
            } catch (e) {
                this.emit('failed', e);
                return false;
            }

            return true;
        }
    }, {
        key: _Symbol$iterator,
        value: _regeneratorRuntime.mark(function value() {
            var vers, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, ver;

            return _regeneratorRuntime.wrap(function value$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        vers = this.source.fetchVersions();

                        this.emit('before');

                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        context$2$0.prev = 5;
                        _iterator = _getIterator(vers);

                    case 7:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            context$2$0.next = 16;
                            break;
                        }

                        ver = _step.value;

                        this.emit('beforeEach', ver);
                        context$2$0.next = 12;
                        return this.runEashTask(ver);

                    case 12:
                        this.emit('afterEach', ver);

                    case 13:
                        _iteratorNormalCompletion = true;
                        context$2$0.next = 7;
                        break;

                    case 16:
                        context$2$0.next = 22;
                        break;

                    case 18:
                        context$2$0.prev = 18;
                        context$2$0.t0 = context$2$0['catch'](5);
                        _didIteratorError = true;
                        _iteratorError = context$2$0.t0;

                    case 22:
                        context$2$0.prev = 22;
                        context$2$0.prev = 23;

                        if (!_iteratorNormalCompletion && _iterator['return']) {
                            _iterator['return']();
                        }

                    case 25:
                        context$2$0.prev = 25;

                        if (!_didIteratorError) {
                            context$2$0.next = 28;
                            break;
                        }

                        throw _iteratorError;

                    case 28:
                        return context$2$0.finish(25);

                    case 29:
                        return context$2$0.finish(22);

                    case 30:

                        this.emit('after');

                        // restore
                        if (this.source.restore) {
                            this.source.restore();
                        }

                    case 32:
                    case 'end':
                        return context$2$0.stop();
                }
            }, value, this, [[5, 18, 22, 30], [23,, 25, 29]]);
        })
    }]);

    return VersionIterable;
})(_events2['default']);

exports['default'] = VersionIterable;

function makeNPMPackageSource(name, versionFilter, dir, willRestore) {
    var packageSource = {
        fetchVersions: function fetchVersions() {
            return _npmJs2['default'].publishedVers(name).filter(versionFilter);
        },

        switchVersion: function switchVersion(ver) {
            _npmJs2['default'].installVer(name, ver, dir);
        }
    };

    if (willRestore) {
        (function () {
            var preVer = _npmJs2['default'].listInstalledVer(name, dir);
            packageSource.restore = function () {
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

    return packageSource;
}

function makeGitSource(name, url, versionFilter, dir, willRestore) {
    var clonedDir = _path2['default'].join(dir, name);

    var gitSource = {
        fetchVersions: function fetchVersions() {
            _gitJs2['default'].clone(url, dir);
            return _gitJs2['default'].listTags(clonedDir).filter(versionFilter);
        },

        switchVersion: function switchVersion(ver) {
            _gitJs2['default'].checkout(ver, clonedDir);
        }
    };

    if (willRestore) {
        gitSource.restore = function () {
            try {
                _fs2['default'].rmdirSync(clonedDir);
            } catch (e) {
                // no throw
            }
        };
    }

    return gitSource;
}
module.exports = exports['default'];
//# sourceMappingURL=iterator.js.map
