import * as R from 'ramda';
import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { refreshMsg, newPOMsg, poSelectedMsg } from './Update';
//import 'moment';
import * as moment from 'moment';
import { toBRL } from '../lib/mycommons';
//----- SOLVE TypeError issue with moment.js - HACK ALERT ------
// details of issue here: https://github.com/palantir/blueprint/issues/959
let M = moment;
if ("default" in moment) {
    M = moment["default"];
}
// ----- END HACK -----------------------------------------------

const { div, pre, button, i, a, th, td, table, tr, thead } = hh(h);

const tableHeader = thead({ className: ''}, 
    tr({className: ''}, [
        th({className: 'fw6 tc pa3 light-yellow'}, 'Id'),
        th({className: 'fw6 tc pa3 light-yellow'}, 'Created date'),
        th({className: 'fw6 tc pa3 light-yellow'}, 'Updated date'),
        th({className: 'fw6 tc pa3 light-yellow'}, 'Qtd items'),
        th({className: 'fw6 tr pa3 light-yellow'}, 'Total')
    ])
  );

const renderRow = R.curry( (dispatch, purchaseOrder) => {
  return tr({ className: 'white'}, [
    td({ className: 'pa3 tc' }, a({className: 'pointer', onclick: (e) => {
                                                                          e.preventDefault();
                                                                          dispatch(poSelectedMsg(purchaseOrder._id))
                                                                        }
    }, purchaseOrder._id)),
    td({ className: 'pa3 tc' }, M(purchaseOrder.created_date).format("DD MMM YYYY")), //(purchaseOrder.created_date)),
    td({ className: 'pa3 tc' }, M(purchaseOrder.updated_date).format("DD MMM YYYY")), //M(purchaseOrder.updated_date)),
    td({ className: 'pa3 tc' }, ''+ purchaseOrder.number_of_items),
    td({ className: 'pa3 tr' }, toBRL(purchaseOrder.total_order_cost))
    ])
})

function tableRows(dispatch, model) {
  return R.map(renderRow(dispatch), model.purchase_orders);
}

function renderTable(dispatch, model) {
  return table({ className: 'mt3 f6 w-100 mw8 center br4 bg-black-80'}, [tableHeader, tableRows(dispatch, model)])
}

function displayError(model) {
  if (!model.error) {
    return;
  }
  return div(model.error.message);
}

export function view(dispatch, model) {
  if (model.block) {
    return div({}, "BLOCKING");
  }
  return div({ className: 'w-50 mw8 center' }, [
    displayError(model),
    div({ className: 'flex'}, [
      div({ className: 'w-100 fl f2 pv2 bb' }, 'Purchase Orders'),
      ]),
    div([
      button({ 
        className: 'pa2 br1 mv2 bg-green bn white',
        onclick: () => dispatch(newPOMsg())
      }, 
      [
        i({className: 'fa fa-plus ph1'}),
        'New Purchase Order'
      ]),

      button({ 
        className: 'pa2 br1 mv2 bg-green bn white fr',
        onclick: () => dispatch(refreshMsg())
      }, 
      [
        i({className: 'fa fa-save ph1'}),
        'Refresh'
      ]),
      
    ]),
    div({ className: 'nl2 nr2'}, renderTable(dispatch, model))
   // , pre(JSON.stringify(model, null, 2)),
  ]);
}

