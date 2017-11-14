import { Action } from '@ngrx/store';

import { CMElement } from '../models/element';

export const selectedElement = (element: CMElement = null, action: Action) => {
  switch (action.type) {
    case 'ADD_SCME':
      console.log('selected Element');
      return Object.assign({}, action.payload, {dirty: true});
    case 'UPDATE_SCME':
      if (element.id === action.payload.id) {
        return Object.assign({}, element, action.payload, {dirty: true});
      } else {
        return element;
      }
    default:
      return element;
  }
};
