import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export interface Action {
  type: string;
  payload?: any;
}

export class Dispatcher extends BehaviorSubject<Action> {
  public static INIT = '@ngrx/store/init';

  constructor() {
    super({ type: Dispatcher.INIT });
  }

  public dispatch(action: Action): void {
    this.next(action);
  }

    public complete() {
    // noop
  }
}
