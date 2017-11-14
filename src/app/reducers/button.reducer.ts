import { Action } from '@ngrx/store';

import { CMButton } from '../models/CMButton';


export const button = (button: CMButton = null, action: Action) => {
  switch (action.type) {
    case 'ADD_CMB':
      return Object.assign({}, action.payload, {dirty: true});
    case 'UPDATE_CMB':
      if (button.id === action.payload.id) {
        console.log('Store got Button ', action.payload);
        return Object.assign({}, button, action.payload, {dirty: true});
      } else {
        return button;
      }
    case 'ADD_CMB_FROM_DB':
      return Object.assign({}, action.payload, {dirty: false});
    case 'UPDATE_CMB_FROM_DB':
      if (button.id === action.payload.button.id) {
        return Object.assign({}, action.payload.button, {dirty: false});
      } else {
        return button;
      }
    default:
      return button;
  }
};
