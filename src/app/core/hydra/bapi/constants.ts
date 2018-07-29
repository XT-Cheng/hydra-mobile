export enum DialogTypeEnum {
    LOGON_USER = 'P_AN',
    CREATE_BATCH = 'C_GEN',
    MOVE_BATCH = 'C_UMB',
    SPLIT_BATCH = 'CNR.SPLITCREATE',
    UPDATE_BATCH = 'CNR.UPDATE',
    COPY_BATCH = 'CNR.COPY',
    MERGE_BATCH = 'CNR.SUMMARIZE',
    LOGON_OPERATION = 'A_AN',
    INTERRUPT_OPERATION = 'A_UN',
    LOGOFF_OPERATION = 'A_AB',
    LOGON_INPUT_BATCH = 'CE_AN',
    LOGOFF_INPUT_BATCH = 'CE_AB',
    GENERATE_BATCH_NAME = 'CNRGEN.CREATENR',
    GENERATE_BATCH_CONNECTION = 'CNRBAUM.INSERT',
    CHANGE_OUTPUT_BATCH = 'CA_WL'
}

export const DIALOG_USER = 2500;

export interface IBapiResult {
    isSuccess: boolean;
    error: string;
    description: string;
}
