const request = require('supertest');
const app = require('./app'); // assuming your app is defined in a file named app.js
const assert = require('assert');

describe('GET /search', function () {
  let server;
  before(function (done) {
    server = app.listen(0, function () {
      done();
    });
  });
  after(function () {
    server.close();
  });
  it('responds with 404 for a non-existent file', function (done) {
    request(server)
      .get('/search?q=okay&file=abcd.txt')
      .expect(404, done);
  });
  it('responds with 200 for a valid file search', function (done) {
    request(server)
    .get('/search?q=okay&file=filetest.txt')
    .expect(200, done);
  });
  it('No Special Character ALLOWED In Searched Word', function (done) {
    request(server)
    .get('/search?q=okay,hello&file=filetest.txt')
    .expect(400, done);
  });
});

describe('POST /upload', function () {
    let server;
  
    beforeEach(function (done) {
      server = app.listen(0, function () {
        done();
      });
    });
  
    afterEach(function () {
      server.close();
    });
  
    it('responds with 200 for a valid file upload', function (done) {
      request(server)
        .post('/upload')
        .attach('file', 'abcde.txt')
        .expect(200, done);
    });
  
    it('responds with 405 for file extension not allowed', function (done) {
      request(server)
        .post('/upload')
        .attach('file', 'one.csv')
        .expect(405, done);
    });

    it('responds with 404 for no file attached', function (done) {
        request(server)
          .post('/upload')
          .attach('file', '')
          .expect(function(res) {
            let validStatusCodes = [404, 405,400];
            if (validStatusCodes.indexOf(res.status) === -1) {
              throw new Error('Expected ' + validStatusCodes.join(' or ') + ' but got ' + res.status);
            }
          })
          .end(done);
      });
  });
  

