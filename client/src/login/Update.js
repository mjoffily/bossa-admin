import * as R from 'ramda';
import { baseURL } from '../lib/mycommons';
import { PAGES, navigateToPageMsg } from '../Update'

export const MSGS = {
    HTTP_LOGIN_VERIFICATION_EXECUTED: 'HTTP_LOGIN_VERIFICATION_EXECUTED',
    HTTP_LOGIN_VERIFICATION_ERROR: 'HTTP_LOGIN_VERIFICATION_ERROR',
    HTTP_START: 'HTTP_START',
    SUBMIT: 'SUBMIT',
    INPUT_USER_ID: 'INPUT_USER_ID',
    INPUT_PASSWORD: 'INPUT_PASSWORD',
    OK: 'OK',
    CLEAR: 'CLEAR',
    FAIL: 'FAIL'
}

const loginUrl = `${baseURL}/login`;

export function loginCmd(data) {
    return {
              request: { url: loginUrl,
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

export const submitCredentialsMsg =  {
        type: MSGS.SUBMIT
    }

export function update(msg, model) {
    switch (msg.type) {
        case MSGS.HTTP_START: {
            return [{ ...model, block: true }, null]
        }
        case MSGS.HTTP_LOGIN_VERIFICATION_EXECUTED: {
            console.log(msg);
            const data = R.pathOr({}, ['data'], msg.response)
            const { status, error_msg } = data;
            const messagesToPropagate = [navigateToPageMsg(PAGES.PO_MASTER)]; 
            return status ? [{ ...model, block: false, error_msg: null }, null, messagesToPropagate] : [{ ...model, block: false, error_msg }, null, null];
        }
        case MSGS.HTTP_LOGIN_VERIFICATION_ERROR: {
            const data = R.pathOr({}, ['data'], msg.response)
            const { msg } = data;
            return [{ ...model, error_msg: msg }, null, null];
        }
        case MSGS.INPUT_USER_ID: {
            const { userid } = msg;
            return [ { ...model, userid }, null]
        }
        case MSGS.INPUT_PASSWORD: {
            const { password } = msg; 
            return [ { ...model, password}, null]
        }
        case MSGS.SUBMIT: {
            const { userid, password } = model; 
            const data = {userid, password};
            const error_msg = R.pipe(R.defaultTo(''), R.isEmpty)(password) ? 'User id and password must be informed' : null; 
            return R.isNil(error_msg) ? [model, loginCmd(data), null] : [{ ...model, error_msg }, null, null];
        }
        case MSGS.OK: {
            return [model, null]
            
        }
        case MSGS.FAIL: {
            return [model, null]
        }
        default: {
            return [model, null, null];
        }
    }
}