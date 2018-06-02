var wtf = require('wtfnode');
var chai = require('chai');
var chaiHttp = require('chai-http');
//var server = require('../server');
var data = require('./product-data')
var conn = require('../routes/db.helper');
//var should = chai.should();

//chai.use(chaiHttp);
process.env.NODE_ENV = 'test';

describe('[Products API Test Cases]', function() {

  beforeEach(() => {
    //console.debug("BEFORE EACH");
  });

  describe('[/api/products-minimum ]', () => {



    beforeEach('Make sure a single user record exists', (done) => {
      conn.connect()
        .then((db) => {
          db.collection(conn.PRODUCTS).deleteMany({})
            .then((err) => {
              db.collection(conn.PRODUCTS).insertAsync(data.products)
                .then((obj) => {
                  done();
                })
            });
        });
    });


    it('[LOGIN] should return 400 when password is not passed', function(done) {
      const data = { userid: 'test' }
      conn.close()
      .then( (obj) => {
        console.log('here1')
        wtf.dump()
        done()
      })
      .catch( (err) => {
        console.log('here2', err)
        wtf.dump()
        done();
      })
      
      // chai.request(server)
      //   .post(LOGIN_URL)
      //   .send(data)
      //   .end(function(err, res) {
      //     res.should.have.status(400);
      //     res.body.should.be.a('object');
      //     res.body.should.have.property('error');
      //     res.body.error.should.have.property('msg');
      //     res.body.error.msg.should.equal('Password is required');
      //     done();
      //   });
    });
  })



});
