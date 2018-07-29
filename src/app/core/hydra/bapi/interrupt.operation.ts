import { DialogBase } from '@core/hydra/bapi/dialog.base';
import { DialogTypeEnum } from '@core/hydra/bapi/constants';

export class InterruptOperation extends DialogBase {
    constructor(private operation: string, private machineName: string, private badgeName: string) {
        super(DialogTypeEnum.INTERRUPT_OPERATION);
    }

    public dialogString(): string {
        return `${super.dialogString()}` +
                `ANR=${this.operation}|` +
                `MNR=${this.machineName}|` +
                `MST=399|` +
                `KNR=${this.badgeName}|`;
    }
}
