'use strict';

import should from 'should';
import sinon from 'sinon';
import {satisfies} from 'semver';

import npm from '../src/npm.js';
import VersionIterable from '../src/iterator.js';

describe('ver-iterator API', () => {
    beforeEach(() => {
        npm.installVer = function installVer () {};
    });

    it ('should instantiate iterator successfully', () => {
        new VersionIterable(() => {}, {name: 'default'});
        // should(iter).instanceOf(VersionIterable);
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

        shouldMatch(taskCall, vers);
    });

    it ('should iterate over part of the versions when given specific version range', () => {
        var range = '>0.2.0';
        var vers = ['0.1.0', '0.1.1', '0.2.0', '0.2.1', '0.2.3', '0.3.1'];
        var iterVers = vers.filter((v) => { return satisfies(v, range); });

        npm.publishedVers = sinon.stub().returns(vers);
        var taskCall = sinon.spy();

        var iter = new VersionIterable(taskCall, {name: 'default', range});
        [...iter];

        shouldMatch(taskCall, iterVers);
    });

    it ('should trigger the before/after event once', () => {
        npm.publishedVers = sinon.stub().returns(['0.1.0', '0.1.1', '0.2.0', '0.2.1', '0.2.3', '0.3.1']);
        var before = sinon.spy()
          , after = sinon.spy();

        var iter = new VersionIterable(() => {}, {name: 'default', versions: '*' /* iterate all the versions */});
        iter.on('before', before);
        iter.on('after', after);

        [...iter];

        should(before.calledOnce).be.true;
        should(after.calledOnce).be.true;
    });

    it ('should trigger beforeEach/afterEach event each time iterating over a version', () => {
        var vers = ['0.1.0', '0.1.1', '0.2.0', '0.2.1', '0.2.3', '0.3.1'];
        npm.publishedVers = sinon.stub().returns(vers);

        var beforeEach = sinon.spy()
          , afterEach = sinon.spy();

        var iter = new VersionIterable(() => {}, {name: 'default', versions: '*' /* iterate all the versions */});
        iter.on('beforeEach', beforeEach);
        iter.on('afterEach', afterEach);

        [...iter];

        should(beforeEach.callCount).exactly(vers.length);
        should(afterEach.callCount).exactly(vers.length);
    });


    it ('should trigger `failed` event when task function throw an error', () => {
        var vers = ['0.1.0', '0.1.1', '0.2.0', '0.2.1', '0.2.3', '0.3.1'];
        npm.publishedVers = sinon.stub().returns(vers);

        var failed = sinon.spy();
        var iter = new VersionIterable(sinon.stub().throws(), {name: 'default', versions: '*' /* iterate all the versions */});
        iter.on('failed', failed);

        should([...iter]).not.containEql(true);
        should(failed.callCount).exactly(vers.length);
    });

    it ('should trigger fatal event when install dependency failed', () => {
        npm.publishedVers = sinon.stub().returns(['0.1.0']);
        npm.installVer = sinon.stub().throws();

        var fatal = sinon.spy();

        var iter = new VersionIterable(() => {}, {name: 'default', versions: '*' /* iterate all the versions */});
        iter.on('fatal', fatal);

        [...iter];

        should(fatal.calledOnce).be.true;
    });
});

function shouldMatch (spy, versions) {
    should(spy.callCount).exactly(versions.length);
    for (let i = 0; i < spy.callCount; ++i) {
        let call = spy.getCall(i);
        let [{version: eachVer}] = call.args;
        should(eachVer).eql(versions[i]);
    }
}