import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable()
export class StateService {

    //#region Private members

    private _stateRestored$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

    //#endregion

    //#region Actions

    //#endregion

    //#region Constructor

    constructor(
        private _storage: Storage) {
    }

    //#endregion

    //#region Epic

    //#endregion

    //#region Public methods

    public async restoreState() {
        const value = await this._storage.get('state');

        this._stateRestored$.next(true);

        return value ? value : {};
    }

    public isStateRestored(): Observable<boolean> {
        return this._stateRestored$.pipe(filter(value => !!value));
    }

    //#endregion

    //#region Private methods

    //#endregion

}
