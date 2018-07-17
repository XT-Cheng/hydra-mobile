import { FluxStandardAction } from 'flux-standard-action';

import { EntityActionPhaseEnum } from '@core/store/entity/entity.action';
import { EntityTypeEnum } from '@core/store/entity/entity.model';
import { IActionMetaInfo, IActionPayload } from '@core/store/store.action';

export interface IDirtyActionPayload extends IActionPayload {
    dirtyId: string;
    entityType: EntityTypeEnum;
    phaseType: DirtyActionPhaseEnum;
    dirtyType: DirtyTypeEnum;
}

export enum DirtyActionPhaseEnum {
    TRIGGER = 'TRIGGER',
    START = 'START',
    FINISHED = 'FINISHED',
    FAIL = 'FAIL',
    EXECUTE = 'EXECUTE'
}

export enum DirtyActionTypeEnum {
    ADD = 'DIRTY:ADD',
    REMOVE = 'DIRTY:REMOVE',
    FLUSH = 'DIRTY:FLUSH'
}

export enum DirtyTypeEnum {
    CREATED = 'created',
    UPDATED = 'updated',
    DELETED = 'deleted',
    ALL = 'all'
}

// Flux-standard-action gives us stronger typing of our actions.
export type DirtyAction = FluxStandardAction<IDirtyActionPayload, IActionMetaInfo>;

const defaultDirtyActionPayload: IDirtyActionPayload = {
    error: null,
    dirtyId: '',
    entityType: null,
    dirtyType: null,
    phaseType: DirtyActionPhaseEnum.EXECUTE,
    actionId: ''
};

const defaultDirtyActionMeta: IActionMetaInfo = {
    progressing: false
};

//#region Add Actions
export function dirtyAddAction(entityType: EntityTypeEnum) {
    return (id: string, dirtyType: DirtyTypeEnum): DirtyAction => ({
        type: DirtyActionTypeEnum.ADD,
        meta: Object.assign({}, defaultDirtyActionMeta),
        payload: Object.assign({}, defaultDirtyActionPayload, {
            dirtyId: id,
            entityType: entityType,
            dirtyType: dirtyType
        })
    });
}
//#endregion

//#region Remove action
export function dirtyRemoveAction(entityType: EntityTypeEnum) {
    return (id: string, dirtyType: DirtyTypeEnum = DirtyTypeEnum.ALL): DirtyAction => ({
        type: DirtyActionTypeEnum.REMOVE,
        meta: Object.assign({}, defaultDirtyActionMeta),
        payload: Object.assign({}, defaultDirtyActionPayload, {
            dirtyId: id,
            entityType: entityType,
            dirtyType: dirtyType
        })
    });
}
//#endregion

//#region Flush action
export function dirtyFlushAction() {
    return (): DirtyAction => ({
        type: DirtyActionTypeEnum.FLUSH,
        meta: Object.assign({}, defaultDirtyActionMeta, {}),
        payload: Object.assign({}, defaultDirtyActionPayload, {
            phaseType: EntityActionPhaseEnum.TRIGGER
        })
    });
}

export function dirtyFlushActionStarted() {
    return (): DirtyAction => ({
        type: DirtyActionTypeEnum.FLUSH,
        meta: Object.assign({}, defaultDirtyActionMeta, {}),
        payload: Object.assign({}, defaultDirtyActionPayload, {
            phaseType: EntityActionPhaseEnum.START
        })
    });
}

export function dirtyFlushActionFailed() {
    return (error): DirtyAction => ({
        type: DirtyActionTypeEnum.FLUSH,
        meta: Object.assign({}, defaultDirtyActionMeta, {}),
        payload: Object.assign({}, defaultDirtyActionPayload, {
            phaseType: EntityActionPhaseEnum.FAIL
        })
    });
}

export function dirtyFlushActionFinished() {
    return (): DirtyAction => ({
        type: DirtyActionTypeEnum.FLUSH,
        meta: Object.assign({}, defaultDirtyActionMeta, {}),
        payload: Object.assign({}, defaultDirtyActionPayload, {
            phaseType: EntityActionPhaseEnum.SUCCEED
        })
    });
}
//#endregion
