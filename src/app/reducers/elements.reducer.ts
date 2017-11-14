import { Action } from '@ngrx/store';

import { CMElement } from '../models/CMElement';
import { element } from './element.reducer';

export const elements = (elements: Array<CMElement> = [], action: Action) => {
  switch (action.type) {
    case 'ADD_CME':
    case 'ADD_CME_FROM_DB':
      return action.payload;
    case 'UPDATE_CME':
    case 'UPDATE_CME_POSITION':
    case 'UPDATE_CME_POSITION0':
    case 'UPDATE_CME_POSITION1':
      return elements.map(_element => element(_element, action));
    default:
      return elements;
  }
};
