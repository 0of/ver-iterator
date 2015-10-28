'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

/**
 * simple git cli wrapper
 * all callings are sync
 */
exports['default'] = {

  /**
   * git clone from specific URL
   *
   * @param {String} [url] git repo URL
   * @param {String} [dir] the dir the repo cloned into
   * @public
   */
  clone: function clone(url, dir) {
    _child_process2['default'].execSync('git clone ' + url, { cwd: _path2['default'].resolve(dir) });
  },

  /**
   * git list all the tags
   *
   * @param {String} [localRepoDir] local repo dir
   * @public
   */
  listTags: function listTags(localRepoDir) {
    var stdout = _child_process2['default'].execSync('git tag -l', { cwd: _path2['default'].resolve(localRepoDir) });
    return stdout.toString().match(/[^\r\n]+/g).filter(function (v) {
      return v.length !== 0;
    }).map(function (v) {
      return v.trim();
    });
  },

  /**
   * git checkout
   *
   * @param {String} [branch] branch name
   * @param {String} [localRepoDir] local repo dir
   * @public
   */
  checkout: function checkout(branch, localRepoDir) {
    _child_process2['default'].execSync('git checkout ' + branch, { cwd: _path2['default'].resolve(localRepoDir) });
  }

};
module.exports = exports['default'];
//# sourceMappingURL=git.js.map
