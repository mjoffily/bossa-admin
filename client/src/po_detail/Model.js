import { fetchProductsCmd } from './Update'

export function initModel() {
    return [{
        items: [],
        total: 0,
        products: []
    }, fetchProductsCmd];
}

//export default initModel;
