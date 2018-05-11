import { view as viewPOMaster } from './po_master/View';
import { view as viewPODetail } from './po_detail/View';

import { PAGES } from './Update';

function view(dispatch, model) {
  switch (model.page) {
    case PAGES.PO_MASTER: {
      return viewPOMaster(dispatch, model.po_master);
    }
    
    case PAGES.PO_DETAIL: {
      return viewPODetail(dispatch, model.po_detail);
    }
  }
}

export default view;
