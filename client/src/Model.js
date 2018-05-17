import { initModel as initModelPOMaster } from './po_master/Model';
import { initModel as initModelLogin } from './login/Model';
import { initModel as initModelPODetail } from './po_detail/Model';

import { PAGES } from './Update';

function initModel(url) {
    console.log('this is the location: %s', window.location.href);
    var page = '';
    if (url.indexOf('/login') !== -1) {
        page = PAGES.LOGIN;
    } else if (url.indexOf('/pomaster') !== -1) {
        page = PAGES.PO_MASTER
    } else if (url.indexOf('/podetail') !== -1) {
        page = PAGES.PO_DETAIL
    } else {
        page = PAGES.LOGIN;
    }
    const po_master = initModelPOMaster();
    const po_detail = initModelPODetail();
    const login = initModelLogin();
    
    return [{
        page,
        po_master: po_master[0],
        po_detail: po_detail[0],
        login: login[0]
    }, null];
}

export default initModel;
