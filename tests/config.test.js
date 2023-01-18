const assert = require('assert');

const config = require('../config');
const setUpTestConfig = require('./setUpTestConfig');

describe('Test dynamic config importing', () => {
    before(setUpTestConfig);
    it('should import test environment', () => {
        assert.equal(config.STORAGE_ID, 'Test');
    });
});
