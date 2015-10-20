'use strict';

import should from 'should';
import sinon from 'sinon';
import npm from '../src/npm.js';
import VersionIterable from '../src/iterator.js';

describe('ver-iterator API', () => {
    before(() => {
        npm.installVer = function installVer () {};
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

    it ('should iterate over the versions successfully', () => {
        npm.publishedVers = sinon.stub().returns(['0.1.0', '0.1.1', '0.2.0', '0.2.1', '0.2.3', '0.3.1']);
        var task = sinon.spy();

        var iter = new VersionIterable(task, {name: 'default', versions: '*' /* iterate all the versions */});
        should([...iter]).not.containEql(false);
    });

    it ('should invoke task function with correct arguments', () => {
        var vers = ['0.1.0', '0.1.1', '0.2.0', '0.2.1', '0.2.3', '0.3.1'];
        npm.publishedVers = sinon.stub().returns(vers);
        var taskCall = sinon.spy();

        var iter = new VersionIterable(taskCall, {name: 'default', versions: '*' /* iterate all the versions */});
        [...iter];

        should(taskCall.callCount).exactly(vers.length);
        for (let i = 0; i < taskCall.callCount; ++i) {
            let call = taskCall.getCall(i);
            let [{version: eachVer}] = call.args;
            should(eachVer).eql(vers[i]);
        }
    });

    it ('should iterate over part of the versions when given specific version range');
    it ('should trigger the before/after event once');
    it ('should trigger beforeEach/afterEach event each time iterating over a version');
    it ('should trigger fatal event when install dependency failed');
    it ('should trigger error event when task function throw an error');
});