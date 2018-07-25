import { DialogBase } from '@core/hydra/bapi/dialog.base';
import { DialogTypeEnum } from '@core/hydra/bapi/constants';

export class UpdateBatch extends DialogBase {
    constructor(private id: string, private qty: number, private badge: string) {
        super(DialogTypeEnum.UPDATE_BATCH);
    }

    public dialogString(): string {
        return `${super.dialogString()}` +
                `CNR.CNR=${this.id}|` +
                `CNR.SGR:GUT=${this.qty}|` +
                `CNR.SGR:REST=${this.qty}|` +
                `CNR.OPT:MBEW=J|` +
                `KNR=${this.badge}|`;
    }
}
