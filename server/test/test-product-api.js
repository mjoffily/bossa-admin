var wtf = require('wtfnode');
var chai = require('chai');
var chaiHttp = require('chai-http');
//var server = require('../server');
var data = require('./product-data')
var conn = require('../routes/db.helper');
var t = require('../routes/api.connect')
var should = chai.should();

//chai.use(chaiHttp);
process.env.NODE_ENV = 'test';

describe('[Products API Test Cases]', function() {

  var db;

  //before(() => {
  //   conn.connect()
  //     .then((database) => {
  //       db = database;
  //     });
  // })

  after(() => {
    conn.close()
      .then((obj) => {
        console.log('here1')
        wtf.dump()
      })
      .catch((err) => {
        console.log('here2', err)
        wtf.dump()
      })
  })

  beforeEach(() => {
    
  })

  describe('[/api/products-minimum - Queries with both cogs and no cogs]', () => {



    beforeEach('Prep database with 3 product records', (done) => {
      conn.connect()
      .then((database) => {
        db = database;
        db.collection(conn.PRODUCTS).deleteMany({})
        .then((err) => {
          db.collection(conn.PRODUCTS).insertAsync(data.products_1)
            .then((obj) => {
              done();
            })
        });
      });
    });


    it('[getProductsLocalMin] Success query ', function(done) {
      t.getProductsLocalMin()
        .then((data) => {
          data.should.be.a('array');
          data.should.have.lengthOf(3)
          data[0].price.should.equal(56)
          data[1].price.should.equal(27)
          data[2].price.should.equal(0)
          console.log(data)
          done();
        })
    });
  })

  describe('[/api/products-minimum - Queries with cogs only (no entries where cogs is absent)]', () => {



    beforeEach('Prep database with 2 product records', (done) => {
      db.collection(conn.PRODUCTS).deleteMany({})
        .then((err) => {
          db.collection(conn.PRODUCTS).insertAsync(data.products_2)
            .then((obj) => {
              done();
            })
        });
    });


    it('[getProductsLocalMin] Success when query returning zero entries is executed', function(done) {
      t.getProductsLocalMin()
        .then((data) => {
          data.should.be.a('array');
          data.should.have.lengthOf(2)
          data[0].price.should.equal(56)
          data[1].price.should.equal(27)
          console.log(data)
          done();
        })
    });
  })

  describe('[/api/products-minimum - Tests for boundary dates on COGS ]', () => {



    beforeEach('Prep database with COGS data', (done) => {
      db.collection(conn.PRODUCTS).deleteMany({})
        .then((err) => {
          db.collection(conn.PRODUCTS).insertAsync(data.products_3)
            .then((obj) => {
              done();
            })
        });
    });


    it('[getProductsLocalMin] Get current cogs value when many exist', function(done) {
      t.getProductsLocalMin()
        .then((data) => {
          data.should.be.a('array');
          data.should.have.lengthOf(1)
          data[0].price.should.equal(3)
          done();
        })
    });
  })



});
