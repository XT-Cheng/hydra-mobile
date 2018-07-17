
export enum STORE_ERRORS_KEY {
    lastError = 'lastError',
    errors = 'errors'
}

export interface IError {
    actionId: string;
    description: string;
    stack: string;
    network: boolean;
}

export interface IErrorHub {
    lastError: IError;
    errors: IError[];
}

export const INIT_ERROR_STATE: IErrorHub = {
    lastError: null,
    errors: []
};
