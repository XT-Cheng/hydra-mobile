import { DialogBase } from '@core/hydra/bapi/dialog.base';
import { DialogTypeEnum } from '@core/hydra/bapi/constants';

export class ChangeInputBatch extends DialogBase {
  constructor(private operation: string, private machine: string, private badge: string,
    private originalBatch: string, private newBatch: string, private position: number, private material: string) {
    super(DialogTypeEnum.CHANGE_INPUT_BATCH);
  }

  public dialogString(): string {
    return `${super.dialogString()}` +
      `ANR=${this.operation}|` +
      `CNRAB=${this.originalBatch}|` +
      `CNR=${this.newBatch}|` +
      `KNR=${this.badge}|` +
      `SLP=${this.position}|` +
      `ATK=${this.material}|` +
      `MNR=${this.machine}|`;
  }
}
