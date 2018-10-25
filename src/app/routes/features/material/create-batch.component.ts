import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { switchMap, catchError, map } from 'rxjs/operators';
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
  numberOfSplits: string;
  splittedQty: string;
}

class InputData implements InputData {
  barCode = '';
  badge = '';
  batchName = '';
  materialBuffer = '';
  material = '';
  qty = 0;
  numberOfSplits = '1';
  splittedQty = '';
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
  @ViewChild('numberOfSplits') numberOfSplitsElem: ElementRef;
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
    this.inputData.barCode = this.inputData.batchName = this.batchInfo.batchName;
  }

  requestBatchDataFailed = () => {
    this.batchElem.nativeElement.select();
    this.resetForm();
  }

  requestBatchData = () => {
    if (!this.inputData.barCode) {
      return of(null);
    }

    if (this.inputData.barCode === this.batchInfo.barCode || this.inputData.barCode === this.batchInfo.batchName) {
      return of(null);
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
  requestMaterialBufferDataSuccess = (_) => {
  }

  requestMaterialBufferDataFailed = () => {
    this.bufferInfo = new MaterialBufferInfo();
    this.materialBufferElem.nativeElement.select();
  }

  requestMaterialBufferData = () => {
    if (!this.inputData.materialBuffer) {
      return of(null);
    }

    if (this.inputData.materialBuffer === this.bufferInfo.name) {
      return of(null);
    }

    return this._fetchService.getMaterialBuffer(this.inputData.materialBuffer).pipe(
      map((buffer: MaterialBufferInfo) => this.bufferInfo = buffer
      ));
  }

  //#endregion

  //#region Number of Splits Reqeust
  requestNumberOfSplitsDataSuccess = () => {
  }

  requestNumberOfSplitsDataFailed = () => {
    this.numberOfSplitsElem.nativeElement.focus();
  }

  requestNumberOfSplitsData = () => {
    if (this.inputData.numberOfSplits) {
      if (parseInt(this.inputData.numberOfSplits, 10) > 1) {
        if ((this.batchInfo.qty % parseInt(this.inputData.numberOfSplits, 10)) > 0) {
          return throwError('Incorrect Child Count');
        }
      }
    }

    return of(null);
  }

  //#endregion

  //#region Operator Reqeust
  requestOperatorDataSuccess = (_) => {
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
      map((operator: OperatorInfo) => this.operatorInfo = operator
      ));
  }
  //#endregion

  //#endregion

  //#region Protected methods
  protected getSplitInfo() {
    const child = parseInt(this.inputData.numberOfSplits, 10);

    if (this.batchInfo.qty > 0 && !isNaN(child)) {
      if (child > 1) {
        return `Child Qty: ${this.batchInfo.qty / child}`;
      }
    }
  }
  //#endregion

  //#region Event Handler

  batchEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['batch'].invalid) {
      this.batchElem.nativeElement.select();
      return;
    }

    this.materialBufferElem.nativeElement.focus();
  }

  materialBufferEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['materialBuffer'].invalid) {
      this.materialBufferElem.nativeElement.select();
      return;
    }

    this.numberOfSplitsElem.nativeElement.focus();
  }

  numberOfSplitsEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['numberOfSplits'].invalid) {
      this.numberOfSplitsElem.nativeElement.select();
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
  createBatchSuccess = () => {
    this._tipService['primary'](`Batch ${this.batchInfo.batchName} Created!`);
  }

  createBatchFailed = () => {
    this.batchElem.nativeElement.focus();
  }

  createBatch = () => {
    this.executionContext = {
      batchName: this.batchInfo.batchName,
      material: this.batchInfo.material,
      qty: this.batchInfo.qty,
      bufferName: this.bufferInfo.name,
      SAPBatch: this.batchInfo.SAPBatch,
      dateCode: this.batchInfo.dateCode,
      operator: this.operatorInfo.badge
    };
    return this._bapiService
      .createBatch(
        this.batchInfo.batchName,
        this.batchInfo.material,
        this.batchInfo.qty,
        this.bufferInfo.name,
        this.operatorInfo.badge,
        this.batchInfo.SAPBatch,
        this.batchInfo.dateCode
      ).pipe(
        switchMap(ret => {
          const numberOfSplits = parseInt(this.inputData.numberOfSplits, 10);
          if (numberOfSplits > 1) {
            return this._bapiService.splitBatch(this.batchInfo,
              numberOfSplits, this.batchInfo.qty / numberOfSplits, this.operatorInfo.badge);
          }
          return of(ret);
        })
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
