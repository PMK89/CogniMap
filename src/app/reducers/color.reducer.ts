import { Action } from '@ngrx/store';

import { CMColorbar } from '../models/CMColorbar';


export const color = (color: CMColorbar = null, action: Action) => {
  switch (action.type) {
    case 'ADD_CMC':
      return Object.assign({}, action.payload, {dirty: true});
    case 'UPDATE_CMC':
      if (color.id === action.payload.id) {
        console.log('Store got Button ', action.payload);
        return Object.assign({}, color, action.payload, {dirty: true});
      } else {
        return color;
      }
    case 'ADD_CMC_FROM_DB':
      return Object.assign({}, action.payload, {dirty: false});
    case 'UPDATE_CMC_FROM_DB':
      if (color.id === action.payload.color.id) {
        return Object.assign({}, action.payload.color, {dirty: false});
      } else {
        return color;
      }
    default:
      return color;
  }
};
