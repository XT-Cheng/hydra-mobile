import * as Immutable from 'seamless-immutable';

import { EntityAction, EntityActionPhaseEnum, EntityActionTypeEnum } from '@core/store/entity/entity.action';
import { IEntities, INIT_ENTITY_STATE } from '@core/store/entity/entity.model';

export function entityReducer(state: IEntities = INIT_ENTITY_STATE, action: EntityAction): IEntities {
  if (action.payload && action.payload.entities) {
    switch (action.type) {
      case EntityActionTypeEnum.LOAD: {
        // Only action while success
        if (action.payload.phaseType === EntityActionPhaseEnum.SUCCEED) {
          // TODO: Should we use merge or set?
          return Immutable(state).merge(action.payload.entities, { deep: true });
          // Object.keys(action.payload.entities).forEach(key => {
          //   state = Immutable(state).set(key, (<any>Immutable(state[key])).replace(action.payload.entities[key], { deep: true }));
          // });
          // return state;
        }
        break;
      }
      case EntityActionTypeEnum.INSERT:
      case EntityActionTypeEnum.UPDATE: {
        // Only action while success
        if (action.payload.phaseType === EntityActionPhaseEnum.SUCCEED) {
          return Immutable(state).merge(action.payload.entities, { deep: true });
        }
        break;
      }
      case EntityActionTypeEnum.DELETE: {
        // Only action while success
        if (action.payload.phaseType === EntityActionPhaseEnum.SUCCEED) {
          Object.keys(action.payload.entities).forEach(key => {
            Object.keys(action.payload.entities[key]).forEach(id => {
              state = Immutable(state).set(key, Immutable(state[key]).without(id));
            });
          });
        }
      }
    }
  }

  return state;
}
