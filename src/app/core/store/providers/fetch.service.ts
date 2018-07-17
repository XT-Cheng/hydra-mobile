import { NgRedux } from '@angular-redux/store';
import { HttpClient } from '@angular/common/http';
import { ObjectID } from 'bson';
import { normalize, schema } from 'normalizr';
import { Epic } from 'redux-observable';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, mergeMap, startWith } from 'rxjs/operators';
import { isArray } from 'util';

import { WEBAPI_HOST } from '@core/constants';
import {
    EntityAction,
    entityActionFailed,
    EntityActionPhaseEnum,
    entityActionStarted,
    entityActionSucceeded,
    EntityActionTypeEnum,
    entityLoadAction,
    IPagination,
    IQueryCondition,
} from '@core/store/entity/entity.action';
import { EntityTypeEnum, IEntities } from '@core/store/entity/entity.model';
import { IAppState } from '@core/store/store.model';

export abstract class FetchService {
    private DEFAULT_PAGE = 0;
    private DEFAULT_LIMIT = 50;

    //#region Constructor
    constructor(protected _http: HttpClient,
        protected _store: NgRedux<IAppState>,
        protected _entityType: EntityTypeEnum,
        protected _entitySchema: any,
        protected _url: string) {
    }
    //#endregion

    //#region Actions

    protected startedAction = entityActionStarted(this._entityType);

    protected succeededAction = entityActionSucceeded(this._entityType);

    protected failedAction = entityActionFailed(this._entityType);

    protected loadAction = entityLoadAction(this._entityType);

    //#endregion

    //#region Epic
    public createEpic(): Epic<EntityAction, EntityAction, IAppState>[] {
        return [this.createEpicOfLoad()];
    }

    private createEpicOfLoad(): Epic<EntityAction, EntityAction, IAppState> {
        return (action$, store$) => action$
            .ofType(EntityActionTypeEnum.LOAD).pipe(
                filter(action =>
                    action.payload.entityType === this._entityType
                    && action.payload.phaseType === EntityActionPhaseEnum.TRIGGER),
                mergeMap(action => this.load(action.payload.pagination, action.payload.queryCondition).pipe(
                    map(data => this.succeededAction(EntityActionTypeEnum.LOAD, data)),
                    catchError((errResponse: any) => {
                        return of(this.failedAction(EntityActionTypeEnum.LOAD, errResponse.actionError, action.payload.actionId));
                    }),
                    startWith(this.startedAction(EntityActionTypeEnum.LOAD)))
                ));
    }

    //#endregion

    //#region Public methods

    //#endregion

    //#region Protected methods

    protected loadEntities(pagination: IPagination = { page: this.DEFAULT_PAGE, limit: this.DEFAULT_LIMIT },
        queryCondition: IQueryCondition = {}): string {
        const actionId = new ObjectID().toHexString();
        this._store.dispatch(this.loadAction(pagination, queryCondition, actionId));
        return actionId;
    }

    protected get schema(): any {
        return [this._entitySchema];
    }

    protected afterReceive(record: any): any {
        return Object.assign({}, record);
    }


    protected afterReceiveInner(record: any): any {
        if (isArray(record)) {
            const ret = [];
            Array.from(record).forEach((item) => {
                ret.push(this.afterReceive(item));
            });
            return ret;
        } else {
            return this.afterReceive(record);
        }
    }

    //#endregion

    //#region Private methods
    private load(pagination: IPagination, queryCondition: IQueryCondition): Observable<IEntities> {
        return this._http.get(`${WEBAPI_HOST}/${this._url}`).pipe(
            map(records => {
                return normalize(this.afterReceiveInner(records), this.schema).entities;
            })
        );
    }

    //#endregion

    //#region Public methods

    public fetch(): string {
        return this.loadEntities();
    }

    //#endregion
}
