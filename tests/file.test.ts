import assert from 'assert';
import { Buffer } from 'node:buffer';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { StatusCodes } from 'http-status-codes';

import app from '../app';
import { config } from '../config';
import TEST_TOKEN from './token';
import { storageSpace } from '../utils/storage.utils';
import { setUpTestConfig, setUpTestStorage, clearTestStorage } from './hooks';

function createTestFile(filename: string, content: string) {
  const filePath = path.join(config.STORAGE_PATH, filename);
  fs.writeFileSync(filePath, content);
  storageSpace.calculate();
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
  it('should return 413 Payload Too Large if no File-Size is too large', done => {
    request(app).post('/file/file-for-upload')
      .set('Authorization', `Bearer ${TEST_TOKEN}`)
      .set('File-Size', `${config.STORAGE_SIZE_LIMIT + 1}`)
      .expect(StatusCodes.REQUEST_TOO_LONG, done);
  });
  it('should return error if File-Size is incorrect', done => {
    const buffer = Buffer.from('File content.', 'utf8')
    request(app).post('/file/file-for-upload')
      .set('Authorization', `Bearer ${TEST_TOKEN}`)
      .set('File-Size', `${buffer.length + 1}`)
      .send(buffer)
      .end((err, res) => {
        if (err) return done(err);
        assert(res.statusCode > 400);
        done();
      });
  });
  it('should return 200 OK and correct storage space', done => {
    const buffer = Buffer.from('File content.', 'utf8')
    request(app).post('/file/file-for-upload')
      .set('Authorization', `Bearer ${TEST_TOKEN}`)
      .set('File-Size', `${buffer.length}`)
      .send(buffer)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.body.used, buffer.length);
        done();
      });;
  });
  it('should create backup file if already exists', done => {
    const existingFileContent = 'Existing file content.';
    createTestFile('existing-file', existingFileContent);
    const buffer = Buffer.from('New file content.', 'utf8')
    request(app).post('/file/existing-file')
      .set('Authorization', `Bearer ${TEST_TOKEN}`)
      .set('File-Size', `${buffer.length}`)
      .send(buffer)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.body.used, buffer.length);
        assert.equal(
          storageSpace.reservedForBackups,
          Buffer.from(existingFileContent).length
        );
        assert(fs.existsSync(
          path.join(config.STORAGE_PATH, 'existing-file.bak')
        ));
        done();
      });;
  });
});

describe('DELETE /file/:fileId', () => {
  before(setUpTestConfig);
  beforeEach(setUpTestStorage);
  afterEach(clearTestStorage);

  it('should return 404 Not Found if file not exists', done => {
    request(app).delete('/file/nonexistent-file')
      .set('Authorization', `Bearer ${TEST_TOKEN}`)
      .expect(StatusCodes.NOT_FOUND, done);
  });
  it('should return 200 OK and create backup file', done => {
    createTestFile('file-for-delete', 'File content.');
    request(app).delete('/file/file-for-delete')
      .set('Authorization', `Bearer ${TEST_TOKEN}`)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err);
        assert(!fs.existsSync(
          path.join(config.STORAGE_PATH, 'file-for-delete')
        ));
        assert(fs.existsSync(
          path.join(config.STORAGE_PATH, 'file-for-delete.bak')
        ));
        done();
      });
  });
  it('should return correct storage space', done => {
    createTestFile('file-for-delete', 'File content.');
    const usedSpace = storageSpace.used;
    request(app).delete('/file/file-for-delete')
      .set('Authorization', `Bearer ${TEST_TOKEN}`)
      .expect(StatusCodes.OK)
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.body.used, 0);
        assert.equal(storageSpace.reservedForBackups, usedSpace);
        done();
      });
  });
});
