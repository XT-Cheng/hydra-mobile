import { Injectable } from '@angular/core';
import { combineEpics } from 'redux-observable';

import { EntityEpics } from '@core/store/entity/entity.epic';

@Injectable()
export class RootEpics {
  constructor(private _entityEpic: EntityEpics) { }

  public createEpics() {
    return combineEpics(
      ...this._entityEpic.createEpics()
    );
  }
}
