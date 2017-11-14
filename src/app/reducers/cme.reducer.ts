import { Action } from '@ngrx/store';

import { CME } from '../models/CME';

export function cme (Cme: CME = null, action: Action) {
  switch (action.type) {
    case 'UPDATE_CME':
      if (Cme.id === action.payload.id) {
        // console.log('Store got Cme via UPDATE_CME', action.payload);
        return Object.assign({}, Cme, action.payload, {dirty: true});
      } else {
        return Cme;
      }
    default:
      return Cme;
  }
};
