const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect
var server = require('../server');
var wtf = require('wtfnode');
const R = require('ramda')
var should = chai.should();

chai.use(chaiHttp);
process.env.NODE_ENV = 'test';

chai.should();
chai.expect();

process.env.NODE_ENV = 'test';


describe('[Test Product Inventory Validations]', function() {

  const orderWithExistingProducts = [{
      po_id: 25,
      id: 3,
      my_sku: "AN2321FO_r",
      vendor_sku: "AN2321FO",
      qtd: 15,
      cost_in_real: 12,
      exchange_rate: 0.68,
      total_for_product: 180,
      img: "https://cdn.shopify.com/s/files/1/2209/8535/products/AN2321FO_r.jpg?v=1511812680",
      comments: "test",
      product_id: 43766153236,
      cost_in_aud: 8.2176
    },
    {
      po_id: 25,
      id: 2,
      my_sku: "AN2320FO_r&g",
      vendor_sku: "AN2320FO",
      qtd: 300,
      cost_in_real: 14,
      exchange_rate: 0.68,
      total_for_product: 4200,
      img: "https://cdn.shopify.com/s/files/1/2209/8535/products/AN2320FO_r_g.jpg?v=1511812680",
      comments: "",
      product_id: 43766120468,
      cost_in_aud: 9.5872
    }
  ]

  const orderWithNewProducts = [{
      po_id: 33,
      id: 3,
      title: "12 ct Gold Plated earrings",
      my_sku: "__abc",
      vendor_sku: "__abc",
      qtd: 15,
      cost_in_real: 12,
      product_type: "earrings",
      exchange_rate: 0.68,
      total_for_product: 180,
      img: "https://cdn.shopify.com/s/files/1/2209/8535/products/AN2321FO_r.jpg?v=1511812680",
      comments: "test",
      product_id: null,
      variant_id: null,
      cost_in_aud: 8.2176
    },
    {
      po_id: 33,
      id: 2,
      title: "12 ct Gold Plated bracelet",
      my_sku: "__xyz",
      vendor_sku: "__xyz",
      qtd: 300,
      cost_in_real: 14,
      product_type: "bracelet",
      exchange_rate: 0.68,
      total_for_product: 4200,
      img: "https://cdn.shopify.com/s/files/1/2209/8535/products/AN2320FO_r_g.jpg?v=1511812680",
      comments: "",
      product_id: null,
      variant_id: null,
      cost_in_aud: 9.5872
    }
  ]

  const INVENTORY_UPDATE_URL = '/api/inventory-update';
  describe('Test orders with existing products', function() {

    this.timeout(10000)


    it('TBC', function(done) {
      const data = { products: orderWithNewProducts, debug: true }
      chai.request(server)
        .post(INVENTORY_UPDATE_URL)
        .send(data)
        .end(function(err, res) {
          res.should.have.status(200);
          console.log(JSON.stringify(res.body, null, 4))
          res.body.should.be.a('object');
          res.body.total_products_submitted.should.equal(2);
          res.body.total_shopify_products.should.equal(2);
          res.body.total_local_products.should.equal(2);
          res.body.total_cogs.should.equal(2);
          // res.body.error.should.have.property('msg');
          // res.body.error.msg.should.equal('Password is required');
          done();
        });
    });
  })
});
