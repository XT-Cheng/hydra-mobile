import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { Router } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService } from 'ngx-weui';
import { switchMap, map } from 'rxjs/operators';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { ReasonInfo, OperatorInfo, BatchInfo } from '@core/interface/common.interface';
import { of } from 'rxjs';
import { BaseForm } from '../base.form';

interface InputData {
  badge: string;
  batchName: string;
  barCode: string;
  newQty: number;
}

class InputData implements InputData {
  badge = '';
  batchName = '';
  barCode = '';
  newQty = 0;
}

@Component({
  selector: 'batch-adjust-quantity',
  templateUrl: 'adjust-batch-quantity.component.html',
  styleUrls: ['./adjust-batch-quantity.component.scss']
})
export class AdjustBatchQuantityComponent extends BaseForm {

  //#region View Children

  @ViewChild('newQty') newQtyElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;
  @ViewChild('batch') batchElem: ElementRef;

  //#endregion

  //#region Protected member

  protected batchInfo: BatchInfo = new BatchInfo();
  protected reasonInfo: ReasonInfo = new ReasonInfo();
  protected operatorInfo: OperatorInfo = new OperatorInfo();

  protected inputData: InputData = new InputData();

  protected title = `Adjust Batch Qty`;

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
    setTimeout(() => {
      this.newQtyElem.nativeElement.select();
    }, 0);
  }

  requestBatchDataFailed = () => {
    this.batchElem.nativeElement.select();
    this.resetForm();
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
      map((batchInfo: BatchInfo) => {
        this.batchInfo = Object.assign(this.batchInfo, batchInfo, {
          barCode: this.batchInfo.barCode
        });
        this.inputData.newQty = this.batchInfo.qty;
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
      map((operator: OperatorInfo) => this.operatorInfo = operator)
    );
  }

  //#endregion

  //#endregion

  //#region Event Handler

  batchEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['batch'].invalid) {
      this.batchElem.nativeElement.select();
      return;
    }

    this.batchElem.nativeElement.blur();
  }

  newQtyEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['newQty'].invalid) {
      this.newQtyElem.nativeElement.select();
      return;
    }

    this.operatorElem.nativeElement.select();
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
  adjustQuantitySuccess = () => {
    this._tipService['primary'](`Batch ${this.batchInfo.batchName} Adjusted!`);
  }

  adjustQuantityFailed = () => {
    this.batchElem.nativeElement.focus();
  }

  adjustQuantity = () => {
    this.executionContext = {
      batchName: this.batchInfo.batchName,
      newQty: this.inputData.newQty,
      operator: this.operatorInfo.badge
    };

    return this._bapiService.updateBatch(this.batchInfo.batchName, this.operatorInfo.badge, this.inputData.newQty);
  }

  //#endregion

  //#region Override methods

  resetForm() {
    this.batchInfo = new BatchInfo();
    this.operatorInfo = new OperatorInfo();
    this.reasonInfo = new ReasonInfo();

    this.inputData = new InputData();

    this.batchElem.nativeElement.focus();
  }

  isValid() {
    return this.operatorInfo.badge && this.batchInfo.batchName && this.inputData.newQty !== this.batchInfo.qty;
  }

  //#endregion
}
