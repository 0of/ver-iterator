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
     * @param {String} [opts.versions] iterating versions in semver format
     * @param {String} [opts.dir] installing package directory
     * @public
     */
    constructor (task, {name, versions='*', dir='.'} = {}) {
        super();
        if (typeof task !== 'function') throw new TypeError('expects task as a function');

        let allVers = npm.publishedVers(name);
        this.name_ = name;
        this.vers_ = [
            for (v of allVers) if (satisfies(v, versions)) v
        ];
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
    }

    *[Symbol.iterator] () {
        this.emit('before');

        for (let ver of this.vers_) {
            this.emit('beforeEach', ver);
            yield this.task_(ver);
            this.emit('afterEach', ver);
        }

        this.emit('after');
    }
}