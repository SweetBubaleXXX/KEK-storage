const assert = require('assert');
const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

const app = require('../app');
const config = require('../config');
const setUpTestConfig = require('./setUpTestConfig');
const TEST_TOKEN = require('./token');

describe('GET /info/space', () => {
    before(setUpTestConfig);
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