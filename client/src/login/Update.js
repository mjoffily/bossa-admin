import * as R from 'ramda';
import { baseURL } from '../lib/mycommons';
import { PAGES, navigateToPageMsg, DEFAULT_MESSAGE, DEFAULT_PAGE } from '../Update'
import { refreshMsg } from '../po_master/Update'

export const MSGS = {
    HTTP_LOGIN_VERIFICATION_EXECUTED: 'HTTP_LOGIN_VERIFICATION_EXECUTED',
    HTTP_LOGIN_VERIFICATION_ERROR: 'HTTP_LOGIN_VERIFICATION_ERROR',
    HTTP_START: 'HTTP_START',
    SUBMIT: 'SUBMIT',
    REDIRECT_TO: 'REDIRECT_TO',
    INPUT_USER_ID: 'INPUT_USER_ID',
    INPUT_PASSWORD: 'INPUT_PASSWORD',
    OK: 'OK',
    CLEAR: 'CLEAR',
    FAIL: 'FAIL'
}

const loginUrl = `${baseURL}/login`;

export function loginCmd(data) {
    return {
        request: {
            url: loginUrl,
            method: 'post',
            data
        },
        successMsg: httpLoginVerificationExecutedMsg,
        errorMsg: httpLoginVerificationErrorMsg,
        httpStartMsg: httpStartMsg,
    }
}

export function httpLoginVerificationExecutedMsg(response) {
    return {
        type: MSGS.HTTP_LOGIN_VERIFICATION_EXECUTED,
        response
    }
}

export function redirectToMsg(redirect_to_page, redirect_to_msg) {
    return {
        type: MSGS.REDIRECT_TO,
        redirect_to_page,
        redirect_to_msg
    }
}

export function httpLoginVerificationErrorMsg(response) {
    return {
        type: MSGS.HTTP_LOGIN_VERIFICATION_ERROR,
        response
    }
}

export const httpStartMsg = {
    type: MSGS.HTTP_START
}

export function inputUserIdMsg(userid) {
    return {
        type: MSGS.INPUT_USER_ID,
        userid
    }
}

export function inputPasswordMsg(password) {
    return {
        type: MSGS.INPUT_PASSWORD,
        password
    }
}

export const submitCredentialsMsg = {
    type: MSGS.SUBMIT
}

export function update(msg, model) {
    switch (msg.type) {
        case MSGS.HTTP_START:
            {
                return [{ ...model, block: true }, null, null]
            }
        case MSGS.HTTP_LOGIN_VERIFICATION_EXECUTED:
            {
                const data = R.pathOr({}, ['data', 'data'], msg.response)
                const { status, error_msg, token } = data;
                // store token in localstorage
                window.sessionStorage.token = token;
                // do I have a "redirect to" page and message?
                const { redirect_to } = model
                const { redirect_to_page, redirect_to_msg } = redirect_to
                const next_page = R.isNil(redirect_to_page) ? DEFAULT_PAGE : redirect_to_page;
                //TODO - having a default message does not make sense as it must go together with the page. See what can be done here 
                const next_message = R.isNil(redirect_to_msg) ? DEFAULT_MESSAGE : redirect_to_msg;
                const messagesToPropagate = [navigateToPageMsg(next_page), next_message];
                return status ? [{ ...model, block: false, error_msg: null, userid: null, password: null }, null, messagesToPropagate] : [{ ...model, block: false, error_msg }, null, null];
            }
        case MSGS.HTTP_LOGIN_VERIFICATION_ERROR:
            {
                const data = R.pathOr({}, ['data', 'data'], msg.response)
                const { error_msg } = data;
                return [{ ...model, error_msg }, null, null];
            }
        case MSGS.INPUT_USER_ID:
            {
                const { userid } = msg;
                return [{ ...model, userid }, null, null]
            }
        case MSGS.INPUT_PASSWORD:
            {
                const { password } = msg;
                return [{ ...model, password }, null, null]
            }
        case MSGS.SUBMIT:
            {
                const { userid, password } = model;
                const data = { userid, password };
                const error_msg = R.pipe(R.defaultTo(''), R.isEmpty)(password) ? 'User id and password must be informed' : null;
                return R.isNil(error_msg) ? [model, loginCmd(data), null, null] : [{ ...model, error_msg }, null, null];
            }
        case MSGS.OK:
            {
                return [model, null, null]
            }
        case MSGS.REDIRECT_TO: // this only sets the redirect to information in the model
            {
                return [ { ...model, redirect_to: msg }, null, null]
            }
        case MSGS.FAIL:
            {
                return [model, null, null]
            }
        default:
            {
                return [model, null, null];
            }
    }
}
