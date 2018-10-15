import { DialogBase } from '@core/hydra/bapi/dialog.base';
import { DialogTypeEnum } from '@core/hydra/bapi/constants';

export class TestBapi extends DialogBase {
  constructor(type: DialogTypeEnum, private content: string) {
    super(type);
  }

  public dialogString(): string {
    return `${super.dialogString()}${this.content}`;
  }
}
