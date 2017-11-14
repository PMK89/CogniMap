import { Action } from '@ngrx/store';

import { CME } from '../models/CME';
import { cme } from './cme.reducer';

export function cmes (Cmes: CME[] = [], action: Action) {
  switch (action.type) {
    case 'ADD_CME':
      return Cmes.concat([Object.assign({}, action.payload, {dirty: true})]);
    case 'ADD_CME_FROM_DB':
      // let d = new Date();
      // console.log('reducer: ', action.payload));
      return action.payload;
    case 'DEL_CME':
      return Cmes.filter((cmex) => {
        return cmex.id !== action.payload;
      });
    case 'UPDATE_CME':
      return Cmes.map((Cme) => cme(Cme, action));
    default:
      return Cmes;
  }
};
