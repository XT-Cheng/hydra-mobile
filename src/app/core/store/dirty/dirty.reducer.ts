import * as Immutable from 'seamless-immutable';

import { getEntityKey } from '@core/store/entity/entity.action';
import { DirtyAction, DirtyActionPhaseEnum, DirtyActionTypeEnum, DirtyTypeEnum } from '@core/store/dirty/dirty.action';
import { IDirties, INIT_DIRTY_STATE, STORE_DIRTIES_KEY } from '@core/store/dirty/dirty.model';

export function dirtyReducer(state: IDirties = INIT_DIRTY_STATE, action: DirtyAction): IDirties {
  if (action.type === DirtyActionTypeEnum.ADD
    || action.type === DirtyActionTypeEnum.FLUSH
    || action.type === DirtyActionTypeEnum.REMOVE) {
    let newDirtyIds: Array<string>;

    const entityType = (action.payload.entityType) ? getEntityKey(action.payload.entityType) : null;
    const dirtyType = action.payload.dirtyType;

    const dirtyIds = state.dirtyIds;

    switch (action.type) {
      case DirtyActionTypeEnum.ADD: {
        if (dirtyIds[entityType][DirtyTypeEnum.CREATED].find(id => id === action.payload.dirtyId)) {
          return state;
        }
        state = Immutable(state).setIn([STORE_DIRTIES_KEY.dirtyIds, entityType],
          clear(Immutable(state.dirtyIds[entityType]).asMutable(), action.payload.dirtyId));
        newDirtyIds = state.dirtyIds[entityType][dirtyType].concat(action.payload.dirtyId);
        break;
      }
      case DirtyActionTypeEnum.REMOVE: {
        state = Immutable(state).setIn([STORE_DIRTIES_KEY.dirtyIds, entityType],
          clear(Immutable(state.dirtyIds[entityType]).asMutable(), action.payload.dirtyId));
        break;
      }
      case DirtyActionTypeEnum.FLUSH: {
        switch (action.payload.phaseType) {
          case DirtyActionPhaseEnum.START: {
            state = Immutable(state).set(STORE_DIRTIES_KEY.syncing, true);
            break;
          }
          case DirtyActionPhaseEnum.TRIGGER: {
            break;
          }
          case DirtyActionPhaseEnum.FINISHED: {
            state = Immutable(state).set(STORE_DIRTIES_KEY.lastSynced, new Date());
            state = Immutable(state).set(STORE_DIRTIES_KEY.syncing, false);
            break;
          }
          case DirtyActionPhaseEnum.FAIL: {
            break;
          }
        }
        break;
      }
    }

    if (newDirtyIds) {
      state = Immutable(state).setIn([STORE_DIRTIES_KEY.dirtyIds, entityType, dirtyType], newDirtyIds);
    }
  }
  return state;
}

function clear(state: { created: string[], updated: string[], deleted: string[] }, toBeClear: string) {
  state.created = state.created.filter((id) => toBeClear !== id);
  state.updated = state.updated.filter((id) => toBeClear !== id);
  state.deleted = state.deleted.filter((id) => toBeClear !== id);

  return state;
}
