import { FluxStandardAction } from 'flux-standard-action';

import { EntityTypeEnum } from '@core/store/entity/entity.model';
import { IActionMetaInfo, IActionPayload } from '@core/store/store.action';

export enum UIActionTypeEnum {
    SELECT = 'UI:SELECT',
    SEARCH = 'UI:SEARCH',
    FILTER = 'UI:FILTER'
}

export interface IUIActionPayload extends IActionPayload {
    entityType: EntityTypeEnum;
    searchKey: string;
    selectedId: string;
    filter: {
        selectedCriteriaId: string,
        unSelectedCriteriaIds: string[]
    };
}

// Flux-standard-action gives us stronger typing of our actions.
export type UIAction = FluxStandardAction<IUIActionPayload, IActionMetaInfo>;

export const defaultUIActionPayload: IUIActionPayload = {
    error: null,
    entityType: null,
    searchKey: '',
    selectedId: '',
    filter: null,
    actionId: ''
};

//#region Search Actions
export function entitySearchAction(entityType: EntityTypeEnum) {
    return (searchKey: string) => ({
        type: UIActionTypeEnum.SEARCH,
        meta: { progressing: false },
        payload: Object.assign({}, defaultUIActionPayload, {
            entityType: entityType,
            searchKey: searchKey
        })
    });
}

export function entitySelectAction(entityType: EntityTypeEnum) {
    return (selectedId: string) => ({
        type: UIActionTypeEnum.SELECT,
        meta: { progressing: false },
        payload: Object.assign({}, defaultUIActionPayload, {
            entityType: entityType,
            selectedId: selectedId
        })
    });
}

export function entityFilterAction(entityType: EntityTypeEnum) {
    return (selectedCriteriaId: string, unSelectedCriteriaIds: string[]) => ({
        type: UIActionTypeEnum.FILTER,
        meta: { progressing: false },
        payload: Object.assign({}, defaultUIActionPayload, {
            entityType: entityType,
            filter: {
                selectedCriteriaId: selectedCriteriaId,
                unSelectedCriteriaIds: unSelectedCriteriaIds
            }
        })
    });
}
