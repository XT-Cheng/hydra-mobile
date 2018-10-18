import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { Router } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService } from 'ngx-weui';
import { switchMap, map, tap } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { BatchInfo, OperatorInfo, MachineInfo, ComponentInfo } from '@core/interface/common.interface';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { BaseForm } from '../base.form';

interface InputData {
  machineName: string;
  barCode: string;
  batchName: string;
  badge: string;
}

class InputData implements InputData {
  machineName = '';
  barCode = '';
  badge = '';
  batchName = '';
}

@Component({
  selector: 'batch-logoff',
  templateUrl: 'logoff-batch.component.html',
  styleUrls: ['./logoff-batch.component.scss']
})
export class LogoffBatchComponent extends BaseForm {
  //#region View Children

  @ViewChild('machine') machineElem: ElementRef;
  @ViewChild('batch') batchElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;

  //#endregion

  //#region Protected member

  protected batchInfo: BatchInfo = new BatchInfo();
  protected operatorInfo: OperatorInfo = new OperatorInfo();
  protected machineInfo: MachineInfo = new MachineInfo();
  protected componenstList: ComponentInfo[] = [];

  protected inputData: InputData = new InputData();

  protected title = `Batch Logoff`;

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
    super(_toastService, _routeService, _tipService, _titleService, false);
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
    if (!this.inputData.machineName) {
      this.machineInfo = new MachineInfo();
      return of(null);
    }

    if (this.inputData.machineName === this.machineInfo.machine) {
      return of(null);
    }

    return this._fetchService.getMachineWithOperation(this.inputData.machineName).pipe(
      switchMap((machineInfo) => {
        if (machineInfo.currentOperation) {
          return throwError(`Machine ${this.inputData.machineName} has OP ${machineInfo.currentOperation} running!`);
        }
        this.machineInfo = machineInfo;
        return this._fetchService.getLoggedOnBatchOfMachine(this.machineInfo.machine);
      }),
      map(componentList => {
        this.componenstList = componentList;
      })
    );
  }

  //#endregion

  //#region Batch Request

  requestBatchDataSuccess = () => {
    this.inputData.barCode = this.batchInfo.batchName;
  }

  requestBatchDataFailed = () => {
    this.inputData.barCode = this.inputData.batchName = '';
    this.batchInfo = new BatchInfo();
    this.batchElem.nativeElement.focus();
  }

  requestBatchData = () => {
    if (!this.inputData.barCode) {
      return of(null);
    }

    if (this.inputData.barCode === this.batchInfo.barCode) {
      return of(null);
    }

    return this._fetchService.getBatchInfoFrom2DBarCode(this.inputData.barCode).pipe(
      switchMap((batchInfo: BatchInfo) => {
        this.batchInfo = batchInfo;
        return this._fetchService.getBatchInformation(batchInfo.batchName);
      }),
      map(batchInfo => {
        this.batchInfo = Object.assign(this.batchInfo, batchInfo, {
          barCode: this.batchInfo.barCode
        });
        const found = this.componenstList.some(c => {
          return c.material === batchInfo.material && c.inputBatch === batchInfo.batchName;
        });
        if (!found) {
          throw Error(`Batch ${this.batchInfo.batchName} not logged on yet!`);
        }
      }));
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

  //#endregion

  //#region Event Handler

  machineEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['machine'].invalid) {
      this.machineElem.nativeElement.select();
      return;
    }

    this.batchElem.nativeElement.focus();
  }

  batchEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['batch'].invalid) {
      this.batchElem.nativeElement.select();
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

  logoffBatchSuccess = () => {
    this._tipService['primary'](`Batch ${this.batchInfo.batchName} Logged Off!`);

    const comp = this.componenstList.find(c => c.material === this.batchInfo.material && c.inputBatch === this.batchInfo.batchName);
    this.componenstList = this.componenstList.filter(c => {
      return !(c.inputBatch === comp.inputBatch);
    });

    this.inputData.batchName = '';
    this.inputData.barCode = '';
    this.batchElem.nativeElement.focus();
  }

  logoffBatchFailed = () => {
    this.machineElem.nativeElement.focus();
  }

  logoffBatch = () => {
    // Logoff Batch
    const comp = this.componenstList.find(c => c.material === this.batchInfo.material && c.inputBatch === this.batchInfo.batchName);

    this.executionContext = {
      operation: this.machineInfo.nextOperation,
      machine: this.machineInfo.machine,
      batch: this.batchInfo.batchName,
      position: comp.position,
      operator: this.operatorInfo.badge
    };

    return this._bapiService.logoffBatch(comp.operatoin, this.machineInfo.machine, this.operatorInfo.badge,
      this.batchInfo.batchName, comp.position);
  }

  //#endregion

  //#region Override methods

  resetForm() {
    this.form.reset();
    this.machineInfo = new MachineInfo();
    this.operatorInfo = new OperatorInfo();
    this.batchInfo = new BatchInfo();

    this.componenstList = [];

    this.machineElem.nativeElement.focus();
  }

  isValid() {
    return this.batchInfo.batchName && this.machineInfo.machine
      && this.operatorInfo.badge;
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
