import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { Router } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService } from 'ngx-weui';
import { map } from 'rxjs/operators';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { MachineInfo, ReasonInfo, OperatorInfo } from '@core/interface/common.interface';
import { of } from 'rxjs';
import { BaseForm } from '../base.form';

interface IInputData {
  machineName: string;
  scrap: number;
  scrapReason: string;
  badge: string;
}

class InputData implements IInputData {
  machineName = '';
  scrapReason = '';
  scrap: 0;
  badge = '';
}

@Component({
  selector: 'operation-scrap',
  templateUrl: 'scrap-operation.component.html',
  styleUrls: ['./scrap-operation.component.scss']
})
export class ScrapOperationComponent extends BaseForm {

  //#region View Children

  @ViewChild('machine') machineElem: ElementRef;
  @ViewChild('scrap') scrapElem: ElementRef;
  @ViewChild('scrapReason') scrapReasonElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;

  //#endregion

  //#region Protected member

  protected machineInfo: MachineInfo = new MachineInfo();
  protected reasonInfo: ReasonInfo = new ReasonInfo();
  protected operatorInfo: OperatorInfo = new OperatorInfo();

  protected inputData: IInputData = new InputData();

  protected title = `Partial Confirmation`;

  //#endregion

  //#region Constructor

  constructor(
    private _fetchService: NewFetchService,
    private _bapiService: BapiService,
    _routeService: Router,
    _titleService: TitleService,
    _toastService: ToastService,
    _tipService: ToptipsService
  ) {
    super(_toastService, _routeService, _tipService, _titleService);
  }

  //#endregion

  //#region Data Request

  //#region Machine Reqeust

  requestMachineDataSuccess = (_) => {
  }

  requestMachineDataFailed = () => {
    this.machineElem.nativeElement.select();
    this.resetForm();
  }

  requestMachineData = () => {
    if (this.inputData.machineName === this.machineInfo.machine) {
      return of(null);
    }

    return this._fetchService.getMachineWithOperation(this.inputData.machineName).pipe(
      map(machineInfo => {
        this.machineInfo = machineInfo;
      })
    );
  }

  //#endregion

  //#region Operator Reqeust

  requestOperatorDataSuccess = () => {
  }

  requestOperatorDataFailed = () => {
    this.operatorInfo = new OperatorInfo();
    this.operatorElem.nativeElement.select();
  }

  requestOperatorData = () => {
    if (!this.inputData.badge) {
      return of(null);
    }

    if (this.inputData.badge === this.operatorInfo.badge) {
      return of(null);
    }

    return this._fetchService.getOperatorByBadge(this.inputData.badge).pipe(
      map(operatorInfo => {
        this.operatorInfo = operatorInfo;
      })
    );
  }

  //#endregion

  //#region Scrap Reason Reqeust

  requestScrapReasonDataSuccess = () => {
  }

  requestScrapReasonDataFailed = () => {
    this.reasonInfo = new ReasonInfo();
    this.scrapReasonElem.nativeElement.select();
  }

  requestScrapReasonData = () => {
    if (!this.inputData.scrapReason) {
      return of(null);
    }

    if (this.inputData.scrapReason === this.reasonInfo.code) {
      return of(null);
    }

    this._fetchService.getReasonCode(this.inputData.scrapReason).pipe(
      map(reasonInfo => this.reasonInfo = reasonInfo));
  }

  //#endregion

  //#endregion

  //#region Event Handler

  machineEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['machine'].invalid) {
      this.machineElem.nativeElement.select();
      return;
    }

    this.scrapElem.nativeElement.focus();
  }

  scrapEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['scrap'].invalid) {
      this.scrapElem.nativeElement.select();
      return;
    }

    this.scrapReasonElem.nativeElement.select();
  }

  scrapReasonEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['scrapReason'].invalid) {
      this.scrapReasonElem.nativeElement.select();
      return;
    }

    this.operatorElem.nativeElement.select();
  }

  operatorEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['operator'].invalid) {
      this.operatorElem.nativeElement.select();
      return;
    }

    this.operatorElem.nativeElement.blur();
  }

  //#endregion

  //#region Exeuction

  scrapOperationSuccess = () => {
    this._tipService['primary'](`Operation ${this.machineInfo.nextOperation} log scrap successfully!`);

    this.machineElem.nativeElement.focus();
  }

  scrapOperationFailed = () => {
    this.machineElem.nativeElement.focus();
  }

  scrapOperation = () => {
    this.executionContext = {
      operation: this.machineInfo.currentOperation,
      machine: this.machineInfo.machine,
      scrap: this.inputData.scrap,
      scrapReason: this.inputData.scrapReason,
      operator: this.operatorInfo.badge
    };

    return this._bapiService.partialConfirmOperation(this.machineInfo.currentOperation, this.machineInfo.machine,
      0, this.inputData.scrap, this.inputData.scrapReason, this.inputData.badge);
  }

  //#endregion

  //#region Override methods

  resetForm() {
    this.machineInfo = new MachineInfo();
    this.operatorInfo = new OperatorInfo();
    this.reasonInfo = new ReasonInfo();

    this.inputData = new InputData();

    this.machineElem.nativeElement.focus();
  }

  isValid() {
    return this.machineInfo.machine && this.machineInfo.currentOperation
      && this.operatorInfo.badge && this.reasonInfo.code && this.inputData.scrap > 0;
  }

  //#endregion
}
