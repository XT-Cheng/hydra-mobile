import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { switchMap, map } from 'rxjs/operators';
import { ToptipsService, ToastService } from 'ngx-weui';
import { TitleService } from '@core/title.service';
import { Router } from '@angular/router';
import { BaseForm } from '../base.form';
import { BatchInfo, MaterialBufferInfo, OperatorInfo } from '@core/interface/common.interface';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { of } from 'rxjs';

interface InputData {
  barCode: string;
  batchName: string;
  materialBuffer: string;
  badge: string;
}

class InputData implements InputData {
  barCode = '';
  badge = '';
  batchName = '';
  materialBuffer = '';
}

@Component({
  selector: 'batch-move',
  templateUrl: 'move-batch.component.html',
  styleUrls: ['./move-batch.component.scss']
})
export class MoveBatchComponent extends BaseForm {
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

  protected title = `Batch Move`;

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
      map((bufferInfo: MaterialBufferInfo) => {
        if (bufferInfo.name === this.batchInfo.currentLocation) {
          throw Error(`Batch alreaday in Location ${this.batchInfo.currentLocation}`);
        }
        this.bufferInfo = bufferInfo;
      })
    );
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

    this.materialBufferElem.nativeElement.focus();
  }

  materialBufferEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['materialBuffer'].invalid) {
      this.materialBufferElem.nativeElement.select();
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
  moveBatchSuccess = () => {
    this._tipService['primary'](`Batch ${this.batchInfo.batchName} Moved!`);
  }

  moveBatchFailed = () => {
    this.batchElem.nativeElement.focus();
  }

  moveBatch = () => {
    this.executionContext = {
      batchName: this.batchInfo.batchName,
      bufferName: this.bufferInfo.name,
      operator: this.operatorInfo.badge
    };
    // Move Batch
    return this._bapiService.moveBatch(this.batchInfo.batchName, this.bufferInfo.name, this.operatorInfo.badge);
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
    return this.bufferInfo.name
      && this.batchInfo.batchName
      && this.operatorInfo.badge
      && this.bufferInfo.name !== this.batchInfo.currentLocation;
  }

  //#endregion
}
