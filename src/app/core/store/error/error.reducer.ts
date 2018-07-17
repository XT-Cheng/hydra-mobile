import { FluxStandardAction } from 'flux-standard-action';
import * as Immutable from 'seamless-immutable';

import { IActionMetaInfo, IActionPayload } from '@core/store/store.action';
import { IErrorHub, INIT_ERROR_STATE, STORE_ERRORS_KEY } from '@core/store/error/error.model';

const MAX_ERRORS = 50;

export function errorReducer(state: IErrorHub = INIT_ERROR_STATE,
    action: FluxStandardAction<IActionPayload, IActionMetaInfo>): IErrorHub {
    if (action.error && action.payload.error) {
        const err = action.payload.error;

        if (action.payload.actionId) {
            if (state.errors.length >= MAX_ERRORS) {
                const newErrors = Immutable(state.errors).asMutable();
                newErrors.shift();
                state = Immutable(state).set(STORE_ERRORS_KEY.errors, newErrors);
            }
            state = Immutable(state).set(STORE_ERRORS_KEY.errors, Immutable(state.errors).concat(Object.assign({}, err, {
                actionId: action.payload.actionId
            })));
        }
        state = Immutable(state).set(STORE_ERRORS_KEY.lastError, err);
    } else {
        state = Immutable(state).set(STORE_ERRORS_KEY.lastError, null);
    }
    return state;
}
