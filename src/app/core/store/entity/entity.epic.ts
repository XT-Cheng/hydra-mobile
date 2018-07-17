import { Injectable } from '@angular/core';
import { combineEpics } from 'redux-observable';

import { UserService } from '@core/store/providers/user.service';

@Injectable()
export class EntityEpics {
  constructor(private _userService: UserService) { }

  public createEpics(): any {
    return [combineEpics(
      ...this._userService.createEpic(),
    )];
  }
}
