import child from 'child_process';
import path from 'path';

/**
 * simple git cli wrapper
 * all callings are sync
 */
export default {

    /**
     * git clone from specific URL
     *
     * @param {String} [url] git repo URL
     * @param {String} [dir] the dir the repo cloned into
     * @public
     */
    clone (url, dir) {
        child.execSync(`git clone ${url}`, {cwd: path.resolve(dir) });
    },

    /**
     * git list all the tags
     *
     * @param {String} [localRepoDir] local repo dir
     * @public
     */
    listTags (localRepoDir) {
        let stdout = child.execSync('git tag -l', {cwd: path.resolve(localRepoDir) });
        return stdout.toString().match(/[^\r\n]+/g)
                                .filter((v) => { return v.length !== 0; })
                                .map((v) => { return v.trim(); });
    },

    /**
     * git checkout
     *
     * @param {String} [branch] branch name
     * @param {String} [localRepoDir] local repo dir
     * @public
     */
    checkout (branch, localRepoDir) {
        child.execSync(`git checkout ${branch}`, {cwd: path.resolve(localRepoDir) });
    }

};

