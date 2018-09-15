const chai = require('chai');
const R = require('ramda')

const shopify = require('../../routes/api.shopify');
chai.should();
chai.expect();

process.env.NODE_ENV = 'test';

// https://stackoverflow.com/questions/30405551/how-to-register-a-failed-mocha-test-on-a-promise
// Comments about handling promises in Mocha
//
// For anybody else having trouble with failed assertions not failing unit tests with promises, 
// I learned that you should NOT pass done to the function. Instead, just return the promise:

// it('should handle promises', function(/*no done here*/) {
//
//     return promiseFunction().then(function(data) {
//         // Add your assertions here
//     });
//
//     // No need to catch anything in the latest version of Mocha;
//     // Mocha knows how to handle promises and will see it rejected on failure

// })

describe('[Test Create and Update product information in Shopify]', function() {

// this test relies on the following product to exist in shopify. If this product is ever removed, a new test product 
// will need to be created

  const orderWithExistingProduct = {
      "id": 3,
      "my_sku": "AN2321FO_r",
      "vendor_sku": "AN2321FO",
      "qtd": 1,
      "cost_in_real": 12,
      "exchange_rate": 0.68,
      "total_for_product": 12,
      "img": "https://cdn.shopify.com/s/files/1/2209/8535/products/AN2321FO_r.jpg?v=1511812680",
      "comments": "test",
      "product_id": 1296823550021,
      "variant_id": 12083295027269,
      "cost_in_aud": 8.2176
    }
    
  const orderWithNewProduct = {
      "id": 3,
      "title": "Test Product - Mocha",
      "product_type": "necklace",
      "body_html": "test body html",
      "sale_price": 20.3,
      "my_sku": "AN2321FO_r",
      "vendor_sku": "AN2321FO",
      "qtd": 1,
      "cost_in_real": 12,
      "cost_in_aud": 8.2176,
      "exchange_rate": 0.68,
      "total_for_product": 12,
      "img": null,
      "product_id": null,
      "variant_id": null,
      "comments": "test"
  }

  describe('Test update product quantity use case', () => {

    beforeEach('Set quantity of product to 1 to start tests', () => {
      const a = shopify.putProductQuantity(orderWithExistingProduct, true)
      a.then( (result) => {
        console.log('quantity set for product')
      })
    })

    it('Test update of product variant quantity in shopify', () => {
      return shopify.putProductQuantity(orderWithExistingProduct, false)
      .then( (result) => {
        result.should.have.property('data')
        result.data.should.have.property('product')
        result.data.product.should.be.an('object')
        result.data.product.variants[0].inventory_quantity.should.equal(2)
      })
    });
  })

  describe('Test new product creation', function() {
    // DO NOT use arrow functions when using this. as it will not work.
    // comments here: https://stackoverflow.com/questions/23492043/change-default-timeout-for-mocha#
    this.timeout(10000); // force test timeout to be longer than default 2 seconds
    var productId = 0;
    
    afterEach('Delete Test Mocha product created', () => {
      const a = shopify.deleteProduct(productId)
      a.then( (result) => {
        console.log(`product ${productId} deleted`)
      })
    })



    it('Test new product is setup correctly in shopify', () => {
      return shopify.addNewProduct(orderWithNewProduct, 1)
      .then( (result) => {
        console.log(result)
        result.should.have.property('data')
        result.data.should.have.property('status')
        result.data.should.have.property('product')
        result.data.product.should.be.an('object')
        result.data.product.variants[0].inventory_quantity.should.equal(1)
        // save it so we can delete the product
        productId = result.data.product.id
      })
    });
  })
});

