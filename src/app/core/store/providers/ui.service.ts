import { NgRedux } from '@angular-redux/store';
import { BehaviorSubject, Observable } from 'rxjs';

import { IBiz } from '@core/store/bizModel/biz.model';
import { EntityTypeEnum, IEntity } from '@core/store/entity/entity.model';
import { IAppState, STORE_KEY } from '@core/store/store.model';
import { entityFilterAction, entitySearchAction, entitySelectAction } from '@core/store/ui/ui.action';
import { STORE_UI_COMMON_KEY } from '@core/store/ui/ui.model';

export abstract class UIService<T extends IEntity, U extends IBiz> {
    //#region Private members

    private _searchKey: string;
    private _searchKey$: BehaviorSubject<string> = new BehaviorSubject(null);

    private _searchAction;
    private _selectAction;
    private _filterAction;

    //#endregion

    //#region Constructor

    constructor(protected _store: NgRedux<IAppState>, protected _entityType: EntityTypeEnum,
        protected _storeKey: string) {

        this._searchAction = entitySearchAction(this._entityType);
        this._selectAction = entitySelectAction(this._entityType);
        this._filterAction = entityFilterAction(this._entityType);

        this.getSearchKey(this._store).subscribe(value => {
            this._searchKey = value;
            this._searchKey$.next(value);
        });
    }

    //#endregion

    //#region Public property

    public get searchKey(): string {
        return this._searchKey;
    }

    public get searchKey$(): Observable<string> {
        return this._searchKey$.asObservable();
    }

    //#endregion

    //#region Public methods

    public search(searchKey: string) {
        this._store.dispatch(this._searchAction(searchKey));
    }

    public select(bizModel: U) {
        this._store.dispatch(this._selectAction(bizModel.id));
    }

    //#endregion

    //#region Private methods

    private getSearchKey(store: NgRedux<IAppState>): Observable<string> {
        return store.select<string>([STORE_KEY.ui, this._storeKey, STORE_UI_COMMON_KEY.searchKey]);
    }

    //#endregion
}
