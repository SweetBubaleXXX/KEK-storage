import globalConfig from '../config';
import Config from '../utils/config.utils';
import TEST_TOKEN from './token';

function setUpTestConfig() {
  Object.assign(globalConfig, new Config('.env.test', true), { TEST_TOKEN });
}

export default setUpTestConfig;
