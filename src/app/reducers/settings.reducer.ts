import { Action } from '@ngrx/store';

import { CMSettings } from '../models/CMSettings';

export function settings (Settings: CMSettings = null, action: Action) {
  switch (action.type) {
    case 'ADD_CMS':
      // console.log(action.payload);
      return Object.assign({}, action.payload, {dirty: true});
    case 'ADD_CMS_FROM_DB':
      // console.log(action.payload);
      return Object.assign({}, action.payload, {dirty: true});
    default:
      return Settings;
  }
};
