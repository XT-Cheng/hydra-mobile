import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';
import { Router, NavigationEnd } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService, DialogService, DialogConfig, PopupComponent } from 'ngx-weui';
import { filter, switchMap, map, tap } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
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
  selector: 'batch-logon',
  templateUrl: 'logon-batch.component.html',
  styleUrls: ['./logon-batch.component.scss']
})
export class LogonBatchComponent extends BaseForm {
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

  protected title = `Batch Logon`;

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

  //#region Batch Request

  requestBatchDataSuccess = (ret) => {
    this.batchInfo = ret;
    this.inputData.barCode = this.batchInfo.batchName;
  }

  requestBatchDataFailed = () => {
    this.inputData.barCode = this.inputData.batchName = '';
    this.batchInfo = new BatchInfo();
    this.batchElem.nativeElement.focus();
  }

  requestBatchData = () => {
    if (!this.inputData.barCode) {
      this.batchInfo = new BatchInfo();
      return of(this.batchInfo);
    }

    if (this.inputData.barCode === this.batchInfo.barCode) {
      return of(this.batchInfo);
    }

    return this._fetchService.getBatchInfoFrom2DBarCode(this.inputData.barCode).pipe(
      switchMap((batchInfo: BatchInfo) => {
        this.batchInfo = batchInfo;
        return this._fetchService.getBatchInformation(batchInfo.batchName);
      }),
      switchMap(batchInfo => {
        const found = this.componenstList.some(c => {
          return c.material === batchInfo.material && !c.inputBatch;
        });
        if (!found) {
          return throwError(`Batch ${this.batchInfo.batchName} not allowed!`);
        }

        return of(batchInfo);
      }));
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

  logonBatchSuccess = () => {
    this._tipService['primary'](`Batch ${this.batchInfo.batchName} Logged On!`);
    this.inputData.batchName = '';
    this.inputData.barCode = '';
    this.batchElem.nativeElement.focus();
  }

  logonBatchFailed = () => {
    this.machineElem.nativeElement.focus();
  }

  logonBatch = () => {
    // Logon Batch
    const comp = this.componenstList.find(c => c.material === this.batchInfo.material);

    return this._bapiService.logonBatch(this.machineInfo.nextOperation, this.machineInfo.machine,
      this.inputData.badge, this.batchInfo.batchName, this.batchInfo.material, comp.position).pipe(
        tap(_ => {
          this.componenstList = this.componenstList.map(c => {
            if (c.material === comp.material && c.position === comp.position) {
              return Object.assign(c, { inputBatch: this.batchInfo.batchName, inputBatchQty: this.batchInfo.qty });
            }
            return c;
          });
        })
      );
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

  getResultClass(comp) {
    return {
      'weui-icon-success': this.showSuccess(comp),
      'weui-icon-warn': this.showError(comp)
    };
  }

  showSuccess(comp): boolean {
    return !!comp.inputBatch;
  }

  showError(comp): boolean {
    return !comp.inputBatch;
  }

  compDescription(comp: ComponentInfo) {
    if (comp.inputBatch) {
      return `Batch:${comp.inputBatch},Qty:${comp.inputBatchQty}`;
    }

    return ``;
  }

  //#endregion
}
