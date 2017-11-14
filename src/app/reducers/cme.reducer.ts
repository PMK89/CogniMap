import { Action } from '@ngrx/store';

import { CME } from '../models/CME';

export function cme (Cme: CME = null, action: Action) {
  switch (action.type) {
    case 'GET_CME':
            if (Cme.id === action.payload.id) {
              return Cme;
            } else {
              return Cme;
            }
    case 'UPDATE_CME':
      if (Cme.id === action.payload.id) {
        // console.log('Store got Cme via UPDATE_CME', action.payload);
        return Object.assign({}, Cme, action.payload, {dirty: true});
      } else {
        return Cme;
      }
    case 'ADD_CME_FROM_DB':
      // console.log('Store got Cmes ', action.payload);
      return Object.assign({}, action.payload, {dirty: false});
    case 'UPDATE_CME_FROM_DB':
      if (Cme.id === action.payload.Cme.id) {
        return Object.assign({}, action.payload.Cme, {dirty: false});
      } else {
        return Cme;
      }
    default:
      return Cme;
  }
};
