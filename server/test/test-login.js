var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var conn = require('../routes/db.helper');
var wtf = require('wtfnode');
var should = chai.should();

chai.use(chaiHttp);
process.env.NODE_ENV = 'test';


describe('[login test cases]', function() {
  const LOGIN_URL = '/api/login';

  var db;
  
  // before(() => {
  //   conn.connect()
  //     .then((database) => {
  //       db = database;
  //     });
  // })
  
  // after(() => {
  //   conn.close()
  //     .then((obj) => {
  //       console.log('here1')
  //       wtf.dump()
  //     })
  //     .catch((err) => {
  //       console.log('here2', err)
  //       wtf.dump()
  //     })
  // })
  // close HTTP server
  after(async () => {
    server.stop();
  })
  

  beforeEach(() => {
    //console.debug("BEFORE EACH");
  });

  it('[LOGIN] should return 400 when password is not passed', function(done) {
    const data = { userid: 'test' }
    chai.request(server)
      .post(LOGIN_URL)
      .send(data)
      .end(function(err, res) {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('error');
        res.body.error.should.have.property('msg');
        res.body.error.msg.should.equal('Password is required');
        done();
      });
  });

  it('[LOGIN] should return 400 when userid is not passed', function(done) {
    const data = { password: 'test' }
    chai.request(server)
      .post(LOGIN_URL)
      .send(data)
      .end(function(err, res) {
        res.should.have.status(400);
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('error');
        res.body.error.should.have.property('msg');
        res.body.error.msg.should.equal('User is required');
        done();
      });
  });

  it('[LOGIN] should return 400 when both userid and password are missing', function(done) {
    const data = {};
    chai.request(server)
      .post(LOGIN_URL)
      .send(data)
      .end(function(err, res) {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('error');
        res.body.error.should.have.property('msg');
        res.body.error.msg.should.equal('User is required');
        done();
      });
  });

  describe('[Login - DB Preparation]', () => {
    
    const userRecord = { userid: 'mjoffily', password: '$2b$04$hikWsxhpB2Ek6zW9P6OTQOCRiNaSCkk2wWIs7qgysnOJk7FQeMLOW', created_date: new Date() };
    beforeEach('Make sure a single user record exists', (done) => {
      console.log('Before each again');
      conn.connect()
      .then((database) => {
        db = database;
        db.collection(conn.USERS).deleteMany({})
        .then((err) => {
          console.log('DELETED Users %s', JSON.stringify(err, null, 4));
          db.collection(conn.USERS).updateAsync({ userid: userRecord.userid }, userRecord, { upsert: true })
            .then((obj) => {
              console.log('INSERTED User %s', JSON.stringify(obj, null, 4));
              db.collection(conn.USERS).find({ userid: userRecord.userid }).toArrayAsync()
                .then((userObj) => {
                  const { userid, password } = userObj[0];
                  console.log('User created ', userid, password);
                  done();
                })
            });
        });
      })
    })
  
    it('[LOGIN] is successful for correct user and password', (done) => {
      const data = { userid: 'mjoffily', password: 'password1' };
      chai.request(server)
        .post(LOGIN_URL)
        .send(data)
        .end(function(err, res) {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.have.property('status');
          res.body.data.should.have.property('token');
          console.log(res.body.data.token)
          res.body.data.status.should.be.true;
          res.body.data.token.should.be.a('string');
          done();
        });
    })
  
    it('[LOGIN] fails for incorrect password', (done) => {
      const data = { userid: 'mjoffily', password: 'wrong password' };
      chai.request(server)
        .post(LOGIN_URL)
        .send(data)
        .end(function(err, res) {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.have.property('status');
          res.body.data.should.have.property('error_msg');
          res.body.data.status.should.be.false;
          res.body.data.error_msg.should.be.equal('invalid userid and password combination');
          done();
        });
    });
  });
})