const globalConfig = require('../config');
const Config = require('../utils/config.utils');
const TEST_TOKEN = require('./token');

function setUpTestConfig() {
    Object.assign(globalConfig, new Config('.env.test', true), { TEST_TOKEN });
}

module.exports = setUpTestConfig;
