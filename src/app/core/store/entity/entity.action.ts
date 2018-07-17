import { FluxStandardAction } from 'flux-standard-action';

import { IBiz } from '@core/store/bizModel/biz.model';
import { IError } from '@core/store/error/error.model';
import { IActionMetaInfo, IActionPayload } from '@core/store/store.action';
import { STORE_UI_KEY } from '@core/store/ui/ui.model';
import { EntityTypeEnum, IEntities, STORE_ENTITIES_KEY } from '@core/store/entity/entity.model';

export enum EntityActionPhaseEnum {
    TRIGGER = 'TRIGGER',
    START = 'START',
    SUCCEED = 'SUCCEED',
    FAIL = 'FAIL',
    EXECUTE = 'EXECUTE'
}

export enum EntityActionTypeEnum {
    LOAD = 'ENTITY:LOAD',
    SAVE = 'ENTITY:SAVE',
    UPDATE = 'ENTITY:UPDATE',
    INSERT = 'ENTITY:INSERT',
    DELETE = 'ENTITY:DELETE',
}

export interface IPagination {
    page: number;
    limit: number;
}

export interface IQueryCondition {
    [key: string]: string;
}

export interface IEntityActionPayload extends IActionPayload {
    entities: IEntities;
    bizModel: IBiz;
    bizModelId: string;
    queryCondition: IQueryCondition;
    pagination: IPagination;
    entityType: EntityTypeEnum;
    phaseType: EntityActionPhaseEnum;
    dirtyMode: boolean;
    files: Map<string, any[]>;
}

// Flux-standard-action gives us stronger typing of our actions.
export type EntityAction = FluxStandardAction<IEntityActionPayload, IActionMetaInfo>;

const defaultEntityActionMeta: IActionMetaInfo = {
    progressing: false
};

const defaultEntityActionPayload: IEntityActionPayload = {
    pagination: null,
    entityType: null,
    phaseType: null,
    error: null,
    entities: null,
    bizModel: null,
    bizModelId: '',
    queryCondition: null,
    dirtyMode: false,
    actionId: '',
    files: null
};

export function getEntityKey(typeEnum: EntityTypeEnum): string {
    switch (typeEnum) {
        case EntityTypeEnum.USER: {
            return STORE_ENTITIES_KEY.users;
        }
        default:
            throw new Error(`Unknown EntityType ${typeEnum}`);
    }
}

export function getUIKey(typeEnum: EntityTypeEnum): string {
    switch (typeEnum) {
        case EntityTypeEnum.USER: {
            return STORE_UI_KEY.user;
        }
        default:
            throw new Error(`Unknown EntityType ${typeEnum}`);
    }
}

export function getEntityType(type: string): EntityTypeEnum {
    switch (type) {
        case STORE_ENTITIES_KEY.users: {
            return EntityTypeEnum.USER;
        }
        default:
            return null;
    }
}

export function entityActionStarted(entityType: EntityTypeEnum) {
    return (actionType: EntityActionTypeEnum): EntityAction => ({
        type: actionType,
        meta: Object.assign({}, defaultEntityActionMeta, {
            progressing: true,
        }),
        payload: Object.assign({}, defaultEntityActionPayload, {
            entityType: entityType,
            phaseType: EntityActionPhaseEnum.START
        })
    });
}

export function entityActionFailed(entityType: EntityTypeEnum) {
    return (actionType: EntityActionTypeEnum, error: IError, actionId: string): EntityAction => ({
        type: actionType,
        error: true,
        meta: defaultEntityActionMeta,
        payload: Object.assign({}, defaultEntityActionPayload, {
            entityType: entityType,
            phaseType: EntityActionPhaseEnum.FAIL,
            error: Object.assign({}, error, { actionId: actionId }),
            actionId: actionId
        })
    });
}

export function entityActionSucceeded(entityType: EntityTypeEnum) {
    return (actionType: EntityActionTypeEnum, entities: IEntities): EntityAction => ({
        type: actionType,
        meta: defaultEntityActionMeta,
        payload: Object.assign({}, defaultEntityActionPayload, {
            entityType: entityType,
            phaseType: EntityActionPhaseEnum.SUCCEED,
            entities: entities,
        })
    });
}

//#region Load Actions
export function entityLoadAction(entityType: EntityTypeEnum) {
    return (pagination: IPagination, queryCondition: IQueryCondition, actionId: string): EntityAction => ({
        type: EntityActionTypeEnum.LOAD,
        meta: Object.assign({}, defaultEntityActionMeta, {
            progressing: true,
        }),
        payload: Object.assign({}, defaultEntityActionPayload, {
            pagination: pagination,
            entityType: entityType,
            phaseType: EntityActionPhaseEnum.TRIGGER,
            queryCondition: queryCondition,
            actionId: actionId
        })
    });
}

//#endregion

//#region Update action
export function entityUpdateAction<U>(entityType: EntityTypeEnum) {
    return (id: string, bizModel: U, files: Map<string, any[]>, dirtyMode: boolean, actionId: string): EntityAction => ({
        type: EntityActionTypeEnum.UPDATE,
        meta: defaultEntityActionMeta,
        payload: Object.assign({}, defaultEntityActionPayload, {
            entityType: entityType,
            phaseType: EntityActionPhaseEnum.TRIGGER,
            bizModel: bizModel,
            dirtyMode: dirtyMode,
            actionId: actionId,
            files: files
        })
    });
}
//#endregion

//#region Insert action
export function entityInsertAction<U>(entityType: EntityTypeEnum) {
    return (id: string, bizModel: U, files: Map<string, any[]>, dirtyMode: boolean, actionId: string): EntityAction => ({
        type: EntityActionTypeEnum.INSERT,
        meta: defaultEntityActionMeta,
        payload: Object.assign({}, defaultEntityActionPayload, {
            entityType: entityType,
            phaseType: EntityActionPhaseEnum.TRIGGER,
            bizModel: bizModel,
            dirtyMode: dirtyMode,
            actionId: actionId,
            files: files
        })
    });
}
//#endregion

//#region Delete action
export function entityDeleteAction<U>(entityType: EntityTypeEnum) {
    return (id: string, bizModel: U, dirtyMode: boolean, actionId: string): EntityAction => ({
        type: EntityActionTypeEnum.DELETE,
        meta: defaultEntityActionMeta,
        payload: Object.assign({}, defaultEntityActionPayload, {
            entityType: entityType,
            phaseType: EntityActionPhaseEnum.TRIGGER,
            bizModel: bizModel,
            bizModelId: id,
            actionId: actionId,
            dirtyMode: dirtyMode
        })
    });
}
//#endregion
