export enum DialogTypeEnum {
    LOGON_USER = 'P_AN',
    CREATE_BATCH = 'C_GEN',
    MOVE_BATCH = 'C_UMB',
    SPLIT_BATCH = 'CNR.SPLITCREATE',
    UPDATE_BATCH = 'CNR.UPDATE',
    COPY_BATCH = 'CNR.COPY'
}

export const DIALOG_USER = 5500;

export interface IBapiResult {
    isSuccess: boolean;
    error: string;
    description: string;
}
