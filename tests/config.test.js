const assert = require('assert');
const path = require('path');

const config = require('../config');
const setUpTestConfig = require('./setUpTestConfig');
const TEST_TOKEN = require('./token');


describe('Test dynamic config importing', () => {
    before(setUpTestConfig);
    it('should import test environment', () => {
        assert.equal(JSON.stringify(config), JSON.stringify({
            PORT: 3000,
            STORAGE_PATH: path.resolve(__dirname, 'storage'),
            STORAGE_SIZE_LIMIT: 104857600,
            STORAGE_ID: 'Test',
            TOKEN_SALT: 'Salt',
            ALLOWED_TOKENS: ['127.0.0.1'],
            TEST_TOKEN
        }));
    });
});
