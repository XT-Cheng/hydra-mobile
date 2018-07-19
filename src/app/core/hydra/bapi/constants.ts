export enum DialogTypeEnum {
    LOGON_USER = 'P_AN'
}

export const DIALOG_USER = 5500;

export interface IBapiResult {
    isSuccess: boolean;
    error: string;
    description: string;
}
