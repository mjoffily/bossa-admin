var chai = require('chai');
var chaiHttp = require('chai-http');
var auth = require('../login/jwt');
var server = require('../server');

var should = chai.should();

chai.use(chaiHttp);
process.env.NODE_ENV = 'test';

describe('[jwt test cases]', function() {

  const VERIFY_TOKEN_URL = '/api/test';

  beforeEach(() => {
    //console.log("BEFORE EACH");
  });

  it('[ENCODE] should return a token', function(done) {
    auth.encodeToken({ data: { userid: 'test@test.com' } })
      .then((token) => {
        should.exist(token);
        token.should.be.a('string');
        done();
      })
      .catch((err) => {
        console.log('This is the error %s', err)
      })
  });

  it('[VerifyToken] should return success in normal scenario', function(done) {
    const data = { userid: 'test@test.com' };
    auth.encodeToken({ data })
      .then((token) => {
        should.exist(token);
        token.should.be.a('string');
        chai.request(server)
          .get(VERIFY_TOKEN_URL)
          .set('x-access-token', token)
          .send()
          .end(function(err, res) {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            console.log('this is res: ', res.body);
            res.body.auth.should.be.true;
            res.body.error_msg.should.be.equal('');
            done();
          })
      })
      .catch((err) => {
        console.log('Error ', err)
      })
  })

  it('[VerifyToken] should return error 403 when token has expired', function(done) {
    this.timeout(4000); // force test timeout to be longer than default 2 seconds
    const expiresIn = 2; // 2 seconds
    const data = { userid: 'test@test.com' };
    auth.encodeToken({ data, expiresIn })
      .then((token) => {
        should.exist(token);
        token.should.be.a('string');
        setTimeout(() => {
          chai.request(server)
            .get(VERIFY_TOKEN_URL)
            .set('x-access-token', token)
            .send()
            .end(function(err, res) {
              should.not.exist(err);
              res.should.have.status(403);
              res.body.should.be.a('object');
              console.log('this is res: ', res.body);
              res.body.auth.should.be.false;
              res.body.error_msg.should.be.equal('jwt expired');
              done();
            })
        }, 3000)
      })
      .catch((err) => {
        console.log('Error ', err)
      })
  })

});
