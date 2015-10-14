import {satisfies} from 'semver';
import EventEmitter from 'events';
import child from 'child_process';

export default class VersionIteratable extends EventEmitter{

    constructor(task, {name, versions='*', dir='.'} = {}) {
        super();
        if (typeof task !== 'function') throw new TypeError('expects task as a function');

        let allVers = publishedVers(name);
        this.name_ = name;
        this.vers_ = [
            for (v of allVers) if (satisfies(v, versions)) v
        ];
        this.task_ = (ver) => {
            try {
                installVer(name, ver, dir);
            } catch (e) {
                this.emit('fatal', e);
                return false;
            }
            
            try {
                task.call(undefined, {name, ver});
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

const npm = (process.platform === 'win32' ? 'npm.cmd' : 'npm')

function publishedVers (name) {
    let {stdout, error} = child.spawnSync(npm, ['view', name, 'versions']);
    if (error) throw error;

    return stdout.toString().match(/([0|[1-9\d]*\.[0|1-9\d]*\.[0|1-9\d]*)/g) || [];
}

function installVer(name, ver, dir) {
    let {error} = child.spawnSync(npm, ['install', `${name}@${ver}`]);
    if (error) throw error;
}