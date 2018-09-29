import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService } from 'ngx-weui';
import { MaterialBufferInfo, BatchInfo, OperatorInfo } from '@core/interface/common.interface';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { of, throwError } from 'rxjs';
import { BaseForm } from '../base.form';

interface InputData {
  barCode: string;
  batchName: string;
  material: string;
  materialBuffer: string;
  qty: number;
  badge: string;
}

class InputData implements InputData {
  barCode = '';
  badge = '';
  batchName = '';
  materialBuffer = '';
  material = '';
  qty = 0;
}

@Component({
  selector: 'batch-create',
  templateUrl: 'create-batch.component.html',
  styleUrls: ['./create-batch.component.scss']
})
export class CreateBatchComponent extends BaseForm {
  //#region View Children

  @ViewChild('batch') batchElem: ElementRef;
  @ViewChild('materialBuffer') materialBufferElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;

  //#endregion

  //#region Protected member

  protected bufferInfo: MaterialBufferInfo = new MaterialBufferInfo();
  protected batchInfo: BatchInfo = new BatchInfo();
  protected operatorInfo: OperatorInfo = new OperatorInfo();

  protected inputData: InputData = new InputData();

  protected title = `Batch Create`;

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

  //#region Batch Reqeust

  requestBatchDataSuccess = (_) => {
    this.inputData.barCode = this.batchInfo.batchName;
  }

  requestBatchDataFailed = () => {
    this.batchElem.nativeElement.select();
    this.resetForm();
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
      switchMap((batchInfo: BatchInfo) => {
        if (!!batchInfo) {
          return throwError(`Batch ${this.batchInfo.batchName} exist！`);
        }
        return of(null);
      }
      ),
      catchError(err => {
        if (err.includes('not exist')) {
          return of(null);
        }
        return throwError(err);
      }));
  }

  //#endregion

  //#region Buffer Reqeust
  requestMaterialBufferDataSuccess = (bufferInfo) => {
    this.bufferInfo = bufferInfo;
  }

  requestMaterialBufferDataFailed = () => {
    this.bufferInfo = new MaterialBufferInfo();
    this.materialBufferElem.nativeElement.select();
  }

  requestMaterialBufferData = () => {
    if (!this.inputData.materialBuffer) {
      this.bufferInfo = new MaterialBufferInfo();
      return of(this.bufferInfo);
    }

    if (this.inputData.materialBuffer === this.bufferInfo.name) {
      return of(this.bufferInfo);
    }

    return this._fetchService.getMaterialBuffer(this.inputData.materialBuffer);
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

  BatchEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['batch'].invalid) {
      this.batchElem.nativeElement.select();
      return;
    }

    this.materialBufferElem.nativeElement.focus();
  }

  MaterialBufferEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['materialBuffer'].invalid) {
      this.materialBufferElem.nativeElement.select();
      return;
    }

    this.operatorElem.nativeElement.focus();
  }

  OperatorEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['operator'].invalid) {
      this.operatorElem.nativeElement.select();
      return;
    }

    this.operatorElem.nativeElement.blur();
  }

  //#endregion

  //#region Exeuction
  createBatchSuccess = () => {
    this._tipService['primary'](`Batch ${this.batchInfo.batchName} Created!`);
  }

  createBatchFailed = () => {
    this.batchElem.nativeElement.focus();
  }

  createBatch = () => {
    return this._bapiService
      .createBatch(
        this.batchInfo.batchName,
        this.batchInfo.material,
        this.batchInfo.qty,
        this.bufferInfo.name,
        this.operatorInfo.badge
      );
  }

  //#endregion

  //#region Override methods

  resetForm() {
    this.bufferInfo = new MaterialBufferInfo();
    this.batchInfo = new BatchInfo();
    this.operatorInfo = new OperatorInfo();

    this.inputData = new InputData();

    this.batchElem.nativeElement.focus();
  }

  isValid() {
    return this.bufferInfo.name && this.batchInfo.batchName && this.operatorInfo.badge;
  }

  //#endregion
}
