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
  node.addEventListener(CUSTOM_EVENT, e => dispatch(e.detail.msg));
  
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
    const { request, successMsg, errorMsg, httpStartMsg } = command;
    var blocking = true;
    if (httpStartMsg) {
      dispatchAsynch(httpStartMsg);
    }
    axios(request)
    .then(response => {
      dispatch(successMsg(response))
    })
    .catch(error => {
      dispatch(errorMsg(error))
    });
})


export default app;

