const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

const app = require('../app');
const setUpTestConfig = require('./setUpTestConfig');
const TEST_TOKEN = require('./token');

const DISALLOWED_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'eyJpc3MiOiJUZXN0Iiwic3ViIjoiMC4wLjAuMCIsImlhdCI6MTY3Mzk1MDU4OH0.' +
    'Jh494HQ4vCkNjszn5uFH9wz8XE5-F9s5r_Y6yYOt83E';
const INVALID_SIGNATURE_TOKEN = [...TEST_TOKEN.split('.').slice(0, -1), 'signature'].join('.');

describe('Authentication', () => {
    before(setUpTestConfig);
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
