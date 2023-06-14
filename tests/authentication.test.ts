import request from 'supertest';
import { StatusCodes } from 'http-status-codes';

import app from '../app';
import setUpTestConfig from './setUpTestConfig';
import setUpTestStorage from './setUpTestStorage';
import clearTestStorage from './clearTestStorage';
import TEST_TOKEN from './token';

const DISALLOWED_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJpc3MiOiJUZXN0Iiwic3ViIjoiMC4wLjAuMCIsImlhdCI6MTY3Mzk1MDU4OH0.' +
  'Jh494HQ4vCkNjszn5uFH9wz8XE5-F9s5r_Y6yYOt83E';
const INVALID_SIGNATURE_TOKEN = [...TEST_TOKEN.split('.').slice(0, -1), 'signature'].join('.');

describe('Authentication', () => {
  before(setUpTestConfig);
  beforeEach(setUpTestStorage);
  afterEach(clearTestStorage);

  it('should return 401 Unauthorized if no auth header', done => {
    request(app).get('/info/space')
      .expect(StatusCodes.UNAUTHORIZED, done);
  });
  it('should return 403 Forbidden if token not in allowed tokens', done => {
    request(app).get('/info/space')
      .set('Authorization', `Bearer ${DISALLOWED_TOKEN}`)
      .expect(StatusCodes.FORBIDDEN, done)
  });
  it('should return 403 Forbidden if token signature is invalid', done => {
    request(app).get('/info/space')
      .set('Authorization', `Bearer ${INVALID_SIGNATURE_TOKEN}`)
      .expect(StatusCodes.FORBIDDEN, done)
  });
});
