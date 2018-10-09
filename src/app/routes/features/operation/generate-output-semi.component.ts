import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { TitleService } from '@core/title.service';
import { Router, NavigationEnd } from '@angular/router';
import { ToptipsService, ToastService } from 'ngx-weui';
import { filter, switchMap, catchError, tap } from 'rxjs/operators';
import { FetchService } from '@core/hydra/fetch.service';
import { BaseForm } from '../base.form';
import { OperatorInfo, MachineInfo, OperationInfo, MaterialMaster, BatchInfo } from '@core/interface/common.interface';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { throwError, of } from 'rxjs';

interface InputData {
  machineName: string;
  outputBatchName: string;
  outputBatchQty: number;
  badge: string;
}

class InputData implements InputData {
  machineName = '';
  badge = '';
  outputBatchName = '';
  outputBatchQty = 0;
}

@Component({
  selector: 'batch-semi-generate',
  templateUrl: 'generate-output-semi.component.html',
  styleUrls: ['./generate-output-semi.component.scss']
})
export class GenerateOutputSemiBatchComponent extends BaseForm {
  //#region View Children

  @ViewChild('machine') machineElem: ElementRef;
  @ViewChild('batch') batchNameElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;
  @ViewChild('batchQty') batchQtyElem: ElementRef;

  //#endregion

  //#region Protected member

  protected operatorInfo: OperatorInfo = new OperatorInfo();
  protected machineInfo: MachineInfo = new MachineInfo();
  protected operationInfo: OperationInfo = new OperationInfo();
  protected materialInfo: MaterialMaster = new MaterialMaster();

  protected inputData: InputData = new InputData();

  protected title = `Output Batch Gen.`;

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

  requestMachineDataSuccess = (materialInfo) => {
    this.materialInfo = materialInfo;

    this.inputData.outputBatchQty = this.materialInfo.cartonQty;
  }

  requestMachineDataFailed = () => {
    this.machineElem.nativeElement.select();
    this.resetForm();
  }

  requestMachineData = () => {
    if (this.inputData.machineName === this.machineInfo.machine) {
      return of(this.machineInfo);
    }

    return this._fetchService.getMachineWithOperation(this.inputData.machineName).pipe(
      switchMap((machineInfo) => {
        if (!machineInfo.currentOperation) {
          return throwError(`Machine ${this.inputData.machineName} has no OP loggedon`);
        }
        this.machineInfo = machineInfo;
        return this._fetchService.getActiveOutputBatch(this.machineInfo.currentOperation, this.machineInfo.machine);
      }),
      switchMap(activeBatch => {
        this.machineInfo.currentOutputBatch = activeBatch;
        return this._fetchService.getOperation(this.machineInfo.currentOperation);
      }),
      switchMap(operationInfo => {
        this.operationInfo = operationInfo;
        return this._fetchService.getMaterialMaster(operationInfo.material);
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

  //#region Batch Reqeust

  requestBatchDataSuccess = (_) => {
    this.operatorElem.nativeElement.focus();
  }

  requestBatchDataFailed = () => {
    this.batchNameElem.nativeElement.select();
  }

  requestBatchData = () => {
    return this._fetchService.getBatchInformation(this.inputData.outputBatchName).pipe(
      switchMap((batchInfo: BatchInfo) => {
        if (!!batchInfo) {
          return throwError(`Batch ${this.inputData.outputBatchName} exist！`);
        }
        return of(null);
      }),
      catchError(err => {
        if (err.includes('not exist')) {
          return of(null);
        }
        return throwError(err);
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

  batchEntered() {
    this.stopEvent(event);

    if (this.form.controls['batch'].invalid) {
      this.operatorElem.nativeElement.select();
      return;
    }

    this.batchQtyElem.nativeElement.focus();
  }

  quantityEntered() {
    this.stopEvent(event);

    if (this.form.controls['qty'].invalid) {
      this.batchQtyElem.nativeElement.select();
      return;
    }

    this.operatorElem.nativeElement.focus();
  }

  //#endregion

  //#region Exeuction

  generateOutputBatchSuccess = () => {
    this._tipService['primary'](`Batch ${this.machineInfo.nextOperation} Generated!`);

    this.machineElem.nativeElement.focus();
  }

  generateOutputBatchFailed = () => {
    this.machineElem.nativeElement.focus();
  }

  generateOutputBatch = () => {
    return this._bapiService.generateOutputSemiBatch(this.machineInfo.currentOperation, this.machineInfo.machine,
               this.inputData.badge, this.inputData.outputBatchQty);
  }

  //#endregion

  //#region Override methods

  resetForm() {
    this.form.reset();
    this.machineInfo = new MachineInfo();
    this.operatorInfo = new OperatorInfo();

    this.machineElem.nativeElement.focus();
  }

  isValid() {
    return true;
    // return this.machineInfo.machine
    //   && this.operatorInfo.badge && !this.componenstList.some(c => !c.inputBatch);
  }

  //#endregion
}
