  const orderWithExistingProduct = {
      "po_id": 25,
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
      "po_id": 25,
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
module.exports = {orderWithNewProduct, orderWithExistingProduct}
