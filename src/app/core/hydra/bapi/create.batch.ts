import { DialogBase } from '@core/hydra/bapi/dialog.base';
import { DialogTypeEnum } from '@core/hydra/bapi/constants';

export class CreateBatch extends DialogBase {
    constructor(private batchNumber: string, private materialNumber: string,
                    private batchQty: number, private materialBuffer: string,
                    private badge: string) {
        super(DialogTypeEnum.CREATE_BATCH);
    }

    public dialogString(): string {
        return `${super.dialogString()}` +
                `CNR:ALT1=${this.batchNumber}|` +
                `ATK=${this.materialNumber}|` +
                `EGR:GUT=${this.batchQty}|` +
                `EGE:GUT=PC|` +
                `KNR=${this.badge}|` +
                `STA=F|` +
                `KLASSE=G|` +
                `ZLO=${this.materialBuffer}|`;
    }
}
