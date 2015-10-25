import {satisfies} from 'semver';
import EventEmitter from 'events';
import npm from './npm.js';

export default class VersionIterable extends EventEmitter {
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
    constructor (task, {name, range='*', dir='.', restore=true} = {}) {
        super();
        if (typeof task !== 'function') throw new TypeError('expects task as a function');

        let allVers = npm.publishedVers(name);
        this.name_ = name;
        this.vers_ = allVers.filter((v) => { return satisfies(v, range); });

        this.task_ = (ver) => {
            try {
                npm.installVer(name, ver, dir);
            } catch (e) {
                this.emit('fatal', e);
                return false;
            }

            try {
                task.call(undefined, {name, version: ver});
            } catch (e) {
                this.emit('failed', e);
                return false;
            }

            return true;
        };

        if (restore) {
            let preVer = npm.listInstalledVer(name, dir);

            this.restoreAction = () => {
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
            }
        }
    }

    *[Symbol.iterator] () {
        this.emit('before');

        for (let ver of this.vers_) {
            this.emit('beforeEach', ver);
            yield this.task_(ver);
            this.emit('afterEach', ver);
        }

        this.emit('after');

        // restore
        if (this.restoreAction) {
            this.restoreAction();
        }
    }
}
