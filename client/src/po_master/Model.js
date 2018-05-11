import { fetchPurchaseOrdersCmd } from './Update'

export function initModel() {
    return [{
        purchase_orders: []
    }, fetchPurchaseOrdersCmd];
}

