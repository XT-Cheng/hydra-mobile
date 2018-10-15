import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { Router } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService } from 'ngx-weui';
import { switchMap, map } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { OperatorInfo, MachineInfo, ComponentInfo, ToolInfo } from '@core/interface/common.interface';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { BaseForm } from '../base.form';

interface InputData {
  machineName: string;
  badge: string;
}

class InputData implements InputData {
  machineName = '';
  badge = '';
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
  protected componentList: ComponentInfo[] = [];
  protected toolList: ToolInfo[] = [];

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
      switchMap((machineInfo) => {
        if (machineInfo.currentOperation) {
          return throwError(`Machine ${machineInfo.machine} has OP logged on!`);
        }
        this.machineInfo = machineInfo;
        return this._fetchService.getComponentOfOperation(this.machineInfo.nextOperation, this.machineInfo.machine);
      }),
      switchMap(componentList => {
        this.componentList = componentList;
        return this._fetchService.getToolOfOperation(this.machineInfo.nextOperation, this.machineInfo.machine);
      }),
      map(toolList => {
        this.toolList = toolList;
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

    this.componentList = [];
    this.toolList = [];

    this.machineElem.nativeElement.focus();
  }

  isValid() {
    return this.machineInfo.machine
      && this.operatorInfo.badge && !this.componentList.some(c => !c.inputBatch) && !this.toolList.some(c => !c.inputTool);
  }

  //#endregion

  //#region Support methods

  getResultClassOfComp(comp) {
    return {
      'weui-icon-success': !!comp.inputBatch,
      'weui-icon-warn': !comp.inputBatch
    };
  }

  getResultClassOfTool(tool) {
    return {
      'weui-icon-success': !!tool.inputTool,
      'weui-icon-warn': !tool.inputTool
    };
  }
  //#endregion
}
