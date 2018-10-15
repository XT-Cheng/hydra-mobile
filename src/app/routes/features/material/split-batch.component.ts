import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { switchMap, map } from 'rxjs/operators';
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

  requestBatchDataSuccess = () => {
    this.inputData.batchName = this.inputData.barCode = this.batchInfo.batchName;
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
      map((batchInfo: BatchInfo) => this.batchInfo = Object.assign(this.batchInfo, batchInfo, {
        barCode: this.batchInfo.barCode
      })));
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
      map((operator: OperatorInfo) => this.operatorInfo = operator)
    );
  }
  //#endregion

  //#region Event Handler

  batchEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['batch'].invalid) {
      this.batchElem.nativeElement.select();
      return;
    }

    this.numberOfSplitsElem.nativeElement.focus();
  }

  operatorEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['operator'].invalid) {
      this.operatorElem.nativeElement.select();
      return;
    }

    this.operatorElem.nativeElement.blur();
  }

  numberOfSplitsEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['numberOfSplits'].invalid) {
      this.numberOfSplitsElem.nativeElement.select();
      return;
    }

    this.splittedQtyElem.nativeElement.focus();
  }

  splittedQtyEntered(event) {
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
    this.executionContext = {
      batchName: this.batchInfo.batchName,
      numberOfSplits: parseInt(this.inputData.numberOfSplits, 10),
      splittedQty: parseInt(this.inputData.splittedQty, 10),
      operator: this.operatorInfo.badge
    };
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
      && this.operatorInfo.badge &&
      (<any>this.inputData.numberOfSplits * <any>this.inputData.splittedQty <= this.batchInfo.qty);
  }
}
