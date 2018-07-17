import { FluxStandardAction } from 'flux-standard-action';

import { IError } from '@core/store/error/error.model';

export interface IActionMetaInfo {
    progressing: boolean;
}

export interface IActionPayload {
    error: IError;
    actionId: string;
}

// Flux-standard-action gives us stronger typing of our actions.
export type StoreAction = FluxStandardAction<IActionPayload, IActionMetaInfo>;
