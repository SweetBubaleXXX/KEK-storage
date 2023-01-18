const assert = require('assert');
const { Buffer } = require('node:buffer');
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const { StatusCodes } = require('http-status-codes');

const app = require('../app');
const config = require('../config');
const setUpTestConfig = require('./setUpTestConfig');
const setUpTestStorage = require('./setUpTestStorage');
const clearTestStorage = require('./clearTestStorage');
const TEST_TOKEN = require('./token');

function createTestFile(filename, content) {
    const filePath = path.join(config.STORAGE_PATH, filename);
    fs.writeFileSync(filePath, content);
}

describe('GET /file/:fileId', () => {
    before(setUpTestConfig);
    beforeEach(setUpTestStorage);
    afterEach(clearTestStorage);

    it('should return 404 Not Found if file not exists', done => {
        request(app).get('/file/nonexistent-file')
            .set('Authorization', `Bearer ${TEST_TOKEN}`)
            .expect(StatusCodes.NOT_FOUND, done);
    });
    it('should send correct file', done => {
        const fileContent = 'File content.';
        createTestFile('existing-file', fileContent);
        request(app).get('/file/existing-file')
            .set('Authorization', `Bearer ${TEST_TOKEN}`)
            .expect(StatusCodes.OK)
            .end((err, res) => {
                if (err) return done(err);
                assert.equal(res.text, fileContent);
                done();
            });
    });
});

describe('POST /file/:fileId', () => {
    before(setUpTestConfig);
    beforeEach(setUpTestStorage);
    afterEach(clearTestStorage);

    it('should return 411 Length Required if no File-Size header', done => {
        request(app).post('/file/file-for-upload')
            .set('Authorization', `Bearer ${TEST_TOKEN}`)
            .expect(StatusCodes.LENGTH_REQUIRED, done);
    });
    it('should return 413 Payload Too Large if no File-Size header', done => {
        request(app).post('/file/file-for-upload')
            .set('Authorization', `Bearer ${TEST_TOKEN}`)
            .set('File-Size', config.STORAGE_SIZE_LIMIT + 1)
            .expect(StatusCodes.REQUEST_TOO_LONG, done);
    });
    it('should return error if File-Size is incorrect', done => {
        const buffer = Buffer.from('File content.', 'utf8')
        request(app).post('/file/file-for-upload')
            .set('Authorization', `Bearer ${TEST_TOKEN}`)
            .set('File-Size', buffer.length+1)
            .send(buffer)
            .end((err, res) => {
                if (err) return done(err);
                assert(res.statusCode > 400);
                done();
            });
    });
    it('should return 200 OK', done => {
        const buffer = Buffer.from('File content.', 'utf8')
        request(app).post('/file/file-for-upload')
            .set('Authorization', `Bearer ${TEST_TOKEN}`)
            .set('File-Size', buffer.length)
            .send(buffer)
            .expect(StatusCodes.OK, done);
    });
});
