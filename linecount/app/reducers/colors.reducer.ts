import { Action } from '@ngrx/store';

import { CMColorbar } from '../models/CMColorbar';
import { color } from './color.reducer';

export function colors (colors: CMColorbar[] = [], action: Action) {
  switch (action.type) {
    case 'ADD_CMC':
    case 'ADD_CMC_FROM_DB':
      return action.payload;
    case 'UPDATE_CMC':
      return colors.map((_color) => color(_color, action));
    default:
      return colors;
  }
};
