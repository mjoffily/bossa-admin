import { initModel as initModelPOMaster } from './po_master/Model';
import { initModel } from './po_detail/Model';

import { PAGES } from './Update';

function initModel2() {
    const po_master = initModelPOMaster();
    const po_detail = initModel();
    
    return [{
        page: PAGES.PO_MASTER,
        po_master: po_master[0],
        //po_detail: initModelPODetail()
        po_detail: po_detail[0]
    }, po_master[1]];
}

export default initModel2;
