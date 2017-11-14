import { Action } from '@ngrx/store';

import { CMElement } from '../models/CMElement';

export const element = (element: CMElement = null, action: Action) => {
  switch (action.type) {
    case 'GET_CME':
            if (element.id === action.payload.id) {
              return element;
            } else {
              return element;
            }
    case 'ACTIVATE_CME':
          if (element.id === action.payload.id) {
            return Object.assign({}, element, {active: true}, {dirty: true});
          } else {
            return element;
          }
    case 'DEACTIVATE_CME':
          if (element.id === action.payload.id) {
            return Object.assign({}, element, {active: false}, {dirty: true});
          } else {
            return element;
          }
    case 'DRAG_CME':
          if (element.id === action.payload.id) {
            return Object.assign({}, element, {dragging: true}, {dirty: true});
          } else {
            return element;
          }
    case 'NODRAG_CME':
          if (element.id === action.payload.id) {
            return Object.assign({}, element, {dragging: false}, {dirty: true});
          } else {
            return element;
          }
    case 'UPDATE_CME':
      if (element.id === action.payload.id) {
        console.log('Store got Element via UPDATE_CME', action.payload);
        return Object.assign({}, element, action.payload, {dirty: true});
      } else {
        return element;
      }
    case 'UPDATE_CME_POSITION':
        if (element.id === action.payload.id) {
          return Object.assign({}, element, {coor: action.payload.coor}, {dirty: true});
        } else {
          return element;
        }
    case 'UPDATE_CME_POSITION0':
      if (element.id === action.payload.id) {
        return Object.assign({}, element, {x0: element.x0 + action.payload.x0, y0: element.y0 + action.payload.y0}, {dirty: true});
      } else {
        return element;
      }
    case 'UPDATE_CME_POSITION1':
      if (element.id === action.payload.id) {
        return Object.assign({}, element, {x1: element.x1 + action.payload.x1, y1: element.y1 + action.payload.y1}, {dirty: true});
      } else {
        return element;
      }
    case 'ADD_CME_FROM_DB':
      console.log('Store got Elements ', action.payload);
      return Object.assign({}, action.payload, {dirty: false});
    case 'UPDATE_CME_FROM_DB':
      if (element.id === action.payload.element.id) {
        return Object.assign({}, action.payload.element, {dirty: false});
      } else {
        return element;
      }
    default:
      return element;
  }
};
