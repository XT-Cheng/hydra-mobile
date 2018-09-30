import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { switchMap } from 'rxjs/operators';
import { ToptipsService, ToastService } from 'ngx-weui';
import { Router } from '@angular/router';
import { TitleService } from '@core/title.service';
import { BatchInfo, OperatorInfo } from '@core/interface/common.interface';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { BaseForm } from '../base.form';
import { of, throwError } from 'rxjs';

interface InputData {
  barCode: string;
  batchName: string;
  numberOfSplits: string;
  splittedQty: string;
  badge: string;
  remainQty: number;
  remainQtyDisplay(): string;
}

class InputData implements InputData {
  barCode = '';
  badge = '';
  batchName = '';
  numberOfSplits = '';
  splittedQty = '';
  remainQty = -1;
  remainQtyDisplay(): string {
    return (this.remainQty >= 0 ? `Remain Qty:${this.remainQty}` : `Remain Qty:`);
  }
}

@Component({
  selector: 'batch-split',
  templateUrl: 'split-batch.component.html',
  styleUrls: ['./split-batch.component.scss']
})
export class SplitBatchComponent extends BaseForm {
  //#region View Children

  @ViewChild('batch') batchElem: ElementRef;
  @ViewChild('numberOfSplits') numberOfSplitsElem: ElementRef;
  @ViewChild('splittedQty') splittedQtyElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;

  //#endregion

  //#region Protected member

  protected batchInfo: BatchInfo = new BatchInfo();
  protected operatorInfo: OperatorInfo = new OperatorInfo();

  protected inputData: InputData = new InputData();

  protected title = `Batch Split`;

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

  requestBatchDataSuccess = (ret) => {
    this.batchInfo = ret;
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
      }));
  }

  //#endregion

  //#region Number of Splits Reqeust
  requestNumberOfSplitsDataSuccess = () => {
    this.inputData.remainQty = this.batchInfo.qty - (<any>this.inputData.numberOfSplits * <any>this.inputData.splittedQty);
  }

  requestNumberOfSplitsDataFailed = () => {
    this.numberOfSplitsElem.nativeElement.focus();
  }

  requestNumberOfSplitsData = () => {
    if (this.inputData.splittedQty) {
      if (<any>this.inputData.numberOfSplits * <any>this.inputData.splittedQty > this.batchInfo.qty) {
        return throwError('Exceed mother batch quantity');
      }
    }

    return of(null);
  }

  //#endregion

  //#region Child Qty Reqeust
  requestSplittedQtyDataSuccess = () => {
    this.inputData.remainQty = this.batchInfo.qty - (<any>this.inputData.numberOfSplits * <any>this.inputData.splittedQty);
  }

  requestSplittedQtyDataFailed = () => {
    this.splittedQtyElem.nativeElement.focus();
  }

  requestSplittedQtyData = () => {
    if (this.inputData.numberOfSplits) {
      if (<any>this.inputData.numberOfSplits * <any>this.inputData.splittedQty > this.batchInfo.qty) {
        return throwError('Exceed mother batch quantity');
      }
    }

    return of(null);
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

  BatchEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['batch'].invalid) {
      this.batchElem.nativeElement.select();
      return;
    }

    this.numberOfSplitsElem.nativeElement.focus();
  }

  OperatorEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['operator'].invalid) {
      this.operatorElem.nativeElement.select();
      return;
    }

    this.operatorElem.nativeElement.blur();
  }

  NumberOfSplitsEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['numberOfSplits'].invalid) {
      this.numberOfSplitsElem.nativeElement.select();
      return;
    }

    this.splittedQtyElem.nativeElement.focus();
  }

  SplittedQtyEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['splittedQty'].invalid) {
      this.splittedQtyElem.nativeElement.select();
      return;
    }

    this.operatorElem.nativeElement.focus();
  }

  //#endregion

  //#region Exeuction
  splitBatchSuccess = () => {
    this._tipService['primary'](`Batch ${this.batchInfo.batchName} Splitted!`);
  }

  splitBatchFailed = () => {
    this.batchElem.nativeElement.focus();
  }

  splitBatch = () => {
    // Split Batch
    return this._bapiService.splitBatch(this.batchInfo, parseInt(this.inputData.numberOfSplits, 10),
      parseInt(this.inputData.splittedQty, 10), this.operatorInfo.badge);
  }

  //#endregion

  //#region Override methods

  resetForm() {
    this.batchInfo = new BatchInfo();
    this.operatorInfo = new OperatorInfo();

    this.inputData = new InputData();

    this.batchElem.nativeElement.focus();
  }

  isValid() {
    return this.batchInfo.batchName
      && this.operatorInfo.badge;
  }

  //#endregion

  // splitBatch() {
  //   const result = {
  //     licenseTag: this.data.licenseTag,
  //     batchName: this.data.batchName,
  //     numberOfSplits: this.data.numberOfSplits,
  //     splitQty: this.data.splitQty,
  //     remainQty: this.data.remainQty,
  //     message: 'Split Batch...',
  //     isExecutingBapi: false,
  //     operator: this.data.operator,
  //     isSuccess: false,
  //     timeStamp: new Date()
  //   };

  //   this.resetForm();

  //   this.results.unshift(result);

  //   // this._toastService['loading']();

  //   // Update results
  //   if (this.results.length > 4) {
  //     this.results.pop();
  //   }

  //   result.isSuccess = true;
  //   result.message = `Batch: ${result.batchName} Split Successfully!`;
  //   this.resetForm();

  //   // this._fetchService.getBatchInformation(result.splittedBatch).pipe(
  //   //   switchMap(ret => {
  //   //     if (ret !== null && ret.length !== 0) {
  //   //       result.isExecutingBapi = false;
  //   //       result.isSuccess = false;
  //   //       result.message = `${result.splittedBatch}已经存在`;
  //   //       throw Error(result.message);
  //   //     }

  //   //     // Split Batch
  //   //     result.isExecutingBapi = true;
  //   //     return this._bapiService.splitBatch(result.id, result.licenseTag, result.splittedBatch, result.remainQty,
  //   //       result.splittedQty, result.operator);
  //   //   })).subscribe(ret => {
  //   //     // Set Status
  //   //     result.isExecutingBapi = false;

  //   //     result.isSuccess = ret.isSuccess;

  //   //     // Update results
  //   //     if (result.isSuccess) {
  //   //       result.message = `批次: ${result.splittedBatch}, 数量: ${result.splittedQty} 拆分成功`;
  //   //     } else {
  //   //       result.message = ret.description;
  //   //     }

  //   //     this._toastService.hide();
  //   //   },
  //   //     error => {
  //   //       console.log(error);
  //   //       this._toastService.hide();
  //   //     });
  // }

  // resetForm() {
  //   this.form.reset();
  //   this.data = {};
  //   this.batchInfo = '';
  //   this.operatorInfo = '';

  //   this.batchElem.nativeElement.focus();
  // }
}
