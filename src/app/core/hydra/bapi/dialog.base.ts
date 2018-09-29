import { DialogTypeEnum, DIALOG_USER } from '@core/hydra/bapi/constants';

export abstract class DialogBase {
  protected _dialogDate: Date;
  protected _date: Date;

  public machineNbr: string;
  public personNbr: string;
  public badgeNbr: string;

  constructor(protected _type: DialogTypeEnum) {
    this._dialogDate = this._date = new Date();
  }

  public dialogString(): string {
    return `DLG=${this._type}|` +
      `DAT=${this.leftPad(this._dialogDate.getMonth() + 1, 2)}/${this.leftPad(this._date.getDate(), 2)}/${this._date.getFullYear()}|` +
      `ZEI=${this.seconds}|` +
      `USR=${DIALOG_USER}|` +
      // tslint:disable-next-line:max-line-length
      `DLGDAT=${this.leftPad(this._dialogDate.getMonth() + 1, 2)}/${this.leftPad(this._dialogDate.getDate(), 2)}/${this._dialogDate.getFullYear()}|` +
      `DLGZEI=${this.dialogSeconds}|`;
  }

  private get seconds(): number {
    return this._date.getHours() * 3600 + this._date.getMinutes() * 60 + this._date.getSeconds();
  }

  private get dialogSeconds(): number {
    return this._dialogDate.getHours() * 3600 + this._dialogDate.getMinutes() * 60 + this._dialogDate.getSeconds();
  }

  private leftPad(str: any, len: number, ch: any = '0') {
    str = String(str);

    let i = -1;

    if (!ch && ch !== 0) {
      ch = ' ';
    }

    len = len - str.length;

    while (++i < len) {
      str = ch + str;
    }

    return str;
  }
}
