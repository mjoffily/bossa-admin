import * as R from 'ramda';
import { PAGES, navigateToPageMsg } from '../Update'
import { newPurchaseOrderMsg, retrievePurchaseOrderMsg } from '../po_detail/Update'
import { baseURL } from '../lib/mycommons';


export const MSGS = {
    HTTP_FETCH_PURCHASE_ORDERS_SUCCESS: 'HTTP_FETCH_PURCHASE_ORDERS_SUCCESS',
    HTTP_FETCH_PURCHASE_ORDERS_ERROR: 'HTTP_FETCH_PURCHASE_ORDERS_ERROR',
    NEW: 'NEW',
    HTTP_START: 'HTTP_START',
    REFRESH: 'REFRESH',
    CLEAR_ERROR: 'CLEAR_ERROR',
    PO_SELECTED: 'PO_SELECTED'
}

function getPurchaseOrdersUrl() {
  return `${baseURL}/purchase-orders`;
}

const httpStartMsg = {
    msg: MSGS.HTTP_START
}

export const fetchPurchaseOrdersCmd =  {
              request: { method: 'get', url: getPurchaseOrdersUrl() },
              successMsg: httpPurchaseOrdersFetchedMsg,
              errorMsg: httpErrorFetchingPurchaseOrdersMsg,
              httpStartMsg: httpStartMsg,
            
          }


export function newPOMsg() {
    return {
        msg: MSGS.NEW
    }
}

export function refreshMsg() {
    return {
        msg: MSGS.REFRESH
    }
}

export function poSelectedMsg(id) {
    return {
        msg: MSGS.PO_SELECTED,
        id
    }
}

function httpErrorFetchingPurchaseOrdersMsg(error) {
  return {
    type: MSGS.HTTP_FETCH_PURCHASE_ORDERS_ERROR,
    error,
  };
}

function httpPurchaseOrdersFetchedMsg(response) {
    return { msg: MSGS.HTTP_FETCH_PURCHASE_ORDERS_SUCCESS,
             response
           };
}

export function update(msg, model) {
    switch(msg.msg) {
        case MSGS.HTTP_FETCH_PURCHASE_ORDERS_SUCCESS: {
          return [{ ...model, block: false, purchase_orders: R.pathOr({}, ['data'], msg.response) }, null]
        }
        case MSGS.HTTP_ERROR: {
          return [{ ...model, error: msg.error }, null]
        }
        case MSGS.HTTP_START: {
            return [{...model, block: true}, null]
        }
        case MSGS.PO_SELECTED: {
            const commands = null;
            const messagesToPropagate = [navigateToPageMsg(PAGES.PO_DETAIL), retrievePurchaseOrderMsg(msg.id)];
            //fetchPurchaseOrderCmd(msg.id), newPurchaseOrderMsg()]; 
            
            return [model, commands, messagesToPropagate];
        }
        case MSGS.NEW: {
            //return [model, navigateToPageMsg(PAGES.PO_DETAIL, fetchProductsCmd )];
            const commands = null;
            const messagesToPropagate = [navigateToPageMsg(PAGES.PO_DETAIL), newPurchaseOrderMsg()]; 
            return [{...model, _id: null}, commands, messagesToPropagate];
            
        }
        case MSGS.REFRESH: {
            const commands = fetchPurchaseOrdersCmd;
            return [model, commands, null];
            
        }
        default: 
            return [model, null];
    }
}

