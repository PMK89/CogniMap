import { Action } from '@ngrx/store';

import { CMEl } from '../models/CMEl';

export function selectedcmel (scme: CMEl = null, action: Action) {
  switch (action.type) {
    case 'ADD_SCMEL':
      // console.log('selected Link:', action.payload.id);
      return action.payload;
    case 'UPDATE_SCMEL':
      if (scme.id === action.payload.id) {
        return Object.assign({}, scme, action.payload, {dirty: true});
      } else {
        return scme;
      }
    case 'DEL_SCMEL':
      return null;
    default:
      return scme;
  }
};
