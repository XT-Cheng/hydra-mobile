import { NgRedux } from '@angular-redux/store';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import * as Immutable from 'seamless-immutable';

import { IError, STORE_ERRORS_KEY } from '@core/store/error/error.model';
import { IAppState, STORE_KEY } from '@core/store/store.model';

@Injectable()
export class ErrorService {
    //#region Private member

    private _lastError$: BehaviorSubject<IError> = new BehaviorSubject(null);

    //#endregion

    //#region Constructor
    constructor(protected _store: NgRedux<IAppState>) {
        this.getLastError(this._store).subscribe((value) => {
            this._lastError$.next(value);
        });
    }
    //#endregion

    //#region Public methods

    public get lastError$(): Observable<IError> {
        return this._lastError$.asObservable();
    }

    public getActionError$(actionId: string): Observable<IError> {
        return this._store.select<IError[]>([STORE_KEY.error, STORE_ERRORS_KEY.errors]).pipe(
            map((errors) => {
                const actionError = errors.find((error) => error.actionId === actionId);
                if (actionError) {
                    return Immutable(errors.find((error) => error.actionId === actionId)).asMutable();
                }

                return null;
            }),
            filter((value) => !!value),
            take(1)
        );
    }

    //#endregion

    //#region Error Selector

    private getLastError(store: NgRedux<IAppState>): Observable<IError> {
        return store.select<IError>([STORE_KEY.error, STORE_ERRORS_KEY.lastError]).pipe(
            map((error) => {
                if (error) {
                    return Immutable(error).asMutable();
                }

                return null;
            })
        );
    }

    //#endregion
}
