import { Component, HostBinding, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';
import { filter, switchMap } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { ToptipsService, ToastService } from 'ngx-weui';
import { TitleService } from '@core/title.service';
import { Router, NavigationEnd } from '@angular/router';
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

  requestBatchDataSuccess = (ret) => {
    this.inputData.barCode = this.batchInfo.batchName;
    this.batchInfo = ret;
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
  moveBatchSuccess = () => {
    this._tipService['primary'](`Batch ${this.batchInfo.batchName} Moved!`);
  }

  moveBatchFailed = () => {
    this.batchElem.nativeElement.focus();
  }

  moveBatch = () => {
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
