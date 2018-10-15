import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { Router } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService } from 'ngx-weui';
import { switchMap, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { OperatorInfo, MachineInfo, ComponentInfo, MachineStatus } from '@core/interface/common.interface';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { BaseForm } from '../base.form';

interface InputData {
  machineName: string;
  status: string;
  badge: string;
}

class InputData implements InputData {
  machineName = '';
  status = '';
  batchName = '';
}

@Component({
  selector: 'machine-change-status',
  templateUrl: 'change-machine-status.component.html',
  styleUrls: ['./change-machine-status.component.scss']
})
export class ChangeMachineStatusComponent extends BaseForm {
  //#region View Children

  @ViewChild('machine') machineElem: ElementRef;
  @ViewChild('status') statusElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;

  //#endregion

  //#region Protected member

  protected operatorInfo: OperatorInfo = new OperatorInfo();
  protected machineInfo: MachineInfo = new MachineInfo();
  protected statusInfo: MachineStatus = new MachineStatus();

  protected inputData: InputData = new InputData();

  protected title = `Change Status`;

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

    return this._fetchService.getMachineInformation(this.inputData.machineName).pipe(
      tap(machineInfo => {
        this.machineInfo = machineInfo;
      })
    );
  }

  //#region Machine Status Reqeust

  requestMachineStatusDataSuccess = (_) => {
  }

  requestMachineStatusDataFailed = () => {
    this.machineElem.nativeElement.select();
    this.resetForm();
  }

  requestMachineStatusData = () => {
    const status = parseInt(this.inputData.status, 10);

    if (isNaN(status)) {
      return of(null);
    }

    if (status === this.statusInfo.status) {
      return of(null);
    }

    return this._fetchService.getMachineStatus(status).pipe(
      tap(statusInfo => {
        this.statusInfo = statusInfo;
      })
    );
  }

  //#endregion

  //#region Operator Reqeust

  requestOperatorDataSuccess = (operatorInfo) => {
    this.operatorInfo = operatorInfo;
  }

  requestOperatorDataFailed = () => {
    this.operatorInfo = new OperatorInfo();
    this.operatorElem.nativeElement.select();
  }

  requestOperatorData = () => {
    if (!this.inputData.badge) {
      this.operatorInfo = new OperatorInfo();
      return of(this.operatorInfo);
    }

    if (this.inputData.badge === this.operatorInfo.badge) {
      return of(this.operatorInfo);
    }

    return this._fetchService.getOperatorByBadge(this.inputData.badge);
  }

  //#endregion

  //#region Event Handler

  machineEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['machine'].invalid) {
      this.machineElem.nativeElement.select();
      return;
    }

    this.statusElem.nativeElement.focus();
  }

  statusEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['status'].invalid) {
      this.statusElem.nativeElement.select();
      return;
    }

    this.operatorElem.nativeElement.focus();
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

  changeStatusSuccess = () => {
    this._tipService['primary'](`Machine ${this.machineInfo.machine} Status change to ${this.statusInfo.description}!`);

    this.machineElem.nativeElement.focus();
  }

  changeStatusFailed = () => {
    this.machineElem.nativeElement.focus();
  }

  changeStatus = () => {
    return this._bapiService.changeMachineStatus(this.machineInfo.machine, this.statusInfo.status,
      this.inputData.badge);
  }

  //#endregion

  //#region Override methods

  resetForm() {
    this.form.reset();
    this.machineInfo = new MachineInfo();
    this.operatorInfo = new OperatorInfo();
    this.statusInfo = new MachineStatus();

    this.inputData = new InputData();

    this.machineElem.nativeElement.focus();
  }

  isValid() {
    return this.machineInfo.machine
      && this.operatorInfo.badge && this.statusInfo.description;
  }

  //#endregion

  //#region Support methods

  //#endregion
}
