'use strict';

import should from 'should';
import VersionIterable from '../src/iterator.js';

describe('common ver-iterator API', () => {
    describe('instantiate', () => {
        it('should instantiate iterator successfully', () => {
            var iter = new VersionIterable(() => { }, { name: 'default' });
            should(iter).instanceOf(VersionIterable);
        });

        it('should throw exception when given invalid task function', () => {
            should(() => {
                new VersionIterable(undefined, { name: 'default' });
            }).throw();
        });
    });
});
