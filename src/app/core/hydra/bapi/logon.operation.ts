import { DialogBase } from '@core/hydra/bapi/dialog.base';
import { DialogTypeEnum } from '@core/hydra/bapi/constants';

export class LogonOperation extends DialogBase {
    constructor(private operation: string, private machineName: string, private badgeName: string,
        private batchId: string) {
        super(DialogTypeEnum.LOGON_OPERATION);
    }

    public dialogString(): string {
        return `${super.dialogString()}` +
                `ANR=${this.operation}|` +
                `MNR=${this.machineName}|` +
                `CNR=${this.batchId}|` +
                `MST=200|` +
                `KNR=${this.badgeName}|`;
    }
}
