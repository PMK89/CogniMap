import { Action } from '@ngrx/store';

import { CMEo } from '../models/CMEo';

export function cmeotemplate (Cme: CMEo = null, action: Action) {
  switch (action.type) {
    case 'ADD_TCMEO':
      // console.log('selected Link:', action.payload.id);
      return Object.assign({}, action.payload, {dirty: true});
    case 'UPDATE_TCMEO':
      if (Cme.id === action.payload.id) {
        return Object.assign({}, Cme, action.payload, {dirty: true});
      } else {
        return Cme;
      }
    default:
      return Cme;
  }
};
