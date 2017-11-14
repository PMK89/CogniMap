import { Action } from '@ngrx/store';

import { CMColorbar } from '../models/CMColorbar';

export function color (color: CMColorbar = null, action: Action) {
  switch (action.type) {
    case 'UPDATE_CMC':
      if (color.id === action.payload.id) {
        console.log('Store got Button ', action.payload);
        return Object.assign({}, color, action.payload, {dirty: true});
      } else {
        return color;
      }
    default:
      return color;
  }
};
