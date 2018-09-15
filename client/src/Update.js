import * as R from 'ramda';
import { update as updateLogin } from './login/Update'
import { update as updateMaster, refreshMsg } from './po_master/Update'
import { update as updateDetail } from './po_detail/Update'

export const NAVIGATION_MSGS = {
    NAVIGATE_TO_PAGE: 'NAVIGATE_TO_PAGE'
}

export const PAGES = {
    PO_DETAIL: 'PO_DETAIL',
    PO_MASTER: 'PO_MASTER',
    LOGIN: 'LOGIN'
};

export const DEFAULT_PAGE = PAGES.PO_MASTER
export const DEFAULT_MESSAGE = refreshMsg

export function navigateToPageMsg(page, msg) {
    return {
        type: NAVIGATION_MSGS.NAVIGATE_TO_PAGE,
        page,
        msg
    }
}

function prepResponse(arr) {
    const [model, commands, asynchMessages] = arr;
    return [model, commands, asynchMessages];
}

export function update(msg, model, dispatchAsynch) {
    
    switch (msg.type) {
        case NAVIGATION_MSGS.NAVIGATE_TO_PAGE: {
            return [{...model, page: msg.page, url: 'https://shopify-app-mjoffily.c9users.io/pomaster'}]
            
        }
    }
    switch(model.page) {
        case PAGES.LOGIN: {
            const r = updateLogin(msg, model.login);
            const response = prepResponse(r);
            //const response = R.pipe(updateLogin, prepResponse)(msg, model.login);
            return [{...model, login: response[0] }, response[1], response[2]];
        }
        case PAGES.PO_DETAIL: {
            const response = R.pipe(updateDetail, prepResponse)(msg, model.po_detail);
            return [{...model, po_detail: response[0] }, response[1], response[2]];
        }
        case PAGES.PO_MASTER: {
            const response = R.pipe(updateMaster, prepResponse)(msg, model.po_master);
            return [{...model, po_master: response[0] }, response[1], response[2]];
        }
        default: {
            return model;
            
        }
    }
}

