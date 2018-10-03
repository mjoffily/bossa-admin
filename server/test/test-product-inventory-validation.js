const chai = require('chai');
const expect = require('chai').expect
const R = require('ramda')

const inventory = require('../routes/product-inventory/product-inventory');
chai.should();
chai.expect();

process.env.NODE_ENV = 'automated_test';


describe('[Test Product Inventory Validations]', function() {

  const orderWithExistingProducts = [{
      "po_id": 25,
      "id": 3,
      "my_sku": "AN2321FO_r",
      "vendor_sku": "AN2321FO",
      "qtd": 15,
      "cost_in_real": 12,
      "exchange_rate": 0.68,
      "total_for_product": 180,
      "img": "https://cdn.shopify.com/s/files/1/2209/8535/products/AN2321FO_r.jpg?v=1511812680",
      "comments": "test",
      "product_id": 43766153236,
      "cost_in_aud": 8.2176
    },
    {
      "po_id": 25,
      "id": 2,
      "my_sku": "AN2320FO_r&g",
      "vendor_sku": "AN2320FO",
      "qtd": 300,
      "cost_in_real": 14,
      "exchange_rate": 0.68,
      "total_for_product": 4200,
      "img": "https://cdn.shopify.com/s/files/1/2209/8535/products/AN2320FO_r_g.jpg?v=1511812680",
      "comments": "",
      "product_id": 43766120468,
      "cost_in_aud": 9.5872
    }
  ]

  const orderWithNewProducts = [{
      "id": 3,
      "title": "12 ct Gold Plated earrings",
      "my_sku": "abc",
      "vendor_sku": "abc",
      "qtd": 15,
      "cost_in_real": 12,
      "product_type": "earrings",
      "exchange_rate": 0.68,
      "total_for_product": 180,
      "img": "https://cdn.shopify.com/s/files/1/2209/8535/products/AN2321FO_r.jpg?v=1511812680",
      "comments": "test",
      "product_id": null,
      "cost_in_aud": 8.2176
    },
    {
      "id": 2,
      "title": "12 ct Gold Plated bracelet",
      "my_sku": "xyz",
      "vendor_sku": "xyz",
      "qtd": 300,
      "cost_in_real": 14,
      "product_type": "bracelet",
      "exchange_rate": 0.68,
      "total_for_product": 4200,
      "img": "https://cdn.shopify.com/s/files/1/2209/8535/products/AN2320FO_r_g.jpg?v=1511812680",
      "comments": "",
      "product_id": null,
      "cost_in_aud": 9.5872
    }
  ]

  describe('Test orders with existing products', () => {

    it('Will be empty when no errors are found', function(done) {
      const r = inventory.validate(orderWithExistingProducts)
      expect(r).to.be.an('array');
      expect(r).to.be.empty;
      done();
    });

    it('Will report error when qtd field is not found', function(done) {
      const productsList = R.map(R.omit(['qtd']))(orderWithExistingProducts)
      const r = inventory.validate(productsList)
      expect(r).to.not.be.empty;
      expect(r).to.be.an('array');
      r.should.have.lengthOf(2);
      r[0].error_list.should.have.lengthOf(1);
      r[0].id.should.equal(3) // correct entry
      r[0].error_list[0].should.equal('Qtd zero is invalid');
      r[1].error_list.should.have.lengthOf(1);
      r[1].id.should.equal(2) // correct entry
      r[1].error_list[0].should.equal('Qtd zero is invalid');
      done();
    });

    it('Will report error when exchange rate field is not found', function(done) {
      const productsList = R.map(R.omit(['exchange_rate']))(orderWithExistingProducts)
      const r = inventory.validate(productsList)
      expect(r).to.not.be.empty;
      expect(r).to.be.an('array');
      r.should.have.lengthOf(2);
      r[0].error_list.should.have.lengthOf(1);
      r[0].id.should.equal(3) // correct entry
      r[0].error_list[0].should.equal('Exchange rate is invalid');
      r[1].error_list.should.have.lengthOf(1);
      r[1].id.should.equal(2) // correct entry
      r[1].error_list[0].should.equal('Exchange rate is invalid');
      done();
    });

    it('Will report error when vendor SKU field is not found', function(done) {
      const productsList = R.map(R.omit(['vendor_sku']))(orderWithExistingProducts)
      const r = inventory.validate(productsList)
      expect(r).to.not.be.empty;
      expect(r).to.be.an('array');
      r.should.have.lengthOf(2);
      r[0].error_list.should.have.lengthOf(1);
      r[0].id.should.equal(3) // correct entry
      r[0].error_list[0].should.equal('Vendor SKU cannot be blank');
      r[1].error_list.should.have.lengthOf(1);
      r[1].id.should.equal(2) // correct entry
      r[1].error_list[0].should.equal('Vendor SKU cannot be blank');
      done();
    });

    it('Will report error when my SKU field is not found', function(done) {
      const productsList = R.map(R.omit(['my_sku']))(orderWithExistingProducts)
      const r = inventory.validate(productsList)
      expect(r).to.not.be.empty;
      expect(r).to.be.an('array');
      r.should.have.lengthOf(2);
      r[0].error_list.should.have.lengthOf(1);
      r[0].id.should.equal(3) // correct entry
      r[0].error_list[0].should.equal('My SKU cannot be blank');
      r[1].error_list.should.have.lengthOf(1);
      r[1].id.should.equal(2) // correct entry
      r[1].error_list[0].should.equal('My SKU cannot be blank');
      done();
    });

    it('Will report error when Cost In AUD field is not found', function(done) {
      const productsList = R.map(R.omit(['cost_in_aud']))(orderWithExistingProducts)
      const r = inventory.validate(productsList)
      expect(r).to.not.be.empty;
      expect(r).to.be.an('array');
      r.should.have.lengthOf(2);
      r[0].error_list.should.have.lengthOf(1);
      r[0].id.should.equal(3) // correct entry
      r[0].error_list[0].should.equal('Cost in AUD is invalid');
      r[1].error_list.should.have.lengthOf(1);
      r[1].id.should.equal(2) // correct entry
      r[1].error_list[0].should.equal('Cost in AUD is invalid');
      done();
    });

    it('Will report error when Cost In Real field is not found', function(done) {
      const productsList = R.map(R.omit(['cost_in_real']))(orderWithExistingProducts)
      const r = inventory.validate(productsList)
      expect(r).to.not.be.empty;
      expect(r).to.be.an('array');
      r.should.have.lengthOf(2);
      r[0].error_list.should.have.lengthOf(1);
      r[0].id.should.equal(3) // correct entry
      r[0].error_list[0].should.equal('Cost in R$ is invalid');
      r[1].error_list.should.have.lengthOf(1);
      r[1].id.should.equal(2) // correct entry
      r[1].error_list[0].should.equal('Cost in R$ is invalid');
      done();
    });

  })
  
  describe('Test orders with new products', () => {
    it('Will be empty when no errors are found', function(done) {
      const r = inventory.validate(orderWithNewProducts)
      console.log(r)
      expect(r).to.be.an('array');
      expect(r).to.be.empty;
      done();
    });
    
    it('Will report error when Product Type field is not found ', function(done) {
      const productsList = R.map(R.omit(['product_type']))(orderWithNewProducts)
      const r = inventory.validate(productsList)
      expect(r).to.not.be.empty;
      expect(r).to.be.an('array');
      r.should.have.lengthOf(2);
      r[0].error_list.should.have.lengthOf(1);
      r[0].id.should.equal(3) // correct entry
      r[0].error_list[0].should.equal('Invalid product type');
      r[1].error_list.should.have.lengthOf(1);
      r[1].id.should.equal(2) // correct entry
      r[1].error_list[0].should.equal('Invalid product type');
      done();
    });

    it('Will report error when Product Type field is blank ', function(done) {
      const productsList = R.map((a) => {return {...a, product_type: ''}})(orderWithNewProducts)
      const r = inventory.validate(productsList)
      expect(r).to.not.be.empty;
      expect(r).to.be.an('array');
      r.should.have.lengthOf(2);
      r[0].error_list.should.have.lengthOf(1);
      r[0].id.should.equal(3) // correct entry
      r[0].error_list[0].should.equal('Invalid product type');
      r[1].error_list.should.have.lengthOf(1);
      r[1].id.should.equal(2) // correct entry
      r[1].error_list[0].should.equal('Invalid product type');
      done();
    });

    it('Will report no error when earrings Product Type is validated ', function(done) {
      const productsList = R.map((a) => {return {...a, product_type: 'earrings'}})(orderWithNewProducts)
      const r = inventory.validate(productsList)
      expect(r).to.be.an('array');
      expect(r).to.be.empty;
      done()
    });

    it('Will report no error when bracelet Product Type is validated ', function(done) {
      const productsList = R.map((a) => {return {...a, product_type: 'bracelet'}})(orderWithNewProducts)
      const r = inventory.validate(productsList)
      expect(r).to.be.an('array');
      expect(r).to.be.empty;
      done()
    });
    it('Will report no error when necklace Product Type is validated ', function(done) {
      const productsList = R.map((a) => {return {...a, product_type: 'necklace'}})(orderWithNewProducts)
      const r = inventory.validate(productsList)
      expect(r).to.be.an('array');
      expect(r).to.be.empty;
      done()
    });
    it('Will report no error when ring Product Type is validated ', function(done) {
      const productsList = R.map((a) => {return {...a, product_type: 'ring'}})(orderWithNewProducts)
      const r = inventory.validate(productsList)
      expect(r).to.be.an('array');
      expect(r).to.be.empty;
      done()
    });
  })
});

