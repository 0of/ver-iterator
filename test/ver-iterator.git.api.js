'use strict';

import should from 'should';
import sinon from 'sinon';
import {satisfies} from 'semver';

import git from '../src/git.js';
import VersionIterable from '../src/iterator.js';

describe('version iterator APIs with git source', () => {
    var listTags;

    before(() => {
        listTags = git.listTags;
    });

    beforeEach(() => {
        git.clone = function clone () { };
        git.checkout = function checkout () { };
        git.listTags = listTags;
    });

    it('should have a source name `git`', () => {
        var iter = new VersionIterable(() => { }, { name: 'https://github.com/0of/ver-iterator.git' });
        should(iter.sourceName).eql('git');
    });

    it('should iterate over the versions successfully', () => {
        git.listTags = sinon.stub().returns(['0.1.0', '0.1.1', '0.2.0', '0.2.1', '0.2.3', '0.3.1']);
        var task = sinon.spy();

        var iter = new VersionIterable(task, { name: 'https://github.com/0of/ver-iterator.git', versions: '*' /* iterate all the versions */ });
        should([...iter]).not.containEql(false);
    });

    it('should invoke task function with correct arguments', () => {
        var vers = ['0.1.0', '0.1.1', '0.2.0', '0.2.1', '0.2.3', '0.3.1'];
        git.listTags = sinon.stub().returns(vers);
        var taskCall = sinon.spy();

        var iter = new VersionIterable(taskCall, { name: 'https://github.com/0of/ver-iterator.git', versions: '*' /* iterate all the versions */ });
        [...iter];

        shouldMatch(taskCall, vers);
    });

    it('should iterate over part of the versions when given specific version range', () => {
        var range = '>0.2.0';
        var vers = ['0.1.0', '0.1.1', '0.2.0', '0.2.1', '0.2.3', '0.3.1'];
        var iterVers = vers.filter((v) => { return satisfies(v, range); });

        git.listTags = sinon.stub().returns(vers);
        var taskCall = sinon.spy();

        var iter = new VersionIterable(taskCall, { name: 'https://github.com/0of/ver-iterator.git', range });
        [...iter];

        shouldMatch(taskCall, iterVers);
    });

    it('should iterate over part of the versions when given range filter', () => {
        var vers = ['0.1.0', '0.1.1', '0.2.0', '0.2.1', '0.2.3', '0.3.1'];
        var filter = (v) => { return v != '0.1.0'; };
        var iterVers = vers.filter(filter);

        git.listTags = sinon.stub().returns(vers);
        var taskCall = sinon.spy();

        var iter = new VersionIterable(taskCall, { name: 'https://github.com/0of/ver-iterator.git', range: filter });
        [...iter];

        shouldMatch(taskCall, iterVers);
    });

    it('should have a correct name', () => {
        var iter = new VersionIterable(() => {}, { name: 'https://github.com/0of/ver-iterator.git' });
        should(iter.name).eql('ver-iterator');
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