import { Action } from '@ngrx/store';

import { CMSettings } from '../models/CMSettings';


export const settings = (settings: CMSettings = null, action: Action) => {
  switch (action.type) {
    case 'ADD_CMS':
      return Object.assign({}, action.payload, {dirty: true});
    case 'ADD_CMS_FROM_DB':
      // console.log(action.payload);
      return Object.assign({}, action.payload, {dirty: false});
    default:
      return settings;
  }
};
