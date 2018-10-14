import { Action } from '@ngrx/store';

import { CMEo } from '../models/CMEo';

export function selectedcmeo (scme: CMEo = null, action: Action) {
  switch (action.type) {
    case 'ADD_SCMEO':
      // console.log('selected Object:', action.payload);
      return action.payload;
    case 'UPDATE_SCMEO':
      if (scme.id === action.payload.id) {
        return Object.assign({}, scme, action.payload, {dirty: true});
      } else {
        return scme;
      }
    case 'DEL_SCMEO':
      return null;
    default:
      return scme;
  }
};
