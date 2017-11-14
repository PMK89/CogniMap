import { Action } from '@ngrx/store';

import { CMElement } from '../models/CMElement';
import { element } from './element.reducer';

export const elements = (elements: Array<CMElement> = [], action: Action) => {
  switch (action.type) {
    case 'ADD_CME':
      console.log(action.payload);
      // return Object.assign({}, action.payload, {dirty: true});
      return elements.concat([Object.assign({}, action.payload, {dirty: true})]);
    case 'ADD_CME_FROM_DB':
      return action.payload;
    case 'UPDATE_CME':
    case 'GET_CME':
    case 'ACTIVATE_CME':
    case 'DEACTIVATE_CME':
    case 'DRAG_CME':
    case 'NODRAG_CME':
    case 'UPDATE_CME_POSITION':
    case 'UPDATE_CME_POSITION0':
    case 'UPDATE_CME_POSITION1':
      return elements.map(_element => element(_element, action));
    default:
      return elements;
  }
};
