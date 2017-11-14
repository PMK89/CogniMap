import { Action } from '@ngrx/store';

import { CMEl } from '../models/CMEl';

export function cmeltemplate (Cme: CMEl = null, action: Action) {
  switch (action.type) {
    case 'ADD_TCMEL':
      // console.log('selected Link:', action.payload.id);
      return Object.assign({}, action.payload, {dirty: true});
    case 'UPDATE_TCMEL':
      if (Cme.id === action.payload.id) {
        return Object.assign({}, Cme, action.payload, {dirty: true});
      } else {
        return Cme;
      }
    case 'DEL_TCMEL':
      return null;
    default:
      return Cme;
  }
};
