import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { Router } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService } from 'ngx-weui';
import { switchMap, map, tap, concatMap, concat } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { BatchInfo, OperatorInfo, MachineInfo, ComponentInfo } from '@core/interface/common.interface';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { BaseForm } from '../base.form';

interface IInputData {
  machineName: string;
  barCode: string;
  toBeChangedBarCode: string;
  badge: string;
}

class InputData implements IInputData {
  machineName = '';
  barCode = '';
  badge = '';
  toBeChangedBarCode = '';
}

@Component({
  selector: 'batch-replenish',
  templateUrl: 'replenish-batch.component.html',
  styleUrls: ['./replenish-batch.component.scss']
})
export class ReplenishBatchComponent extends BaseForm {
  //#region View Children

  @ViewChild('machine') machineElem: ElementRef;
  @ViewChild('batch') batchElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;
  @ViewChild('changed') changedElem: ElementRef;

  //#endregion

  //#region Protected member

  protected batchInfo: BatchInfo = new BatchInfo();
  protected toBeChangedCompInfo: ComponentInfo = new ComponentInfo();
  protected availableCompsInfo: ComponentInfo[] = [];
  protected operatorInfo: OperatorInfo = new OperatorInfo();
  protected machineInfo: MachineInfo = new MachineInfo();
  protected componenstList: ComponentInfo[] = [];

  protected inputData: IInputData = new InputData();
  protected disableChangedBatch = false;

  protected title = `Batch Replenish`;

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
    this.batchInfo = new BatchInfo();
    this.toBeChangedCompInfo = new ComponentInfo();
    this.availableCompsInfo = [];

    if (this.inputData.machineName === this.machineInfo.machine) {
      return of(null);
    }

    return this._fetchService.getMachineWithOperation(this.inputData.machineName).pipe(
      switchMap((machineInfo) => {
        this.machineInfo = machineInfo;
        return this._fetchService.getComponentOfOperation(this.machineInfo.nextOperation, this.machineInfo.machine);
      }),
      map(componentList => {
        this.componenstList = componentList;
        return;
      })
    );
  }

  //#endregion

  //#region Batch Request

  requestBatchDataSuccess = (_) => {

  }

  requestBatchDataFailed = () => {
    this.inputData.barCode = '';
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
        return this._fetchService.getBatchInformation(batchInfo.batchName, this.inputData.barCode);
      }),
      switchMap(batchInfo => {
        this.batchInfo = batchInfo;
        this.availableCompsInfo = this.componenstList.filter(c => {
          return c.material === batchInfo.material && c.inputBatch;
        });
        if (this.availableCompsInfo.length === 0) {
          return throwError(`No Batch to be replenished!`);
        } else if (this.availableCompsInfo.length > 1) {
          this.changedElem.nativeElement.focus();
        } else {
          this.toBeChangedCompInfo = this.availableCompsInfo[0];
          this.inputData.toBeChangedBarCode = this.toBeChangedCompInfo.inputBatch;
          this.disableChangedBatch = true;
        }

        this.inputData.barCode = this.batchInfo.batchName;

        return of(null);
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

  changedEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['changed'].invalid) {
      this.changedElem.nativeElement.select();
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

  changeBatchSuccess = () => {
    this._tipService['primary'](`Batch ${this.batchInfo.batchName} Changed!`);
    this.inputData.barCode = '';
    this.inputData.toBeChangedBarCode = '';

    this.toBeChangedCompInfo = new ComponentInfo();
    this.availableCompsInfo = [];

    this.batchElem.nativeElement.focus();
  }

  changeBatchFailed = () => {
    this.machineElem.nativeElement.focus();
  }

  changeBatch = () => {
    // Log off first
    return this._bapiService.logoffBatch(this.machineInfo.currentOperation, this.machineInfo.machine,
      this.operatorInfo.badge, this.toBeChangedCompInfo.inputBatch, this.toBeChangedCompInfo.position).pipe(
        concatMap(() => {
          // Then Merge
          return this._bapiService.mergeBatch(this.batchInfo.batchName, this.toBeChangedCompInfo.inputBatch, this.operatorInfo.badge);
        }),
        concatMap(() => {
          // Then Log on
          return this._bapiService.logonBatch(this.machineInfo.currentOperation, this.machineInfo.machine,
            this.operatorInfo.badge, this.batchInfo.batchName, this.batchInfo.material, this.toBeChangedCompInfo.position);
        }),
        tap(_ => {
          const comp = this.componenstList.find(c => c.inputBatch === this.toBeChangedCompInfo.inputBatch);
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
    this.toBeChangedCompInfo = new ComponentInfo();
    this.availableCompsInfo = [];
    this.componenstList = [];
    this.disableChangedBatch = false;

    this.machineElem.nativeElement.focus();
  }

  isValid() {
    return this.batchInfo.batchName && this.machineInfo.machine
      && this.operatorInfo.badge;
  }

  //#endregion

  //#region Support methods
  getChangedStyle(comp) {
    return {
      'background-color': (comp.inputBatch === this.toBeChangedCompInfo.inputBatch) ? 'lightpink' : 'white'
    };
  }
  getResultClass(comp) {
    return {
      'weui-icon-success': !!comp.inputBatch,
      'weui-icon-warn': !comp.inputBatch
    };
  }

  //#endregion
}
