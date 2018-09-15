const R = require('ramda')

function validateQtd(product) {
  return product.qtd && product.qtd > 0 ? "" : "Qtd zero is invalid";
}

function validateCostInReal(product) {
  return product.cost_in_real && product.cost_in_real > 0 ? "" : "Cost in R$ is invalid";
}

function validateCostInAUD(product) {
  return product.cost_in_aud && product.cost_in_aud > 0 ? "" : "Cost in AUD is invalid";
}

function validateExchangeRate(product) {
  return product.exchange_rate && product.exchange_rate > 0 ? "" : "Exchange rate is invalid";
}

function validateMySKU(product) {
  return (R.isNil(product.my_sku) || R.isEmpty(product.my_sku)) ? "My SKU cannot be blank" : "";
}

function validateVendorSKU(product) {
  return (R.isNil(product.vendor_sku) || R.isEmpty(product.vendor_sku)) ? "Vendor SKU cannot be blank" :
    "";
}

function validateTitle(product) {
  return (R.isNil(product.title) || R.isEmpty(product.title)) ? "Title cannot be blank" : "";
}

const validateTypes = R.cond([
  [R.equals('earrings'), R.always("")],
  [R.equals('necklace'), R.always("")],
  [R.equals('ring'), R.always("")],
  [R.equals('bracelet'), R.always("")],
  [R.T, R.always("Invalid product type")]
])

function validateNewProduct(product) {
  const emptryErrorList = [];
  const error_list = R.pipe(
      R.append(validateQtd(product)),
      R.append(validateMySKU(product)),
      R.append(validateVendorSKU(product)),
      R.append(validateTypes(product.product_type)),
      R.append(validateTitle(product)),
      R.append(validateCostInReal(product)),
      R.append(validateCostInAUD(product)),
      R.append(validateExchangeRate(product)),
      R.filter((val) => R.isEmpty(val) ? false : true)
    )
    (emptryErrorList)
  return { ...product, error_list }
}

function validateExistingProduct(product) {
  const emptryErrorList = [];
  const error_list = R.pipe(
      R.append(validateQtd(product)),
      R.append(validateMySKU(product)),
      R.append(validateVendorSKU(product)),
      R.append(validateCostInReal(product)),
      R.append(validateCostInAUD(product)),
      R.append(validateExchangeRate(product)),
      R.filter((val) => val == "" ? false : true)
    )
    (emptryErrorList)
  return { ...product, error_list }
}

function validateNewProductsRequest(products) {
  return R.pipe(
    R.map(validateNewProduct),
    R.filter((p) => !R.isEmpty(p.error_list))
  )(products)
}

function validateExistingProductInventoryUpdateRequest(products) {
  return R.pipe(
    R.map(validateExistingProduct),
    R.filter((p) => !R.isEmpty(p.error_list))
  )(products)
}


function validate(products) {

  const newProducts = R.filter((p) => R.isNil(p.product_id))(products)
  const existingProducts = R.filter((p) => !R.isNil(p.product_id))(products)
  const newProductsWithError = validateNewProductsRequest(newProducts)
  const existingProductsWithError = validateExistingProductInventoryUpdateRequest(existingProducts);
  const errors = R.concat(newProductsWithError, existingProductsWithError)
  return errors;
}

module.exports = { validate }
