import * as R from 'ramda';
import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { inputUserIdMsg, inputPasswordMsg, submitCredentialsMsg } from './Update'

const { input, div, button, i, pre } = hh(h);

export function view(dispatch, model) {
  if (model.block) {
    return div({}, "BLOCKING");
  }
  
  return div({ className: 'mw8 center' }, [
    div({ className: ''}, model.error_msg),
    div({ className: ''}, [
        div({ className: ''}, 'User id:'),
        div({ className: ''}, 
              input({ className: ''
            , value: model.userid
            , oninput: (e) => dispatch(inputUserIdMsg(e.target.value))})
        ),
        div({ className: '' }, 'Password'),
        div({ className: ''}, 
              input({ className: ''
            , type: 'password'
            , value: model.password
            , oninput: (e) => dispatch(inputPasswordMsg(e.target.value))})
        ),
        div({ className: '' }, button({ className: 'pa2 br1 mv2 mh2 bg-green bn white pointer',
                                        onclick: () => dispatch(submitCredentialsMsg) }, 
                                      [
                                        i({className: 'fa fa-plus ph1'}),
                                        'Submit'
                                      ])),
      
      ]),
   
    , pre(JSON.stringify(model, null, 2)),
  ]);
}

