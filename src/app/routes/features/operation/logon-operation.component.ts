import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { Router } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService } from 'ngx-weui';
import { switchMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { OperatorInfo, MachineInfo, ComponentInfo } from '@core/interface/common.interface';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { BaseForm } from '../base.form';

interface InputData {
  machineName: string;
  badge: string;
}

class InputData implements InputData {
  machineName = '';
  batchName = '';
}

@Component({
  selector: 'operation-logon',
  templateUrl: 'logon-operation.component.html',
  styleUrls: ['./logon-operation.component.scss']
})
export class LogonOperationComponent extends BaseForm {
  //#region View Children

  @ViewChild('machine') machineElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;

  //#endregion

  //#region Protected member

  protected operatorInfo: OperatorInfo = new OperatorInfo();
  protected machineInfo: MachineInfo = new MachineInfo();
  protected componenstList: ComponentInfo[] = [];

  protected inputData: InputData = new InputData();

  protected title = `Operation Logon`;

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

  requestMachineDataSuccess = (ret) => {
    this.machineInfo = ret.machine;
    this.componenstList = ret.components;
  }

  requestMachineDataFailed = () => {
    this.machineElem.nativeElement.select();
    this.resetForm();
  }

  requestMachineData = () => {
    if (this.inputData.machineName === this.machineInfo.machine) {
      return of({ machine: this.machineInfo, components: this.componenstList });
    }

    return this._fetchService.getMachineWithOperation(this.inputData.machineName).pipe(
      switchMap((machineInfo) => {
        this.machineInfo = machineInfo;
        return this._fetchService.getComponentOfOperation(this.machineInfo.nextOperation, this.machineInfo.machine);
      }),
      map(componentList => {
        return { machine: this.machineInfo, components: componentList };
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

  logonOperationSuccess = () => {
    this._tipService['primary'](`Operation ${this.machineInfo.nextOperation} Logged On!`);

    this.machineElem.nativeElement.focus();
  }

  logonOperationFailed = () => {
    this.machineElem.nativeElement.focus();
  }

  logonOperation = () => {
    return this._bapiService.logonOperation(this.machineInfo.nextOperation, this.machineInfo.machine,
      this.inputData.badge);
  }

  //#endregion

  //#region Override methods

  resetForm() {
    this.form.reset();
    this.machineInfo = new MachineInfo();
    this.operatorInfo = new OperatorInfo();

    this.componenstList = [];

    this.machineElem.nativeElement.focus();
  }

  isValid() {
    return this.machineInfo.machine
      && this.operatorInfo.badge && !this.componenstList.some(c => !c.inputBatch);
  }

  //#endregion

  //#region Support methods

  getResultClass(comp) {
    return {
      'weui-icon-success': !!comp.inputBatch,
      'weui-icon-warn': !comp.inputBatch
    };
  }

  //#endregion
}
