import { Action } from '@ngrx/store';

import { CMButton } from '../models/CMButton';
import { button } from './button.reducer';


export const buttons = (buttons: Array<CMButton> = [], action: Action) => {
  switch (action.type) {
    case 'ADD_CMB':
    case 'ADD_CMB_FROM_DB':
      return action.payload;
    case 'UPDATE_CMB':
      return buttons.map(_button => button(_button, action));
    default:
      return buttons;
  }
};
