'use strict';

import should from 'should';
import sinon from 'sinon';

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
});