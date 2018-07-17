import { FluxStandardAction } from 'flux-standard-action';
import { combineReducers } from 'redux-seamless-immutable';

import { dirtyReducer } from '@core/store/dirty/dirty.reducer';
import { entityReducer } from '@core/store/entity/entity.reducer';
import { errorReducer } from '@core/store/error/error.reducer';
import { IActionMetaInfo, IActionPayload } from '@core/store/store.action';
import { IProgress } from '@core/store/store.model';
import { uiReducer } from '@core/store/ui/ui.reducer';

// Define the global store shape by combining our application's
// reducers together into a given structure.
export const rootReducer =
  combineReducers({
    entities: entityReducer,
    progress: progressReducer,
    ui: uiReducer,
    error: errorReducer,
    dirties: dirtyReducer
  });

export function progressReducer(state: IProgress = { progressing: false },
  action: FluxStandardAction<IActionPayload, IActionMetaInfo>): IProgress {
  if (action.meta) {
    return { progressing: !!action.meta.progressing };
  }

  return state;
}
