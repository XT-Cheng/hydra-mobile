import { DialogBase } from '@core/hydra/bapi/dialog.base';
import { DialogTypeEnum } from '@core/hydra/bapi/constants';

export class MergeBatch extends DialogBase {
  constructor(private mergeTo: string, private toBeMerged: string, private badge: string) {
    super(DialogTypeEnum.MERGE_BATCH);
  }

  public dialogString(): string {
    return `${super.dialogString()}` +
      `CNR.CNR=${this.mergeTo}|` +
      `CNR.CNR:1=${this.toBeMerged}|` +
      `KNR=${this.badge}|`;
  }
}
