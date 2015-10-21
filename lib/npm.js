'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

exports['default'] = {
    /**
     * get published versions via npm
     *
     * @param {String} [name] published package name
     * @return {Array} versions
     * @public
     */
    publishedVers: function publishedVers(name) {
        var _child$spawnSync = _child_process2['default'].spawnSync(npmCommand, ['view', name, 'versions', '--json']);

        var stdout = _child$spawnSync.stdout;
        var error = _child$spawnSync.error;

        if (error) throw error;

        return JSON.parse(stdout.toString());
    },

    /**
     * install package via npm
     *
     * @param {String} [name] published package name
     * @param {String} [ver] install version
     * @param {String} [dir] install directory
     * @public
     */
    installVer: function installVer(name, ver, dir) {
        var _child$spawnSync2 = _child_process2['default'].spawnSync(npmCommand, ['install', name + '@' + ver], { cwd: dir });

        var error = _child$spawnSync2.error;

        if (error) throw error;
    }
};
module.exports = exports['default'];
//# sourceMappingURL=npm.js.map
