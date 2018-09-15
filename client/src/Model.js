import * as R from 'ramda'
import { initModel as initModelPOMaster } from './po_master/Model';
import { fetchPurchaseOrdersCmd, refreshMsg } from './po_master/Update';
import { initModel as initModelLogin } from './login/Model';
import { initModel as initModelPODetail } from './po_detail/Model';
import { retrievePurchaseOrderMsg, fetchPurchaseOrderCmd } from './po_detail/Update';

import { PAGES } from './Update';

function initCommandPODetail(url) {
    const idx = R.lastIndexOf('/', url)
    console.log('idx: ', idx)
    const poNumberStartPosition = (idx + 1)
    const poNumberEndPosition = (idx + 8)
    const poNumber = R.slice(poNumberStartPosition, poNumberEndPosition, url)
    console.log('poNumber: ', poNumber)
    return fetchPurchaseOrderCmd(poNumber, retrievePurchaseOrderMsg(poNumber)); 
}

export function initModel(url) {
    const page = R.cond([
        [R.pipe(R.indexOf('/login'), R.lt(-1)), R.always(PAGES.LOGIN)],
        [R.pipe(R.indexOf('/pomaster'), R.lt(-1)), R.always(PAGES.PO_MASTER)],
        [R.pipe(R.indexOf('/podetail'), R.lt(-1)), R.always(PAGES.PO_DETAIL)],
        [R.T, R.always(PAGES.LOGIN)],
    ])(url);
    
    const command = R.cond([
        [R.equals(PAGES.PO_DETAIL), R.always(initCommandPODetail(url))],
        [R.equals(PAGES.PO_MASTER), R.always(fetchPurchaseOrdersCmd(refreshMsg()))],
        [R.T, R.always(null)],
    ])(page);
    
    console.log(command)
    const po_master = initModelPOMaster()[0];
    const po_detail = initModelPODetail()[0];
    const login = initModelLogin()[0];

    return [{
        page,
        po_master,
        po_detail,
        login
    }, command];
}

