import { DialogBase } from '@core/hydra/bapi/dialog.base';
import { DialogTypeEnum } from '@core/hydra/bapi/constants';

export class UpdateBatch extends DialogBase {
    constructor(private id: string, private badge: string, private batchName: string, private qty: number) {
        super(DialogTypeEnum.UPDATE_BATCH);
    }

    public dialogString(): string {
        let dialog = `${super.dialogString()}` +
        `CNR.CNR=${this.id}|` +
        `CNR.OPT:MBEW=J|` +
        `KNR=${this.badge}|`;

        if (this.batchName !== null && this.batchName !== '') {
            dialog += `CNR.CNR:ALT1=${this.batchName}|`;
        }

        if (this.qty !== null && this.qty !== undefined) {
            dialog += `CNR.SGR:REST=${this.qty}|`;
        }

        return dialog;
    }
}
