import { diff, patch } from 'virtual-dom';
import createElement from 'virtual-dom/create-element';
import axios from 'axios';
import * as R from 'ramda';
import { PAGES } from './Update';

const CUSTOM_EVENT = 'asynchCustomEvent';

function app(initModel, update, view, node) {
  console.log('URL: %s', document.URL);
  let initValues = initModel(document.URL);
  let model = initValues[0];
  let commands = initValues[1];
  let asynchMsgs = null;
  httpEffects(dispatch, dispatchAsynch, commands);
  let currentView = view(dispatch, model);
  let rootNode = createElement(currentView);
  node.appendChild(rootNode);
  node.addEventListener(CUSTOM_EVENT, e => {
      console.log('Asynch Handler: %s', JSON.stringify(e.detail.msg))
      dispatch(e.detail.msg)
    });
  
  function dispatch(msg) {
    const result = update(msg, model, dispatchAsynch);
    model = result[0];
    commands = result[1];
    asynchMsgs = result[2];
    httpEffects(dispatch, dispatchAsynch, commands);

    const updatedView = view(dispatch, model);
    const patches = diff(currentView, updatedView);
    if (rootNode) {
      rootNode = patch(rootNode, patches);
    }
    currentView = updatedView;
    
    if (asynchMsgs) {
      R.map(dispatchAsynch, asynchMsgs);
    }
  }
  
  function dispatchAsynch(msg) {
    console.log('Dispatch Asynch: %s', JSON.stringify(msg, null, 4))
    const event = new CustomEvent(CUSTOM_EVENT, {
      bubbles: false,
      detail: { msg }
    });
    node.dispatchEvent(event);
  }
  
  
}

function httpEffects(dispatch, dispatchAsynch, commands) {
//  const command = model.page === PAGES.PO_DETAIL ? model.po_detail[1] : model.po_master[1]; 
  if (R.or(R.isNil(commands), R.isEmpty(commands))) {
    return;
  }
  
  const isArray = (R.type(commands) === 'Array')
  if (! isArray) {
    executeCmd(dispatch, dispatchAsynch, commands) // this is a single command
  } else {
    R.map(executeCmd(dispatch, dispatchAsynch), commands);
  }
}

const executeCmd = R.curry( (dispatch, dispatchAsynch, command) => {
    // originalMsg is the message which the handler produced the command being executed here.
    // That message is there so we can replay it in case the HTTP request fails with error 403 (not authenticated)
    // In that case, the handler of the error (errorMsg) is triggered, and accepts the originalMsg as a parameter
    // It then redirects to the login page, informing it that it should replay this original message 
    const { request, successMsg, errorMsg, httpStartMsg, originalMsg } = command;
    if (httpStartMsg) {
      dispatchAsynch(httpStartMsg);
    }
    // get the token from session storage to send to the request
    if (request.headers) {
      request.headers['x-access-token'] = window.sessionStorage.token
    } else {
      request.headers = { 'x-access-token': window.sessionStorage.token } 
    }
    axios(request)
    .then(response => {
      dispatch(successMsg(response))
    })
    .catch(error => {
      dispatch(errorMsg(error, originalMsg))
    });
})


export default app;

