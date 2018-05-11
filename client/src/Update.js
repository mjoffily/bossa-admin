import * as R from 'ramda';
import { update as updateMaster } from './po_master/Update'
import { update as updateDetail } from './po_detail/Update'

export const NAVIGATION_MSGS = {
    NAVIGATE_TO_PAGE: 'NAVIGATE_TO_PAGE'
}

export const PAGES = {
    PO_DETAIL: 'PO_DETAIL',
    PO_MASTER: 'PO_MASTER'
};


export function navigateToPageMsg(page, msg) {
    return {
        type: NAVIGATION_MSGS.NAVIGATE_TO_PAGE,
        page,
        msg
    }
}

function prepResponse(arr) {
    const [model, commands, asynchMessages] = arr;
    const toReturn = [model, commands, asynchMessages];
    if (1 === 1) {
        console.log('hey');
    }
    return toReturn;
    // if (R.isNil(arr)) {
    //     return [null, null, null];
    // }
    // switch (arr.length) {
    //     case 0: {
    //         return [null, null, null];
    //     }
    //     case 1: {
    //         return [...arr, null, null};
    //     }
    // }
}

export function update(msg, model, dispatchAsynch) {
    
    switch (msg.type) {
        case NAVIGATION_MSGS.NAVIGATE_TO_PAGE: {
            return [{...model, page: msg.page}]
            
        }
    }
    switch(model.page) {
        case PAGES.PO_DETAIL: {
            const response = R.pipe(updateDetail, prepResponse)(msg, model.po_detail);
            // if (response[1] && response[1].type && response[1].type === NAVIGATION_MSGS.NAVIGATE_TO_PAGE) {
            //     return [{...model, page: response[1].page, po_detail: response[0]}, response[1].command, response[2]]
            // } else {
                return [{...model, po_detail: response[0] }, response[1], response[2]];
            //}
        }
        case PAGES.PO_MASTER: {
            const response = R.pipe(updateMaster, prepResponse)(msg, model.po_master);
            // if (response[1] && response[1].type && response[1].type === NAVIGATION_MSGS.NAVIGATE_TO_PAGE) {
            //     const newResponse = updateDetail(response[1].msg, model.po_detail)
            //     return [{...model, page: response[1].page, po_master: response[0]}, response[1].command]
            // } else {
                return [{...model, po_master: response[0] }, response[1], response[2]];
            //}
        }
        default: {
            return model;
            
        }
    }
}

