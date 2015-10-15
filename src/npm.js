import child from 'child_process';

const npmCommand = (process.platform === 'win32' ? 'npm.cmd' : 'npm');

export default {
    /**
     * get published versions via npm
     *
     * @param {String} [name] published package name
     * @return {Array} versions
     * @public
     */
    publishedVers (name) {
        let {stdout, error} = child.spawnSync(npmCommand, ['view', name, 'versions']);
        if (error) throw error;

        return stdout.toString().match(/([0|[1-9\d]*\.[0|1-9\d]*\.[0|1-9\d]*)/g) || [];
    },

    /**
     * install package via npm
     *
     * @param {String} [name] published package name
     * @param {String} [ver] install version
     * @param {String} [dir] install directory
     * @public
     */
    installVer (name, ver, dir) {
        let {error} = child.spawnSync(npmCommand, ['install', `${name}@${ver}`], { cwd: dir });
        if (error) throw error;
    }
};

