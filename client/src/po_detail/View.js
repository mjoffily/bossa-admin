import * as R from 'ramda';
import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { round, toBRL, toAUD, ESCAPE_KEY, BOSSA_PRODUCTS_URL } from '../lib/mycommons';
import { printPreviewMsg, closePurchaseOrderMsg, newItemMsg, newOtherCostMsg, inputVendorSKUMsg,
         inputMySKUMsg, inputQtdMsg, inputPriceMsg, inputCommentsMsg, inputDescriptionMsg, 
         savePurchaseOrderMsg, editMsg, deleteMsg, editOtherCostMsg, deleteOtherCostMsg, productSelectedMsg, 
         escapeKeyPressedMsg, okMsg, cancelMsg, okOtherCostsMsg, cancelOtherCostsMsg, exchangeRateClickedMsg, 
         inputExchangeRateMsg, loseFocusExchangeRateMsg, keyUpExchangeRateMsg, costAUDClickedMsg, loseFocusCostAUDMsg,
         inputCostAUDMsg, keyUpCostAUDMsg, FORM_PRODUCT, FORM_OTHER_COST } from './Update'

const { input, div, pre, button, i, textarea, a, ul, li, img, table, th, thead, tr, td } = hh(h);

function myonclick(e, dispatch, id) {
  dispatch(productSelectedMsg(e.target.textContent, id)); 
}
const renderDropdown = R.curry((dispatch, item, product) => {
  
  return li({ onclick: (e) => myonclick(e, dispatch, item.id)}, product.my_sku); 
//  return li(product.my_sku);
})

function displayDropdown(dispatch, model) {
  if (model.show_dropdown) {
    const c = div(ul(R.map(renderDropdown(dispatch, model), model.filtered_products)));
    return c;
  }
}

function classForInput(model, attribute) {
  const defaultClassName = 'w-100 bg-washed-yellow outline-0';
  const errClassName = 'w-100 bg-washed-yellow outline-0 ba b--dark-red';
  return        R.isNil(model.validation_errors) || 
                R.either(R.isNil, R.isEmpty)(R.prop(attribute, model.validation_errors)) ? defaultClassName : errClassName;
}

function renderErrorDiv(model) {
  const msg = R.or(R.isNil(R.prop('validation_errors', model)), (R.prop('total_errors', model.validation_errors) === 0)) ? "" :
  R.concat(model.validation_errors.err_my_sku, model.validation_errors.err_qtd);
  return div({ 
    className: ''
  }, 
    msg
  )
}

function renderFormButtons(dispatch, model, okMsg, cancelMsg) {
  return div({}, [ button({ 
                className: 'pa2 br1 mv2 mh2 bg-green bn white pointer',
                onclick: () => dispatch(okMsg)
              }, 
              [
                i({className: 'fa fa-save ph1'}),
                'Ok'
              ]),
            button({ 
              className: 'pa2 br1 mv2 mh2 bg-green bn white pointer',
              onclick: () => dispatch(cancelMsg)
            }, 
            [
              i({className: 'fa fa-cancel ph1'}),
              'Cancel'
            ]),
          ]);
}

//--------------- RENDER PRODUCT FORM ---------------

function renderProductForm(dispatch, model) {
  if (R.or((!model.show_form), (model.form !== FORM_PRODUCT))) {
    return '';
  }
  const a = div({ className: 'w-third pa2 center'}, 
  [
    div({ className: 'w-100 pa2 bg-light-yellow mv2 shadow-1 relative'}
    , [editItem(dispatch, model)
    , renderErrorDiv(model)
    ]),
    renderFormButtons(dispatch, model, okMsg, cancelMsg)
  ]);
  return a;
}

function editItem(dispatch, model) {
  const c = div([
    div({ className: 'b f6 mv1'}, 'My SKU')
    , input({ className: classForInput(model, 'err_my_sku')
            , value: model.my_sku
            , oninput: (e) => dispatch(inputMySKUMsg(e.target.value))})
    , displayDropdown(dispatch, model)
    , div({ className: 'b f6 mv1'}, 'Vendor SKU')
    , input({ className: 'w-100 bg-washed-yellow outline-0'
            , value: model.vendor_sku
            , oninput: (e) => dispatch(inputVendorSKUMsg(e.target.value))})

    , div({className: 'flex'}, [
        
        div( {className: 'w-50'}, [
            div({ className: 'b f6 mv1'}, 'Qtd')
          , input({ className: classForInput(model, 'err_qtd')
                  , value: model.qtd
                  , oninput: (e) => dispatch(inputQtdMsg(e.target.value))})
          , div({ className: 'b f6 mv1'}, 'Price (R$)')
          , input({ className: 'w-70 bg-washed-yellow outline-0'
                  , value: model.price
                  , oninput: (e) => dispatch(inputPriceMsg(e.target.value))})
          , div({ className: 'b f6 mv1'}, 'Total')
          , input({ className: 'w-70 bg-washed-yellow outline-0'
                  , value: model.total_for_product})
        ])

        , div({ className: 'w-50 flex justify-center items-center'}, [
            
          img({ className: 'w-70'
              , src: model.img
              , height: '120'
              , width: '80'
            })
        ])
    ])
    , div({ className: 'b f6 mv1'}, 'Comments')
    , textarea({ className: 'w-100 bg-washed-yellow outline-0'
              , value: model.comments
              , oninput: (e) => dispatch(inputCommentsMsg(e.target.value))})

  ]);
  return c;
}

//--------------- END RENDER PRODUCT FORM ---------------

//--------------- RENDER OTHER COSTS FORM ---------------

function renderOtherCostsForm(dispatch, model) {
  if (R.or((!model.show_form), (model.form !== FORM_OTHER_COST))) {
    return '';
  }

  const a = div({ className: 'w-third pa2 center'}, 
  [
    div({ className: 'w-100 pa2 bg-light-yellow mv2 shadow-1 relative'}
    , [editOtherCost(dispatch, model)
    , renderErrorDiv(model)
    ]),
    renderFormButtons(dispatch, model, okOtherCostsMsg, cancelOtherCostsMsg)
  ]);

  return a;
}

function editOtherCost(dispatch, model) {
  const c = div([
      div({ className: 'b f6 mv1'}, 'Description of Cost')
    , input({ className: classForInput(model, 'description')
            , value: model.description
            , oninput: (e) => dispatch(inputDescriptionMsg(e.target.value))})
    , div({ className: 'b f6 mv1'}, 'Amount')
    , input({ className: 'w-70 bg-washed-yellow outline-0'
            , value: model.price
            , oninput: (e) => dispatch(inputPriceMsg(e.target.value))})
    , div({ className: 'b f6 mv1'}, 'Comments')
    , textarea({ className: 'w-100 bg-washed-yellow outline-0'
              , value: model.comments
              , oninput: (e) => dispatch(inputCommentsMsg(e.target.value))})
    ]);
  return c;
}

//--------------- END RENDER PRODUCT FORM ---------------

function topButtons(dispatch, model) {
  if (model.show_form) {
    return '';
  }
  return [ button({ 
                className: 'pa2 br1 mv2 mh2 bg-green bn white pointer',
                onclick: () => dispatch(newItemMsg)
              }, 
              [
                i({className: 'fa fa-plus ph1'}),
                'Add Product'
              ]),
              button({ 
                className: 'pa2 br1 mv2 mh2 bg-green bn white pointer',
                onclick: () => dispatch(newOtherCostMsg)
              }, 
              [
                i({className: 'fa fa-plus ph1'}),
                'Add Other Costs'
              ])
          ,div({className: 'fr'}, [
            button({ 
              className: 'pa2 br1 mv2 mh2 bg-green bn white pointer',
              onclick: () => dispatch(savePurchaseOrderMsg())
            }, 
            [
              i({className: 'fa fa-save ph1'}),
              ''
            ]),
            button({ 
              className: 'pa2 br1 mv2 mh2 bg-green bn white pointer',
              onclick: () => dispatch(closePurchaseOrderMsg())
            }, 
            [
              i({className: 'fa fa-close ph1'}),
              ''
            ]),
            button({ 
              className: 'pa2 br1 mv2 mh2 bg-green bn white pointer',
              onclick: () => dispatch(printPreviewMsg)
            }, 
            [
              i({className: 'fa fa-print ph1'}),
              ''
            ]),
          ])
      ];

}

function displayError(model) {
  if (!model.error) {
    return;
  }
  return div(model.error.message);
}

function displayOrderHeading(model) {
  const id = R.prop('_id', model);
  return R.concat('Purchase Order ', R.isNil(id) ? '<NEW>' : R.concat("#", id)); 
}

// ------- RENDER OTHER COSTS TABLE --------------
function headerOtherCosts(model) {
    const totalColumns = R.isNil(model.exchange_rate) ? 5 : 6;
    return thead({ className: ''}, 
                            [ tr({ className: 'light-yellow sans-serif'}, td( { colSpan: totalColumns, className: 'pv2 bb btn tc f3'}, "Other Costs")),
                              tr([ 
                                  td({ className: 'fw6 tl pa3 light-yellow'}, 'Description'),
                                  td({ className: 'fw6 tr pa3 light-yellow'}, 'Cost (R$)'),
                                  R.isNil(model.exchange_rate) ? '' : td({ className: 'fw6 tr pa3 light-red'}, 'Cost (A$)'),
                                  td({ className: 'fw6 tl pa3 light-yellow'}, 'Comments'),
                                  td({ className: ''}, ''),
                                  td({ className: ''}, ''),
                                ])
                            ]);
}

function renderOtherCostsTable(dispatch, model) {
  if (!model.other_costs) {
    return '';
  }
  
  return table({ className: 'fl mt3 f6 w-60 mw8 br4 bg-black-80'}, [headerOtherCosts(model), tableOtherCostsRows(dispatch, model)])
}

const renderOtherCostsRow = R.curry( (dispatch, other_cost) => {
  return tr({ className: 'white'}, [
    renderCell(other_cost.description, 'pa3 tl'),
    renderCell(toBRL(other_cost.price), 'pa3 tr'),
    R.isNil(other_cost.cost_in_aud) ? '' : renderCell(toAUD(other_cost.cost_in_aud), 'pa3 tr light-red'),
    renderCell(other_cost.comments, 'pa3 tl'),
    renderCell(i({className: 'fa fa-edit fa-2x pointer', onclick: () => dispatch(editOtherCostMsg(other_cost.id))}), 'pa3 tl'),
    renderCell(i({className: 'fa fa-trash fa-2x pointer', 
                  onclick: () => {
                                    if (confirm('Are you sure you want to delete this item?')) {
                                      dispatch(deleteOtherCostMsg(other_cost.id))
                                    }
                                 }}), 'pa3 tl')
    ])
})

function tableOtherCostsRows(dispatch, model) {
  return R.map(renderOtherCostsRow(dispatch), model.other_costs);
}
// ------- END - RENDER OTHER COSTS TABLE --------------

// ------- RENDER PRODUCTS TABLE -------------
function linkToProduct(item) {
  if (!item.product_id) {
    return item.my_sku;
  }
  return a({href: R.concat(BOSSA_PRODUCTS_URL, ''+item.product_id), target: '_blank' }, item.my_sku);
}

function header(model) {
    const totalColumns = R.isNil(model.exchange_rate) ? 9 : 10;
    return thead({ className: ''}, 
                            [ tr({ className: 'light-yellow sans-serif'}, td( { colSpan: totalColumns, className: 'pv2 bb btn tc f3'}, "Products")),
                              tr([ 
                                  td({ className: 'fw6 tl pa3 light-yellow'}, ''),
                                  td({ className: 'fw6 tl pa3 light-yellow'}, 'My SKU'),
                                  td({ className: 'fw6 tl pa3 light-yellow'}, 'Vendor SKU'),
                                  td({ className: 'fw6 tc pa3 light-yellow'}, 'Qtd'),
                                  td({ className: 'fw6 tr pa3 light-yellow'}, 'Unit price (R$)'),
                                  R.isNil(model.exchange_rate) ? '' : td({ className: 'fw6 tr pa3 light-red'}, 'Unit price (A$)'),
                                  td({ className: 'fw6 tr pa3 light-yellow'}, 'Total'),
                                  td({ className: 'fw6 tl pa3 light-yellow'}, 'Comments'),
                                  td({ className: ''}, ''),
                                  td({ className: ''}, ''),
                                ])
                            ]);
}

function renderCell(val, className) {
  return td({ className }, val);
}
const renderRow = R.curry( (dispatch, item) => {
  return tr({ className: 'white'}, [
    renderCell(img({ className: ''
              , src: item.img
              , height: '60'
              , width: '40'
            })),
    renderCell(linkToProduct(item), 'pa3 tl'),
    renderCell(item.vendor_sku, 'pa3 tl'),
    renderCell(''+item.qtd, 'pa3 tc'),
    renderCell(toBRL(item.price), 'pa3 tr'), 
    R.isNil(item.cost_in_aud) ? '' : renderCell(toAUD(item.cost_in_aud), 'pa3 tr light-red'),
    renderCell(toBRL(item.total_for_product), 'pa3 tr'),
    renderCell(''+item.comments, 'pa3 tl'),
    renderCell(i({className: 'fa fa-edit fa-2x pointer', onclick: () => dispatch(editMsg(item.id))}), 'pa3 tc'),
    renderCell(i({className: 'fa fa-trash fa-2x pointer', 
                  onclick: () => {
                                    if (confirm('Are you sure you want to delete this item?')) {
                                      dispatch(deleteMsg(item.id))
                                    }
                                 }}), 'pa3 tc')
    ])
})

function tableRows(dispatch, model) {
  return R.map(renderRow(dispatch), model.items);
}

function renderProductsTable(dispatch, model) {
  return table({ className: 'mt3 f6 w-100 mw8 center br4 bg-black-80'}, [header(model), tableRows(dispatch, model)])
}
// ------- END - RENDER PRODUCTS TABLE -------------


// ------- RENDER EXCHANGE RATE TABLE -------------
function renderExchangeRateTable(dispatch, model) {
  return table({ className: 'w-30 mt3 ml3 f6 w-30 mw8 fr br4 bg-black-80'}, [headerExchangeRate(dispatch, model)])
}
function headerExchangeRate(dispatch, model) {
  return thead({ className: ''}, 
              [ tr({ className: 'light-yellow sans-serif'}, td( { colSpan: 2, className: 'pv2 bb btn tc f3'}, "Exchange Rate")),
                tr([ 
                    td({ className: 'w-50 fw6 tl pa3 light-yellow'}, 'Exchange rate'),
                    td({ className: 'w-50 fw6 tc pa3 white'}, displayExchangeRate(dispatch, model))
                  ]),
                tr([td({ className: 'w-50 fw6 tl pa3 light-yellow'}, 'Total in AUD'),
                    td({ className: 'w-50 fw6 tc pa3 white'}, displayCostInAUD(dispatch, model)),
                  ])
            ]);
}

function displayExchangeRate(dispatch, model) {
  return model.edit_exchange_rate ? 
         input({ className: 'w-100 tr f5 pv2 bg-black-50 ba white outline-0'
            , autofocus: true
            , value: model.exchange_rate
            , oninput: (e) => dispatch(inputExchangeRateMsg(e.target.value))
            , onkeyup: (e) => {
                dispatch(keyUpExchangeRateMsg(e.key))
              
            }
            , onblur: () => dispatch(loseFocusExchangeRateMsg)
         })
         : 
         div({ className: 'w-100 bg-black-50 tr f5 pv2 ba pointer',
               onclick: () => dispatch(exchangeRateClickedMsg) }, 
               R.isNil(model.exchange_rate) ? 'click to enter...' : model.exchange_rate);
}

function displayCostInAUD(dispatch, model) {
  return model.edit_total_order_cost_in_aud ? 
         input({ className: 'w-100 tc f5 pv2 bg-black-50 ba white outline-0'
            , autofocus: true
            , value: model.total_order_cost_in_aud
            , oninput: (e) => dispatch(inputCostAUDMsg(e.target.value))
            , onkeyup: (e) => {
                dispatch(keyUpCostAUDMsg(e.key))
              
            }
            , onblur: () => dispatch(loseFocusCostAUDMsg)
         })
         : 
         div({ className: 'w-100 bg-black-50 tr f5 pv2 ba pointer',
               onclick: () => dispatch(costAUDClickedMsg) }, 
               R.isNil(model.total_order_cost_in_aud) ? 'click to enter...' : toAUD(model.total_order_cost_in_aud));
}


// ------- END - RENDER EXCHANGE RATE TABLE -------------

// ------- RENDER PRINT PREVIEW -----------
const tableHeader = thead({ className: ''}, 
                            [ tr({ className: 'light-yellow sans-serif'}, td( { colSpan: 5, className: 'pv2 bb btn tc f3'}, "Products")),
                              tr([ 
                                  td({ className: 'fw6 tl pa3 light-yellow'}, 'Produto'),
                                  td({ className: 'fw6 tc pa3 light-yellow'}, 'Qtd'),
                                  td({ className: 'fw6 tr pa3 light-yellow'}, 'Preco unitario'),
                                  td({ className: 'fw6 tr pa3 light-yellow'}, 'Total'),
                                  td({ className: 'fw6 tl pa3 light-yellow'}, 'Observacoes'),
                                ])
                            ]);

function tablePrintPreviewFooter(model) {
  return tr({ className: 'white'}, [
    td(''),
    td(''),
    td(''),
    td({ className: 'pa3 tr' }, R.pipe(R.map((item) => item.total_for_product),
                                       R.sum,
                                       toBRL)
                                (model.print_preview_model)),
    td(''),
    ])
}

const renderPrintPreviewRow = R.curry( (dispatch, item) => {
  return tr({ className: 'white'}, [
    td({ className: 'pa3 tl' }, item.vendor_sku),
    td({ className: 'pa3 tc' }, ''+item.qtd),
    td({ className: 'pa3 tr' }, toBRL(item.price)), 
    td({ className: 'pa3 tr' }, toBRL(item.total_for_product)),
    td({ className: 'pa3 tl' }, ''+item.comments)
    ])
})

function tablePrintPreviewRows(dispatch, model) {
  return R.map(renderPrintPreviewRow(dispatch), model.print_preview_model);
}

function renderPrintPreviewTable(dispatch, model) {
  return table({ className: 'mt3 f6 w-100 mw8 center br4 bg-black-80'}, [tableHeader, tablePrintPreviewRows(dispatch, model), tablePrintPreviewFooter(model)])
}
// ------- END - RENDER PRINT PREVIEW -----------

function listenToEscapeKey(dispatch) {
   document.onkeyup = function(event) {
       event = event || window.event;
       console.log("event: ", event.keyCode);
       
       if (event.keyCode === ESCAPE_KEY) {
         dispatch(escapeKeyPressedMsg);
       }
     }
}

function modelView(model) {
  //return R.omit(['products', 'filtered_products', 'show_dropdown', 'validation_errors'], model);
  return R.omit(['products', 'filtered_products', 'show_dropdown'], model);
}

export function view(dispatch, model) {
  if (model.block) {
    return div({}, "BLOCKING");
  }
  
  if (model.print_preview_model) {
     listenToEscapeKey(dispatch);
     return div({ className: 'mw8 center' }, [
     div({ className: 'flex'}, [
        div({ className: 'w-50 fl f2 pv2 bb' }, displayOrderHeading(model)),
        div({ className: 'w-50 fr f2 pv2 bb' }, toBRL(model.total_order_cost))
        ]),
     div({ className: 'flex flex-wrap nl2 nr2'}, renderPrintPreviewTable(dispatch, model))]);
  }
  
  // stop listening to keyboard key presses
  document.onkeyup = null;
  return div({ className: 'mw8 center' }, [
    displayError(model),
    div({ className: 'flex'}, [
      div({ className: 'w-50 fl f2 pv2 bb' }, displayOrderHeading(model)),
      div({ className: 'w-30 fr f3 pv2 bb' }, toBRL(model.total_order_cost)),
      ]),
    div(topButtons(dispatch, model)),
    div({ className: 'flex flex-wrap nl2 nr2'}, renderProductForm(dispatch, model)),
    div({ className: 'flex flex-wrap nl2 nr2'}, renderOtherCostsForm(dispatch, model)),
    div({ className: 'flex flex-wrap nl2 nr2'}, [renderOtherCostsTable(dispatch, model), renderExchangeRateTable(dispatch, model)]),
    div({ className: 'flex flex-wrap nl2 nr2'}, renderProductsTable(dispatch, model))
   
//    , div({ className: 'flex flex-wrap nl2 nr2'}, renderItems(model, dispatch))
    , pre(JSON.stringify(modelView(model), null, 2)),
  ]);
}

