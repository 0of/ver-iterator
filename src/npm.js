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
        let {stdout, error} = child.spawnSync(npmCommand, ['view', name, 'versions', '--json']);
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
    installVer (name, ver, dir) {
        let {error} = child.spawnSync(npmCommand, ['install', `${name}@${ver}`], { cwd: dir });
        if (error) throw error;
    },

    /**
     * list specific package version via npm
     *
     * @param {String} [name] published package name
     * @param {String} [dir] list directory
     * @public
     */
    listInstalledVer (name, dir) {
        let {stdout, error, status} = child.spawnSync(npmCommand, ['list', name, '--depth', '0', '--json'], { cwd: dir });
        // the package is invalid or uninstalled
        if (error || 0 !== status) {
            return '';
        }

        return JSON.parse(stdout)['version'];
    },

    /**
     * uninstall package via npm
     *
     * @param {String} [name] published package name
     * @param {String} [ver] install version
     * @param {String} [dir] uninstall directory
     * @public
     */
    uninstalledVer (name, ver, dir) {
        let {error} = child.spawnSync(npmCommand, ['uninstall', ver.length === 0 ? name : `${name}@${ver}`], { cwd: dir });
        if (error) throw error;
    }
};

