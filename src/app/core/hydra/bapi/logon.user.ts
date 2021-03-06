import { DialogBase } from '@core/hydra/bapi/dialog.base';
import { DialogTypeEnum } from '@core/hydra/bapi/constants';

export class LogonUser extends DialogBase {
  constructor(private machineName: string, private badge: string) {
    super(DialogTypeEnum.LOGON_USER);
  }

  public dialogString(): string {
    return `${super.dialogString()}MNR=${this.machineName}|KNR=${this.badge}`;
  }
}
