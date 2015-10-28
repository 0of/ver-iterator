import {satisfies} from 'semver';
import EventEmitter from 'events';
import url from 'url';
import path from 'path';
import npm from './npm.js';

export default class VersionIterable extends EventEmitter {
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
    constructor (task, {name, range='*', dir='.', restore=true} = {}) {
        super();
        if (typeof task !== 'function') throw new TypeError('expects task as a function');

        let versionFilter = typeof range === 'function' ? range : (v) => { return satisfies(v, range); };
        let {pathname} = url.parse(name);
        if (path.extname(pathname) == '.git') {
            // check the name is kind of git repo url
            name = path.basename(pathname, '.git');
        } else {
            this.name = pathname;
            this.source = makeNPMPackageSource(pathname, versionFilter, dir, restore);
        }

        this.task = task;
    }

    runEashTask (ver) {
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

    *[Symbol.iterator] () {
        let vers = this.source.fetchVersions();

        this.emit('before');

        for (let ver of vers) {
            this.emit('beforeEach', ver);
            yield this.runEashTask(ver);
            this.emit('afterEach', ver);
        }

        this.emit('after');

        // restore
        if (this.source.restore) {
            this.source.restore();
        }
    }
}

function makeNPMPackageSource (name, versionFilter, dir, willRestore) {
    var packageSource = {
        fetchVersions () {
            return npm.publishedVers(name).filter(versionFilter);
        },

        switchVersion (ver) {
            npm.installVer(name, ver, dir);
        }
    };

    if (willRestore) {
        let preVer = npm.listInstalledVer(name, dir);
        packageSource.restore = () => {
            // install the previous version of the package
            if (preVer.length !== 0) {
                npm.installVer(name, preVer, dir);
            } else {
                // no record shows any version of the package has been previously installed
                // just remove current one
                try {
                    let curVer = npm.listInstalledVer(name, dir);
                    npm.uninstalledVer(name, curVer, dir);
                } catch (e) {
                    // do nothing, ignore it
                }
            }
        };
    }

    return packageSource;
}