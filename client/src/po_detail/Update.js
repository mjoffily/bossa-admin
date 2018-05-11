import * as R from 'ramda';
import { PAGES, navigateToPageMsg } from '../Update'
import { fetchPurchaseOrdersCmd } from '../po_master/Update'
import { NO_PHOTO_IMG, baseURL, ENTER_KEY } from '../lib/mycommons';

export const FORM_PRODUCT = 'PRODUCT';
export const FORM_OTHER_COST = 'FORM_OTHER_COST';

export const MSGS = {
    NEW_ITEM: 'NEW_ITEM',
    NEW_OTHER_COST: 'NEW_OTHER_COST',
    NEW_PO: 'NEW_PO',
    SAVE: 'SAVE',
    OK: 'OK',
    OK_OTHER_COSTS: 'OK_OTHER_COSTS',
    CANCEL: 'CANCEL',
    CANCEL_OTHER_COSTS: 'CANCEL_OTHER_COSTS',
    CLOSE: 'CLOSE',
    INPUT_VENDOR_SKU: 'INPUT_VENDOR_SKU',
    INPUT_MY_SKU: 'INPUT_MY_SKU',
    INPUT_QTD: 'INPUT_QTD',
    INPUT_PRICE: 'INPUT_PRICE',
    INPUT_COMMENTS: 'INPUT_COMMENTS',
    INPUT_DESCRIPTION: 'INPUT_DESCRIPTION',
    EDIT: 'EDIT',
    EDIT_OTHER_COST: 'EDIT_OTHER_COST',
    DELETE: 'DELETE',
    DELETE_OTHER_COST: 'DELETE_OTHER_COST',
    SHOW_ANSWER: 'SHOW_ANSWER',
    PRODUCT_SELECTED: 'PRODUCT_SELECTED',
    FETCH_PRODUCTS: 'FETCH_PRODUCTS',
    HTTP_FETCH_PRODUCTS_SUCCESS: 'HTTP_FETCH_PRODUCTS_SUCCESS',
    HTTP_FETCH_PRODUCTS_ERROR: 'HTTP_FETCH_PRODUCTS_ERROR',
    HTTP_FETCH_PURCHASE_ORDER_SUCCESS: 'HTTP_FETCH_PURCHASE_ORDER_SUCCESS',
    HTTP_FETCH_PURCHASE_ORDER_ERROR: 'HTTP_FETCH_PURCHASE_ORDER_ERROR',
    HTTP_START: 'HTTP_START',
    CLEAR_ERROR: 'CLEAR_ERROR',
    PRINT_PREVIEW: 'PRINT_PREVIEW',
    MINIMISE_ITEM: 'MINIMISE_ITEM',
    RETRIEVE_PURCHASE_ORDER: 'RETRIEVE_PURCHASE_ORDER',
    HTTP_PURCHASE_ORDER_SAVED_SUCCESS: 'HTTP_PURCHASE_ORDER_SAVED_SUCCESS',
    ESCAPE_KEY_PRESSED: 'ESCAPE_KEY_PRESSED',
    EXCHANGE_RATE_CLICKED: 'EXCHANGE_RATE_CLICKED',
    INPUT_EXCHANGE_RATE: 'INPUT_EXCHANGE_RATE',
    LOSE_FOCUS_EXCHANGE_RATE: 'LOSE_FOCUS_EXCHANGE_RATE',
    KEYUP_EXCHANGE_RATE: 'KEYUP_EXCHANGE_RATE',
    COST_AUD_CLICKED: 'COST_AUD_CLICKED',
    INPUT_COST_AUD: 'INPUT_COST_AUD',
    LOSE_FOCUS_COST_AUD: 'LOSE_FOCUS_COST_AUD',
    KEYUP_COST_AUD: 'KEYUP_COST_AUD',
}

function getProductsUrl() {
  return `${baseURL}/products-minimum`;
}

function purchaseOrderUrl() {
  return `${baseURL}/purchase-order`;
}

export const fetchProductsCmd =  {
              request: { url: getProductsUrl() },
              successMsg: httpProductsFetchedMsg,
              errorMsg: httpErrorFetchingProductsMsg,
              httpStartMsg: httpStartMsg,
            
          }

export function fetchPurchaseOrderCmd(id) {
    return {
              request: { url: R.concat(R.concat(purchaseOrderUrl(), '/'), id) },
              successMsg: httpPurchaseOrderFetchedMsg,
              errorMsg: httpErrorFetchingPurchaseOrderMsg,
              httpStartMsg: httpStartMsg,
          }
}

export const okMsg = {
    msg: MSGS.OK
}

export const okOtherCostsMsg = {
    msg: MSGS.OK_OTHER_COSTS
}

export const cancelMsg = {
    msg: MSGS.CANCEL
}

export const cancelOtherCostsMsg = {
    msg: MSGS.CANCEL_OTHER_COSTS
}

export const exchangeRateClickedMsg = {
    msg: MSGS.EXCHANGE_RATE_CLICKED
}

export const loseFocusExchangeRateMsg = {
    msg: MSGS.LOSE_FOCUS_EXCHANGE_RATE
}

export function inputExchangeRateMsg(exchange_rate) {
    return { msg: MSGS.INPUT_EXCHANGE_RATE,
             exchange_rate
           };
}

export function keyUpExchangeRateMsg(key) {
    return { msg: MSGS.KEYUP_EXCHANGE_RATE,
             key
           };
}

export const costAUDClickedMsg = {
    msg: MSGS.COST_AUD_CLICKED
}

export const loseFocusCostAUDMsg = {
    msg: MSGS.LOSE_FOCUS_COST_AUD
}

export function inputCostAUDMsg(cost_aud) {
    return { msg: MSGS.INPUT_COST_AUD,
             cost_aud
           };
}

export function keyUpCostAUDMsg(key) {
    return { msg: MSGS.KEYUP_COST_AUD,
             key
           };
}

export const httpStartMsg = {
    msg: MSGS.HTTP_START
}

export const escapeKeyPressedMsg = {
    msg: MSGS.ESCAPE_KEY_PRESSED
}

export const printPreviewMsg = {
    msg:MSGS.PRINT_PREVIEW
}


export function retrievePurchaseOrderMsg(id) {
    return { 
             msg: MSGS.RETRIEVE_PURCHASE_ORDER,
             id
           }
}

function clearModel(model) {
    const {_id, items, other_costs, nextOtherCostId, total_order_cost, exchange_rate, total_order_cost_in_aud, nextItemId, created_date } = model;
    return {_id, items, other_costs, nextOtherCostId, total_order_cost, exchange_rate, total_order_cost_in_aud, nextItemId, created_date };
}

export function saveCmd(model) {
    // get a new model to save with only the "saveable" values
    const method = model._id ? 'put' : 'post';
    const modelToSave = clearModel(model);
    return {
            
              request: {  method
                        , url: purchaseOrderUrl()
                        , data: modelToSave
                       },
              successMsg: httpPurchaseOrderSavedSuccessfullyMsg,
              errorMsg: httpErrorSavingPurchaseOrderMsg,
              httpStartMsg: httpStartMsg,
          }
          
}

export function closePurchaseOrderMsg() {
    return { msg: MSGS.CLOSE }
}

export function newPurchaseOrderMsg() {
    return { msg: MSGS.NEW_PO }
}

export function httpPurchaseOrderFetchedMsg(response) {
    return { msg: MSGS.HTTP_FETCH_PURCHASE_ORDER_SUCCESS,
             response
           }
}

function httpErrorFetchingPurchaseOrderMsg(error) {
  return {
    type: MSGS.HTTP_ERROR,
    error,
  };
}


export const newItemMsg = {
    msg: MSGS.NEW_ITEM 
};

export const newOtherCostMsg = {
    msg: MSGS.NEW_OTHER_COST 
};

export function showAnswerMsg(id) {
    return { msg: MSGS.SHOW_ANSWER,
    id: id};
}

export function savePurchaseOrderMsg(id) {
    return { msg: MSGS.SAVE,
    id: id};
}

export function productSelectedMsg(sku, id) {
    return { msg: MSGS.PRODUCT_SELECTED,
    id: id,
    sku: sku};
}

export function deleteMsg(id) {
    return { msg: MSGS.DELETE,
    id: id};
}

export function deleteOtherCostMsg(id) {
    return { msg: MSGS.DELETE_OTHER_COST,
    id: id};
}

export function minimiseItemMsg(id) {
    return { msg: MSGS.MINIMISE_ITEM,
    id: id};
}

export function inputVendorSKUMsg(val) {
    return { msg: MSGS.INPUT_VENDOR_SKU,
             val: val
           };
}

export function inputMySKUMsg(val) {
    return { msg: MSGS.INPUT_MY_SKU,
             val
           };
}

export function inputQtdMsg(val) {
    return { msg: MSGS.INPUT_QTD,
             val: val
           };
}

export function inputPriceMsg(val) {
    return { msg: MSGS.INPUT_PRICE,
             val: val
           };
}

export function inputCommentsMsg(val) {
    return { msg: MSGS.INPUT_COMMENTS,
             val: val
           };
}

export function inputDescriptionMsg(val) {
    return { msg: MSGS.INPUT_DESCRIPTION,
             val: val
           };
}

function httpProductsFetchedMsg(response) {
    return { msg: MSGS.HTTP_FETCH_PRODUCTS_SUCCESS,
             response
           };
}

function httpErrorFetchingProductsMsg(error) {
  return {
    type: MSGS.HTTP_ERROR,
    error,
  };
}

function httpPurchaseOrderSavedSuccessfullyMsg(response) {
    return { msg: MSGS.HTTP_PURCHASE_ORDER_SAVED_SUCCESS,
             response
           };
}

function httpErrorSavingPurchaseOrderMsg(error) {
  return {
    type: MSGS.HTTP_ERROR,
    error,
  };
}

export const clearErrorMsg = {
  type: MSGS.CLEAR_ERROR,
};

export function editMsg(id) {
    return { msg: MSGS.EDIT,
             id: id
           };
}

export function editOtherCostMsg(id) {
    return { msg: MSGS.EDIT_OTHER_COST,
             id: id
           };
}


function getNewItem(id) {
    return {
    id: id,
    my_sku: '',
    vendor_sku: '',
    qtd: 0,
    price: 0.0,
    total_for_product: 0.0,
    img: '',
    comments: ''
    }
}

const matchingProducts = R.curry((val, product) => {
    return val.length > 0 && product.my_sku.toUpperCase().startsWith(val.toUpperCase())
})

function validateQtd(model) {
    return (R.either(R.isNil, R.either(R.equals(0), R.isEmpty))(model.qtd)) ? "invalid quantity" : ""; 
}

function validateMySKU(model) {
    return (R.isEmpty(model.my_sku)) ? "invalid 'My SKU'" : ""; 
}

function validate(model) {
    const err_qtd = validateQtd(model)
    const err_my_sku = validateMySKU(model);
    const initialCount = 0;
    const total_errors = R.pipe( R.add(R.isEmpty(err_qtd) ? 0 : 1),
                                 R.add(R.isEmpty(err_my_sku) ? 0 : 1)
                               )(initialCount);
    const validation_errors = {err_qtd, err_my_sku, total_errors}
    return validation_errors;    
}

function adjustDecimal(val) {
    if (R.either(R.isNil, R.isEmpty)(val)) {
        return val;
    }
    if (val.charAt(val.length - 1) === '.') {
        return R.concat(val, '00');
    }
    return val;
}

function calcTotals(items, other_costs) {
    const total1 = R.isNil(items) ? 0 : R.pipe(
                                        R.map( item => item.total_for_product ), 
                                        R.sum,
                                        )(items);

    const total2 = R.isNil(other_costs) ? 0 : R.pipe(
                                              R.map( other_cost => other_cost.price ), 
                                              R.sum,
                                              )(other_costs);

    return (total1 + total2);        

}

function edit(model) {
    const { edit_id, my_sku, vendor_sku, qtd, price, total_for_product, comments, img} = model;
    const items = R.map((item) => {
        if (item.id === edit_id) {
            return { ...item, my_sku, vendor_sku, qtd, price, total_for_product, comments, img };
        }
        return item;
    })(model.items);

    const total_order_cost = calcTotals(items, model.other_costs);
    
    return  { ...model, total_order_cost, items, show_form: false, product_id: null
                        , my_sku: '' , vendor_sku: '', qtd: 0, price: 0, total_for_product: 0
                        , comments: '', img: '', edit_id: null, validation_errors: null }
}

function editOtherCost(model) {
    const {edit_other_cost_id, description, price, comments } = model;
    const other_costs = R.map((other_cost) => {
        if (other_cost.id === edit_other_cost_id) {
            return { ...other_cost, description, price, comments };
        }
        return other_cost;
    })(model.other_costs);

    const total_order_cost = calcTotals(model.items, other_costs);

    return { ...model, total_order_cost, other_costs, show_form: false, description: '', product_id: null, my_sku: ''
             , vendor_sku: '', qtd: 0, price: 0, total_for_product: 0, comments: '', img: ''
             , edit_other_cost_id: null, edit_id: null, validation_errors: null }
}

function add(model) {
    const {product_id, my_sku, vendor_sku, qtd, price, total_for_product, comments, img} = model;
    const newItem = getNewItem(model.nextItemId);
    const item = {...newItem, product_id, my_sku, vendor_sku, qtd, price, total_for_product, comments, img }
    const nextItemId = model.nextItemId + 1;
    const items = R.prepend(item, model.items);
    const total_order_cost = calcTotals(items, model.other_costs);
    return { ...model, nextItemId, total_order_cost, items, product_id: null
                     , show_form: false, my_sku: '', vendor_sku: '', qtd: 0, price: 0
                     , total_for_product: 0, comments: '', img: '', edit_id: null, validation_errors: null }
}

function addOtherCost(model) {
    const {description, price, comments } = model;
    const id = R.isNil(model.nextOtherCostId) ? 1 : model.nextOtherCostId;
    const nextOtherCostId = id + 1;
    const other_cost = {id, description, price, comments }
    const other_costs = R.prepend(other_cost, model.other_costs);
    const total_order_cost = calcTotals(model.items, other_costs);
    return { ...model, total_order_cost, nextOtherCostId, other_costs, description: ''
                     , product_id: null, show_form: false, my_sku: '', vendor_sku: '', qtd: 0, price: 0
                     , total_for_product: 0, comments: '', img: '', edit_id: null, validation_errors: null }
}

export function update(msg, model) {
    switch(msg.msg) {
        case MSGS.FETCH_PRODUCTS: {
          return [model, fetchProductsCmd];
        }
        case MSGS.RETRIEVE_PURCHASE_ORDER: {
            const commands = [fetchPurchaseOrderCmd(msg.id), fetchProductsCmd];
            return [model, commands];
        }
        case MSGS.HTTP_FETCH_PRODUCTS_SUCCESS: {
          return [{ ...model, products: R.pathOr({}, ['data'], msg.response) }, null]
        }
        case MSGS.HTTP_PURCHASE_ORDER_SAVED_SUCCESS: {
          const id = R.pathOr({}, ['data'], msg.response);
          return [{ ...model, _id: id, block: false }, null]
        }
        case MSGS.HTTP_FETCH_PURCHASE_ORDER_SUCCESS: {
            const updatedModel = R.pathOr({}, ['data'], msg.response);
          return [ {...updatedModel, block: false}, null]
        }
        case MSGS.HTTP_ERROR: {
          return [{ ...model, error: msg.error }, null]
        }
        case MSGS.HTTP_START: {
            return [{...model, block: true}, null]
        }
        case MSGS.NEW_PO: {
            
            return [{...model, _id: null, total_order_cost: 0, nextItemId: 1, nextOtherCostId: 1, items: [], other_costs: []
            , show_form: false, form: FORM_PRODUCT, description: '', my_sku: '', vendor_sku: '', qtd: 0, price: 0
            , total_for_product: 0, comments: '', img: NO_PHOTO_IMG, edit_id: null, product_id: null, total: 0
            , validation_errors: null
            }, fetchProductsCmd];
        }
        case MSGS.NEW_ITEM: {
            return [{ ...model, show_form: true, form: FORM_PRODUCT, description: '', my_sku: '', vendor_sku: '', qtd: 0, price: 0, total_for_product: 0, comments: '', img: NO_PHOTO_IMG, edit_id: null }, null]
        }
        case MSGS.NEW_OTHER_COST: {
            return [{ ...model, show_form: true, form: FORM_OTHER_COST, description: '', my_sku: '', vendor_sku: '', qtd: 0, price: 0, total_for_product: 0, comments: '', img: NO_PHOTO_IMG, edit_id: null }, null]
        }
        case MSGS.EDIT: {
            const idx = R.findIndex(R.propEq('id', msg.id))(model.items);
            const item = model.items[idx];
            const { my_sku, vendor_sku, qtd, price, total_for_product, comments, img } = item;
            return [{...model, edit_id: msg.id, show_form: true, form: FORM_PRODUCT, my_sku, vendor_sku, qtd, price, total_for_product, comments, img  }, null]
        }
        case MSGS.EDIT_OTHER_COST: {
            const idx = R.findIndex(R.propEq('id', msg.id))(model.other_costs);
            const other_cost = model.other_costs[idx];
            const { description, price, comments } = other_cost;
            return [{...model, edit_other_cost_id: msg.id, show_form: true, form: FORM_OTHER_COST, description, price, comments  }, null]
        }
        case MSGS.SAVE: {
            return [model, saveCmd(model)];
        }
        case MSGS.OK: {
            const validation_errors = validate(model);
            const { total_errors } = validation_errors;
            if (total_errors > 0) {
                return [{...model, validation_errors}, null, null];
            }
            const { edit_id } = model;
            const updatedModel = R.isNil(edit_id) ? add(model) : edit(model);
            //return [updatedModel, saveCmd(updatedModel)];
            return [updatedModel, null];
        }
        case MSGS.OK_OTHER_COSTS: {
            //const validation_errors = validate(model);
            // const { total_errors } = validation_errors;
            // if (total_errors > 0) {
            //     return [{...model, validation_errors}, null, null];
            // }
            
            const { edit_other_cost_id } = model;
            const updatedModel = R.isNil(edit_other_cost_id) ? addOtherCost(model) : editOtherCost(model);
            //return [updatedModel, saveCmd(updatedModel)];
            return [updatedModel, null];
        }
        case MSGS.CANCEL: {
            return [{ ...model, show_form: false, my_sku: '', vendor_sku: '', qtd: 0, price: 0, total_for_product: 0, comments: '', img: '', description: '', edit_id: null, edit_other_cost_id: null, validation_errors: null }, null]
        }
        case MSGS.CANCEL_OTHER_COSTS: {
            return [{ ...model, show_form: false, my_sku: '', vendor_sku: '', qtd: 0, price: 0, total_for_product: 0, comments: '', img: '', description: '', edit_id: null, edit_other_cost_id: null, validation_errors: null }, null]
        }
        
        case MSGS.MINIMISE_ITEM: {
            const idx = R.findIndex(R.propEq('id', msg.id))(model.items);
            const newitem = {...model.items[idx] };
            return [{...model, items: R.update(idx, newitem, model.items) }, null]
        }
        case MSGS.INPUT_MY_SKU: {
            const filteredProducts = R.filter(matchingProducts(msg.val), model.products);
            return [{...model, my_sku: msg.val, filtered_products: filteredProducts, show_dropdown: filteredProducts.length > 0 }, null];
        }
        case MSGS.PRODUCT_SELECTED: {
            const productIndex = R.findIndex(R.propEq('my_sku', msg.sku))(model.products);
            const {product_id, price, photo} = model.products[productIndex];
            const img = R.isEmpty(photo) ? NO_PHOTO_IMG : photo;
            const vendor_sku = msg.sku.substring(0, msg.sku.indexOf('_'));
            //const {my_sku}newitem = {...model.items[idx], my_sku: msg.sku, price: price, vendor_sku: vendorSKU, img: imgURL, filtered_products: [], show_dropdown: false};
            return [{...model, product_id, my_sku: msg.sku, price, vendor_sku, img, filtered_products: [], show_dropdown: false }, null];
        }
        case MSGS.INPUT_VENDOR_SKU: {
            return [{...model, vendor_sku: msg.val }, null];
        }
        case MSGS.INPUT_COMMENTS: {
            const comments = msg.val;
            return [{...model, comments }, null];
        }
        case MSGS.INPUT_DESCRIPTION: {
            const description = msg.val;
            return [{...model, description }, null];
        }
        case MSGS.INPUT_QTD: {
            const qtd = R.pipe(
                            parseInt, 
                            R.defaultTo(0),
                          )(msg.val);
            const total_for_product = qtd * model.price;
            return [{...model, qtd, total_for_product }, null];
            
        }
        case MSGS.INPUT_PRICE: {
            const { val } = msg;
            const price = R.pipe(
                            adjustDecimal,
                            parseFloat, 
                            R.defaultTo(-1),
                          )(val);
            const newPrice = (price >= 0) ? val : '0';
                
            const total_for_product = (price * model.qtd)
            return [{...model, price: newPrice, total_for_product }, null];
        }
        case MSGS.CLOSE: {
            const commands = null;
            const messagesToPropagate = [navigateToPageMsg(PAGES.PO_MASTER)]; 
            return [model, commands, messagesToPropagate];
        }
        case MSGS.DELETE: {
            const idx = R.findIndex(R.propEq('id', msg.id))(model.items);
            return [{...model, items: R.remove(idx, 1, model.items) }, null];
        }
        case MSGS.DELETE_OTHER_COST: {
            const idx = R.findIndex(R.propEq('id', msg.id))(model.other_costs);
            return [{...model, other_costs: R.remove(idx, 1, model.other_costs) }, null];
        }
        case MSGS.PRINT_PREVIEW: {
            const print_preview_model = R.pipe(
                                             R.map( (item) => {
                                                       return {vendor_sku: item.vendor_sku, qtd: item.qtd, price: item.price, total_for_product: item.total_for_product, comments: item.comments} 
                                                    } ),
                                             R.sortBy( R.compose(R.toUpper, R.prop('vendor_sku')))
                                             )(model.items);
            return [{ ...model, print_preview_model }, null, null];
            
        }
        case MSGS.ESCAPE_KEY_PRESSED: {
            return [{ ...model, print_preview_model: null }, null, null];
        }
        case MSGS.EXCHANGE_RATE_CLICKED: {
            return [{ ...model, edit_exchange_rate: true }, null, null];
        }
        case MSGS.COST_AUD_CLICKED: {
            return [{ ...model, edit_total_order_cost_in_aud: true }, null, null];
        }
        case MSGS.INPUT_EXCHANGE_RATE: {
            const { exchange_rate } = msg;
            const rate = R.pipe(
                            parseFloat, 
                            R.defaultTo(-1),
                          )(exchange_rate);
            const newExchangeRate = (rate >= 0) ? exchange_rate : '0';
                
            const total_order_cost_in_aud = (rate * model.total_order_cost).toFixed(2);
            // calculate the cost in AUD of each product
            const items = R.map( (item) => {
                return {...item, cost_in_aud: (rate * item.price) }
                })(model.items);
            // calculate the cost in AUD of each "other cost"
            const other_costs = R.pipe(
                                        R.when(R.isNil, []),
                                        R.map( (other_cost) => { return {...other_cost, cost_in_aud: (rate * other_cost.price) } } )
                                      )(model.other_costs);
            return [{...model, items, other_costs, total_order_cost_in_aud, exchange_rate: newExchangeRate }, null];

        }
        case MSGS.INPUT_COST_AUD: {
            const { cost_aud } = msg;
            const amt = R.pipe(
                            parseFloat, 
                            R.defaultTo(-1),
                          )(cost_aud);
            const newTotalCostAUD = (amt >= 0) ? cost_aud : '0';
                
            const exchange_rate = (amt / model.total_order_cost).toFixed(4);
            // calculate the cost in AUD of each product
            const items = R.map( (item) => {
                return {...item, cost_in_aud: (exchange_rate * item.price) }
                })(model.items);
            // calculate the cost in AUD of each "other cost"
            const other_costs = R.pipe(
                                        R.when(R.isNil, []),
                                        R.map( (other_cost) => { return {...other_cost, cost_in_aud: (exchange_rate * other_cost.price) } } )
                                      )(model.other_costs);
            return [{...model, items, other_costs, total_order_cost_in_aud: newTotalCostAUD, exchange_rate }, null];

        }
        case MSGS.KEYUP_EXCHANGE_RATE: {
            const { key } = msg;
            return key === ENTER_KEY ? [{ ...model, edit_exchange_rate: false }, null, null] : [model, null, null]
        }
        case MSGS.KEYUP_COST_AUD: {
            const { key } = msg;
            return key === ENTER_KEY ? [{ ...model, edit_total_order_cost_in_aud: false }, null, null] : [model, null, null]
        }
        case MSGS.LOSE_FOCUS_EXCHANGE_RATE: {
            return [{ ...model, edit_exchange_rate: false }, null, null];
        }
        case MSGS.LOSE_FOCUS_COST_AUD: {
            return [{ ...model, edit_total_order_cost_in_aud: false }, null, null];
        }
        
        default: 
            return [model, null];
    }
  return model;
}

