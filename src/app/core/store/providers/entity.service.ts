import { NgRedux } from '@angular-redux/store';
import { HttpClient } from '@angular/common/http';
import { denormalize, normalize, schema } from 'normalizr';
import { Epic } from 'redux-observable';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ObjectID } from 'bson';
import {
    catchError,
    combineLatest,
    concat,
    filter,
    map,
    mapTo,
    mergeMap,
    race,
    skip,
    startWith,
    switchMap,
    take,
} from 'rxjs/operators';
import * as Immutable from 'seamless-immutable';
import { isArray } from 'util';

import { WEBAPI_HOST } from '@core/constants';
import { IBiz } from '@core/store/bizModel/biz.model';
import { dirtyAddAction, dirtyRemoveAction, DirtyTypeEnum } from '@core/store/dirty/dirty.action';
import {
    EntityAction,
    EntityActionPhaseEnum,
    EntityActionTypeEnum,
    entityDeleteAction,
    entityInsertAction,
    entityUpdateAction,
    getEntityKey,
    getUIKey,
} from '@core/store/entity/entity.action';
import { EntityTypeEnum, IEntities, IEntity } from '@core/store/entity/entity.model';
import { IAppState, STORE_KEY } from '@core/store/store.model';
import { STORE_UI_COMMON_KEY } from '@core/store/ui/ui.model';
import { ErrorService } from '@core/store/providers/error.service';
import { FetchService } from '@core/store/providers/fetch.service';
import { UIService } from '@core/store/providers/ui.service';

export abstract class EntityService<T extends IEntity, U extends IBiz> extends FetchService {
    //#region Constructor

    constructor(protected _http: HttpClient,
        protected _store: NgRedux<IAppState>,
        protected _entityType: EntityTypeEnum,
        protected _entitySchema: schema.Entity,
        protected _url: string,
        protected _errorService: ErrorService,
        protected _uiService: UIService<T, U> = null) {
        super(_http, _store, _entityType, _entitySchema, _url);

        this.getAll(this._store).subscribe((value) => {
            this._all = value;
            this._all$.next(value);
        });

        this.getSelected(this._store).subscribe((value) => {
            this._selected = value;
            this._selected$.next(value);
        });

        if (this._uiService) {
            this.getSearched(this._store).subscribe((value) => {
                this._searched$.next(value);
            });
        }
    }

    //#endregion

        //#region Actions

    //#region Entity Actions

    protected updateAction = entityUpdateAction<U>(this._entityType);

    protected insertAction = entityInsertAction<U>(this._entityType);

    protected deleteAction = entityDeleteAction<U>(this._entityType);

    protected addDirtyAction = dirtyAddAction(this._entityType);

    protected removeDirtyAction = dirtyRemoveAction(this._entityType);

    //#endregion

    //#region UI Actions

    //#endregion

   //#endregion

    //#region Protected member

    protected _all$: BehaviorSubject<U[]> = new BehaviorSubject([]);
    protected _all: U[] = [];

    protected _selected: U;
    protected _selected$: BehaviorSubject<U> = new BehaviorSubject(null);

    protected _searched: U[];
    protected _searched$: BehaviorSubject<U[]> = new BehaviorSubject(null);

    protected _filtered: U[];
    protected _filtered$: BehaviorSubject<U[]> = new BehaviorSubject(null);

    protected _filteredAndSearched: U[];
    protected _filteredAndSearched$: BehaviorSubject<U[]> = new BehaviorSubject(null);

    //#endregion

    //#region Entity Selector

    private getById(id: string): Observable<U> {
        return this._store.select<T>([STORE_KEY.entities, getEntityKey(this._entityType), id]).pipe(
            map(ct => {
                return ct ? denormalize(ct.id, this._entitySchema,
                    Immutable(this._store.getState().entities).asMutable({ deep: true })) : null;
            })
        );
    }

    private getAll(store: NgRedux<IAppState>): Observable<U[]> {
        return store.select<{ [id: string]: T }>([STORE_KEY.entities, getEntityKey(this._entityType)]).pipe(
            map((data) => {
                return denormalize(Object.keys(data), [this._entitySchema], Immutable(store.getState().entities).asMutable({ deep: true }));
            })
        );
    }

    private getSelectedId(store: NgRedux<IAppState>): Observable<string> {
        return store.select<string>([STORE_KEY.ui, getUIKey(this._entityType), STORE_UI_COMMON_KEY.selectedId]);
    }

    private getSelected(store: NgRedux<IAppState>): Observable<U> {
        return this.getSelectedId(store).pipe(
            switchMap(id => {
                return store.select<T>([STORE_KEY.entities, getEntityKey(this._entityType), id]);
            }),
            map(ct => {
                return ct ? denormalize(ct.id, this._entitySchema, Immutable(store.getState().entities).asMutable({ deep: true })) : null;
            })
        );
    }

    private getSearched(store: NgRedux<IAppState>): Observable<U[]> {
        return this.all$.pipe(
            combineLatest(this._uiService.searchKey$, (cities, searchKey) => {
                return cities.filter(c => {
                    let matchSearchKey = true;
                    if (searchKey !== '') {
                        matchSearchKey = this.search(c, searchKey);
                    }

                    return matchSearchKey;
                });
            })
        );
    }

    //#endregion

    //#region Entity Selector

    public get all$(): Observable<U[]> {
        return this._all$.asObservable();
    }

    public get selected$(): Observable<U> {
        return this._selected$.asObservable();
    }

    public get selected(): U {
        return this._selected;
    }

    public get searched$(): Observable<U[]> {
        return this._searched$.asObservable();
    }

    public get filtered(): U[] {
        return this._filtered;
    }

    public get filtered$(): Observable<U[]> {
        return this._filtered$.asObservable();
    }

    public get filteredAndSearched$(): Observable<U[]> {
        return this._filteredAndSearched$.asObservable();
    }

    //#endregion

   //#region Epic
    public createEpic(): Epic<EntityAction, EntityAction, IAppState>[] {
        return [...super.createEpic(), this.createEpicOfDML(), this.createEpicOfDMLForDirtyMode()];
    }

    private createEpicOfDML(): Epic<EntityAction, EntityAction, IAppState> {
        return (action$, store$) => action$
            .ofType(EntityActionTypeEnum.INSERT, EntityActionTypeEnum.DELETE, EntityActionTypeEnum.UPDATE).pipe(
                filter(action =>
                    action.payload.entityType === this._entityType
                    && action.payload.phaseType === EntityActionPhaseEnum.TRIGGER
                    && !action.payload.dirtyMode),
                mergeMap(action => {
                    const bizModel = <U>action.payload.bizModel;
                    const bizModelId = action.payload.bizModelId;
                    let ret: Observable<IEntities>;
                    switch (action.type) {
                        case EntityActionTypeEnum.INSERT: {
                            ret = this.insert(bizModel, action.payload.files);
                            break;
                        }
                        case EntityActionTypeEnum.DELETE: {
                            ret = this.delete(bizModelId);
                            break;
                        }
                        case EntityActionTypeEnum.UPDATE: {
                            ret = this.update(bizModel, action.payload.files);
                            break;
                        }
                    }
                    return ret.pipe(
                        map(data => this.succeededAction(<EntityActionTypeEnum>(action.type), data)),
                        catchError((errResponse: any) => {
                            return of(this.failedAction(<EntityActionTypeEnum>(action.type),
                                errResponse.actionError, action.payload.actionId));
                        }),
                        startWith(this.startedAction(<EntityActionTypeEnum>(action.type))));
                }));
    }

    private createEpicOfDMLForDirtyMode(): Epic<EntityAction, EntityAction, IAppState> {
        return (action$, store$) => action$
            .ofType(EntityActionTypeEnum.INSERT, EntityActionTypeEnum.DELETE, EntityActionTypeEnum.UPDATE).pipe(
                filter(action =>
                    action.payload.entityType === this._entityType
                    && action.payload.phaseType === EntityActionPhaseEnum.TRIGGER
                    && action.payload.dirtyMode),
                mergeMap(action => {
                    const bizModel = <U>action.payload.bizModel;
                    const bizModelId = action.payload.bizModelId;
                    let dirtyType: DirtyTypeEnum;
                    let ret: Observable<IEntities>;
                    switch (action.type) {
                        case EntityActionTypeEnum.INSERT: {
                            dirtyType = DirtyTypeEnum.CREATED;
                            ret = this.insert(bizModel, action.payload.files);
                            break;
                        }
                        case EntityActionTypeEnum.DELETE: {
                            dirtyType = DirtyTypeEnum.DELETED;
                            ret = this.delete(bizModelId);
                            break;
                        }
                        case EntityActionTypeEnum.UPDATE: {
                            dirtyType = DirtyTypeEnum.UPDATED;
                            ret = this.update(bizModel, action.payload.files);
                            break;
                        }
                    }
                    return ret.pipe(
                        map(data => this.succeededAction(<EntityActionTypeEnum>(action.type), data)),
                        catchError((errResponse: any) => {
                            const entities = normalize([this.afterReceiveInner(bizModel)], this.schema).entities;
                            return of(this.addDirtyAction(bizModel.id, dirtyType)).pipe(
                                concat(of(this.succeededAction(<EntityActionTypeEnum>(action.type), entities),
                                    this.failedAction(<EntityActionTypeEnum>(action.type),
                                        errResponse.actionError, action.payload.actionId))));
                        }),
                        startWith<any>(this.startedAction(<EntityActionTypeEnum>(action.type)),
                            this.removeDirtyAction(bizModel.id)));
                }));
    }
    //#endregion

    //#region Protected methods

    protected insertEntity(bizModel: U, files: Map<string, any[]>, dirtyMode: boolean = false): Observable<U> {
        const actionId = new ObjectID().toHexString();
        this._store.dispatch(this.insertAction(bizModel.id, bizModel, files, dirtyMode, actionId));

        return this.getById(bizModel.id).pipe(
            filter((found) => !!found),
            race(this._errorService.getActionError$(actionId).pipe(
                map((err) => {
                    throw err;
                }))),
            take(1)
        );
    }

    protected updateEntity(bizModel: U, files: Map<string, any[]>, dirtyMode: boolean = false): Observable<U> {
        if (dirtyMode && this.isDirtyExist(bizModel.id, DirtyTypeEnum.CREATED)) {
            return this.insertEntity(bizModel, files, dirtyMode);
        } else {
            const actionId = new ObjectID().toHexString();
            this._store.dispatch(this.updateAction(bizModel.id, bizModel, files, dirtyMode, actionId));

            return this.getById(bizModel.id).pipe(
                skip(1),
                race(this._errorService.getActionError$(actionId).pipe(
                    map((err) => {
                        throw err;
                    }))),
                take(1)
            );
        }
    }

    protected deleteEntity(bizModel: U | IBiz, dirtyMode: boolean = false): Observable<U> {
        if (dirtyMode && this.isDirtyExist(bizModel.id, DirtyTypeEnum.CREATED)) {
            const entities = normalize(this.afterReceiveInner(<U>bizModel), this._entitySchema).entities;
            this._store.dispatch(this.removeDirtyAction(bizModel.id));
            this._store.dispatch(this.succeededAction(<EntityActionTypeEnum>(EntityActionTypeEnum.DELETE), entities));

            return this.getById(bizModel.id).pipe(
                filter((found) => !found),
                mapTo(<U>bizModel),
                take(1));
        } else {
            const actionId = new ObjectID().toHexString();
            this._store.dispatch(this.deleteAction(bizModel.id, <U>bizModel, dirtyMode, actionId));

            return this.getById(bizModel.id).pipe(
                filter((found) => !found),
                mapTo(<U>bizModel),
                race(this._errorService.getActionError$(actionId).pipe(
                    map((err) => {
                        throw err;
                    }))),
                take(1)
            );
        }
    }

    protected beforeSend(bizModel: U): any {
        return Object.assign({}, bizModel);
    }


    protected beforeSendInner(record: U | U[]): any[] {
        if (isArray(record)) {
            const ret = [];
            (<U[]>record).forEach((item) => {
                ret.push(this.beforeSend(<U>item));
            });
            return ret;
        } else {
            return [this.beforeSend(<U>record)];
        }
    }

    protected search(bizModel: U, searchKey: any): boolean {
        return false;
    }

    //#endregion

    //#region Private methods

    private isDirtyExist(dirtyId: string, dirtyType: DirtyTypeEnum): boolean {
        let found = false;
        const dirtyIds = this._store.getState().dirties.dirtyIds[getEntityKey(this._entityType)];

        if (dirtyIds && dirtyIds[dirtyType]) {
            Object.keys(dirtyIds[dirtyType]).forEach((key) => {
                if (dirtyIds[dirtyType][key] === dirtyId) {
                    found = true;
                }
            });
        }

        return found;
    }

    private insert(bizModel: U, files: Map<string, any[]>): Observable<IEntities> {
        const formData: FormData = new FormData();

        formData.append(getEntityKey(this._entityType), JSON.stringify(this.beforeSendInner(bizModel)));

        if (files && files.size > 0) {
            for (const key of Array.from(files.keys())) {
                for (let i = 0; i < files.get(key).length; i++) {
                    formData.append(`${key}${i}`, files.get(key)[i], files.get(key)[i].filename);
                }
            }
        }

        return this._http.post(`${WEBAPI_HOST}/${this._url}`, formData).pipe(
            map(records => {
                return normalize(this.afterReceiveInner(records), this.schema).entities;
            })
        );
    }

    private update(bizModel: U, files: Map<string, any[]>, ): Observable<IEntities> {
        const formData: FormData = new FormData();

        formData.append(getEntityKey(this._entityType), JSON.stringify(this.beforeSendInner(bizModel)));

        if (files && files.size > 0) {
            for (const key of Array.from(files.keys())) {
                for (let i = 0; i < files.get(key).length; i++) {
                    formData.append(`${key}${i}`, files.get(key)[i], files.get(key)[i].name);
                }
            }
        }

        return this._http.put(`${WEBAPI_HOST}/${this._url}`, formData).pipe(
            map(records => {
                return normalize(this.afterReceiveInner(records), this.schema).entities;
            })
        );
    }

    private delete(id: string): Observable<IEntities> {
        return this._http.delete(`${WEBAPI_HOST}/${this._url}/${id}`).pipe(
            map(records => {
                return normalize(this.afterReceiveInner(records), this.schema).entities;
            })
        );
    }
    //#endregion

    //#region Public methdos

    public add(biz: U, files: Map<string, any[]> = null): Observable<U> {
        return this.insertEntity(biz, files);
    }

    public change(biz: U, files: Map<string, any[]> = null): Observable<U> {
        return this.updateEntity(biz, files);
    }

    public remove(biz: U): Observable<U> {
        return this.deleteEntity(biz);
    }

    public addById(id: string) {
        const toAdd = this.byId(id);
        if (!toAdd) { throw new Error(`${this._entityType} Id ${id} not exist!`); }

        this.insertEntity(toAdd, null, true);
    }

    public changeById(id: string) {
        const toChange = this.byId(id);
        if (!toChange) { throw new Error(`${this._entityType} Id ${id} not exist!`); }

        this.updateEntity(toChange, null, true);
    }

    public removeById(id: string) {
        this.deleteEntity({ id: id }, true);
    }

    public byId(id: string): U {
        return denormalize(id, this._entitySchema, Immutable(this._store.getState().entities).asMutable({ deep: true }));
    }
    //#endregion
}
