import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { Router, NavigationEnd } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService, DialogService, DialogConfig, PopupComponent } from 'ngx-weui';
import { filter, tap, catchError } from 'rxjs/operators';
import { NgForm, Validators } from '@angular/forms';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { MachineInfo, InputData, ReasonInfo, OperatorInfo } from '@core/interface/common.interface';
import { stopEvent } from '../utils';
import { throwError } from 'rxjs';

@Component({
  selector: 'operation-logoff',
  templateUrl: 'logoff-operation.component.html',
  styleUrls: ['./logoff-operation.component.scss']
})
export class LogoffOperationComponent {
  @ViewChild('f') form: NgForm;
  @ViewChild('machine') machineElem: ElementRef;
  @ViewChild('yield') yieldElem: ElementRef;
  @ViewChild('scrap') scrapElem: ElementRef;
  @ViewChild('scrapReason') scrapReasonElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;
  @ViewChild('execute', { read: ElementRef }) buttonElem: ElementRef;

  machineInfo: MachineInfo = new MachineInfo();
  reasonInfo: ReasonInfo = new ReasonInfo();
  operatorInfo: OperatorInfo = new OperatorInfo();

  inputData: InputData = new InputData();

  isInputing = false;

  constructor(private _bapiService: BapiService, private _fetchService: NewFetchService,
    private _routeService: Router, private _titleService: TitleService,
    private _tipService: ToptipsService, private _toastService: ToastService) {
    this._routeService.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this._titleService.setTitle(`LogOff OP`);
    });
  }

  Inputing = () => {
    this.isInputing = true;
  }

  //#region Data Request
  requestMachineData = () => {
    this.isInputing = false;

    if (!this.inputData.machine) {
      this.machineInfo = new MachineInfo();
      return;
    }

    if (this.inputData.machine !== this.machineInfo.machine) {
      this.isInputing = true;
      this._toastService['loading']();

      this._fetchService.getMachineWithOperation(this.inputData.machine).subscribe((machineInfo: MachineInfo) => {
        this._toastService.hide();
        this.machineInfo = machineInfo;
        this.isInputing = false;
      }, (error) => {
        this._tipService.warn(error);

        this._toastService.hide();
        this.isInputing = false;
        this.resetForm();
      });
    }
  }

  requestOperatorData = () => {
    this.isInputing = false;

    if (!this.inputData.badge) {
      this.operatorInfo = new OperatorInfo();
      return;
    }

    if (this.inputData.badge !== this.operatorInfo.badge) {
      this.isInputing = true;
      this._toastService['loading']();

      this._fetchService.getOperatorByBadge(this.inputData.badge).subscribe((operatorInfo: OperatorInfo) => {
        this._toastService.hide();
        this.operatorInfo = operatorInfo;
        this.isInputing = false;
      }, (error) => {
        this._tipService.warn(error);
        this._toastService.hide();
        this.operatorInfo = new OperatorInfo();
        this.isInputing = false;
        this.operatorElem.nativeElement.select();
      });
    }
  }

  requestScrapReasonData = () => {
    this.isInputing = false;

    if (!this.inputData.scrapReason) {
      this.reasonInfo = new ReasonInfo();
      return;
    }

    if (this.inputData.scrapReason !== this.reasonInfo.code) {
      this.isInputing = true;
      this._toastService['loading']();

      this._fetchService.getReasonCode(this.inputData.scrapReason).subscribe((reasonInfo: ReasonInfo) => {
        this._toastService.hide();
        this.reasonInfo = reasonInfo;
        this.isInputing = false;
      }, (error) => {
        this._tipService.warn(error);
        this._toastService.hide();
        this.reasonInfo = new ReasonInfo();
        this.scrapReasonElem.nativeElement.select();
        this.isInputing = false;
      });
    }
  }

  //#endregion

  //#region Event Handler
  MachineEntered(event) {
    stopEvent(event);

    if (this.form.controls['machine'].invalid) {
      this.machineElem.nativeElement.select();
      return;
    }

    this.yieldElem.nativeElement.select();
  }

  YieldEntered(event) {
    stopEvent(event);

    if (this.form.controls['yield'].invalid) {
      this.yieldElem.nativeElement.select();
      return;
    }

    this.scrapElem.nativeElement.select();
  }

  ScrapEntered(event) {
    stopEvent(event);

    if (this.form.controls['scrap'].invalid) {
      this.scrapElem.nativeElement.select();
      return;
    }

    if (this.inputData.scrap > 0) {
      this.scrapReasonElem.nativeElement.select();
    } else {
      this.inputData.scrapReason = '';
      this.reasonInfo = new ReasonInfo();
      this.operatorElem.nativeElement.select();
    }
  }

  ScrapReasonEntered(event) {
    stopEvent(event);

    if (this.form.controls['scrapReason'].invalid) {
      this.scrapReasonElem.nativeElement.select();
      return;
    }

    this.operatorElem.nativeElement.select();
  }

  OperatorEntered(event) {
    stopEvent(event);

    if (this.form.controls['operator'].invalid) {
      this.operatorElem.nativeElement.select();
      return;
    }

    this.operatorElem.nativeElement.blur();
  }

  //#endregion

  //#region Exeuction

  logoffOperation() {
    if (this.isInputing) {
      return;
    }

    this._toastService['loading']();
    this._bapiService.logoffOperation(this.machineInfo.currentOperation, this.machineInfo.machine,
      this.inputData.badge).pipe(
        tap((ret) => {
          if (!ret.isSuccess) {
            throwError(ret.description);
          }
        })
      )
      .subscribe(_ => {
        this._tipService['primary'](`Order ${this.machineInfo.currentOperation} Logged Off!`);
        this._toastService.hide();
        this.resetForm();
      }, error => {
        this._tipService.warn(error);
        this._toastService.hide();
        this.resetForm();
      });
  }

  //#endregion

  //#region Private methods
  private resetForm() {
    this.machineInfo = new MachineInfo();
    this.operatorInfo = new OperatorInfo();
    this.reasonInfo = new ReasonInfo();

    this.inputData = new InputData();

    this.machineElem.nativeElement.focus();
  }

  private isDisable() {
    return this.isInputing || !this.machineInfo.currentOperation ||
      !this.operatorInfo.badge ||
      (this.inputData.scrap > 0 && !this.reasonInfo.code) ||
      !this.form.valid;
  }

  //#endregion
}
