import assert from 'assert';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';

import app from '../app';
import { config } from '../config';
import TEST_TOKEN from './token';
import { setUpTestConfig, setUpTestStorage, clearTestStorage } from './hooks';

describe('GET /info/space', () => {
  before(setUpTestConfig);
  beforeEach(setUpTestStorage);
  afterEach(clearTestStorage);

  it('should return 200 OK', done => {
    request(app).get('/info/space')
      .set('Authorization', `Bearer ${TEST_TOKEN}`)
      .expect(StatusCodes.OK, done);
  });
  it('should return correct capacity', done => {
    request(app).get('/info/space')
      .set('Authorization', `Bearer ${TEST_TOKEN}`)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.body.capacity, config.STORAGE_SIZE_LIMIT);
        done();
      });
  });
});