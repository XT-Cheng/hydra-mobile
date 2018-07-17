import { combineReducers } from 'redux-seamless-immutable';

import { userReducer } from '@core/store/ui/reducer/user.reducer';

export const uiReducer =
    combineReducers({
        user: userReducer,
    });
