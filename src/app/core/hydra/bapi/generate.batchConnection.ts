import { DialogBase } from '@core/hydra/bapi/dialog.base';
import { DialogTypeEnum } from '@core/hydra/bapi/constants';

export class GenerateBatchConnection extends DialogBase {
    constructor(private inputBatchId: string, private outputBatchId: string,
                private inputBatchMaterial: string, private outputBatchMaterial: string,
                private inputBatchMatType: string, private outputBatchMatType: string
                ) {
        super(DialogTypeEnum.GENERATE_BATCH_CONNECTION);
    }

    public dialogString(): string {
        const date = new Date();
        const seconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
        const dateString = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

        return `${super.dialogString()}` +
                `CNRBAUM.CNR:E=${this.inputBatchId}|` +
                `CNRBAUM.CNR:A=${this.outputBatchId}|` +
                `CNRBAUM.ATK:E=${this.inputBatchMaterial}|` +
                `CNRBAUM.ATK:A=${this.outputBatchMaterial}|` +
                `CNRBAUM.HSDAT=${dateString}|` +
                `CNRBAUM.HSZEI=${seconds}|` +
                `CNRBAUM.HSANDAT=${dateString}|` +
                `CNRBAUM.HSANZEI=${seconds}|` +
                `CNRBAUM.EANDAT=${dateString}|` +
                `CNRBAUM.EANZEI=${seconds}|` +
                `CNRBAUM.EABDAT=${dateString}|` +
                `CNRBAUM.EABZEI=${seconds}|` +
                `CNRBAUM.HZTYP:E=${this.inputBatchMatType}|` +
                `CNRBAUM.HZTYP:A=${this.outputBatchMatType}|`;
            }
}
