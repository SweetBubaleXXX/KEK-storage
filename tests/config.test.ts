import assert from 'assert';

import config from '../config';
import setUpTestConfig from './setUpTestConfig';

describe('Test dynamic config importing', () => {
  before(setUpTestConfig);
  it('should import test environment', () => {
    assert.equal(config.STORAGE_ID, 'Test');
  });
});
