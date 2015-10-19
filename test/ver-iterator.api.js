'use strict';

import should from 'should';
import npm from '../src/npm.js';
import VersionIterable from '../src/iterator.js';

describe('ver-iterator API', () => {
    before(() => {
        // spy on the npm
        npm.publishedVers = publishedVer.bind(npm);
        npm.installVer = installVer.bind(npm);
    });

    it ('should instantiate iterator successfully', () => {
        var iter = new VersionIterable(() => {}, {name: 'default'});
        should(iter).instanceOf(VersionIterable);
    });

    it ('should throw exception when given invalid task function', () => {
        should(() => {
            new VersionIterable(undefined, {name: 'default'});
        }).throw();
    });
});

function publishedVer () {
    return ['0.1.0', '0.1.1', '0.2.0', '0.2.1', '0.2.3', '0.3.1'];
}

function installVer () {
    // do nothing
}