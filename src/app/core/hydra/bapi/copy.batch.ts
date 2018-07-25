import { DialogTypeEnum } from '@core/hydra/bapi/constants';
import { DialogBase } from '@core/hydra/bapi/dialog.base';

export class CopyBatch extends DialogBase {
    constructor(private id: string, private newBatchName: string, private qty: number, private badge: string) {
        super(DialogTypeEnum.COPY_BATCH);
    }

    public dialogString(): string {
        return `${super.dialogString()}` +
                `CNR.CNR=${this.id}|` +
                `CNR.CNR:ALT1=${this.newBatchName}|` +
                `CNR.SGR:GUT=${this.qty}|` +
                `CNR.MCNR=${this.id}|` +
                `CNR.OPT:MBEW=J|` +
                `CNR.SGR:REST=${this.qty}|` +
                `KNR=${this.badge}|`;
    }
}
