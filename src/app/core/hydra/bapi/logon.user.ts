import { DialogBase } from '@core/hydra/bapi/dialog.base';
import { DialogTypeEnum } from '@core/hydra/bapi/constants';

export class LogonUser extends DialogBase {
    constructor() {
        super(DialogTypeEnum.LOGON_USER);
    }

    public dialogString(): string {
        return `${super.dialogString()}
                MNR=${this.machineNbr}|
                KNR=${this.badgeNbr}|
                PNR=${this.personNbr}|`;
    }
}
