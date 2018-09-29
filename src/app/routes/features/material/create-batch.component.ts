import { Component, HostBinding, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { switchMap, filter, catchError, tap, map } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService } from 'ngx-weui';
import { MaterialBufferInfo, BatchInfo, OperatorInfo } from '@core/interface/common.interface';
import { stopEvent } from '../utils';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { of, throwError } from 'rxjs';

interface InputData {
  barcode: string;
  batchName: string;
  material: string;
  materialBuffer: string;
  qty: number;
  badge: string;
}

class InputData implements InputData {
  barcode = '';
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
export class CreateBatchComponent {
  @ViewChild('f') form: NgForm;
  @ViewChild('batch') batchElem: ElementRef;
  @ViewChild('materialBuffer') materialBufferElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;
  @ViewChild('execute', { read: ElementRef }) buttonElem: ElementRef;

  bufferInfo: MaterialBufferInfo = new MaterialBufferInfo();
  batchInfo: BatchInfo = new BatchInfo();
  operatorInfo: OperatorInfo = new OperatorInfo();

  inputData: InputData = new InputData();

  isInputing = false;

  constructor(
    private _bapiService: BapiService,
    private _fetchService: NewFetchService,
    private _routeService: Router,
    private _titleService: TitleService,
    private _toastService: ToastService,
    private _tipService: ToptipsService
  ) {
    this._routeService.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this._titleService.setTitle(`Batch Create`);
      });
  }

  Inputing = () => {
    this.isInputing = true;
  }

  //#region Data Request
  requestBatchData = () => {
    this.isInputing = false;

    if (!this.inputData.barcode) {
      this.batchInfo = new BatchInfo();
      return;
    }

    // if (this.inputData.batchName !== this.batchInfo.name) {
    this.isInputing = true;
    this._toastService['loading']();

    this._fetchService.getBatchInfoFrom2DBarCode(this.inputData.barcode).pipe(
      switchMap((batchInfo: BatchInfo) => {
        this.batchInfo = batchInfo;
        return this._fetchService.getBatchInformation(batchInfo.name);
      }),
      catchError(err => {
        if (err.includes('not exist')) {
          return of(null);
        }
        return throwError(err);
      }),
      map((batchInfo: BatchInfo) => {
        if (!!batchInfo) {
          return throwError(`Batch ${this.inputData.batchName} exist！`);
        }
        return;
      }
      )).subscribe(_ => {
        this.isInputing = false;
        this.inputData.barcode = this.batchInfo.name;
        this._toastService.hide();
      }, err => {
        this.isInputing = false;
        this._toastService.hide();
        this.batchInfo = new BatchInfo();
        this._tipService.warn(err);
        this.resetForm();
      });
    // }
  }

  requestMaterialBufferData = () => {
    this.isInputing = false;

    if (!this.inputData.materialBuffer) {
      this.bufferInfo = new MaterialBufferInfo();
      return;
    }

    if (this.inputData.materialBuffer !== this.bufferInfo.name) {
      this.isInputing = true;
      this._toastService['loading']();

      this._fetchService.getMaterialBuffer(this.inputData.materialBuffer).
        subscribe((bufferInfo: MaterialBufferInfo) => {
          this.isInputing = false;
          this.bufferInfo = bufferInfo;
          this._toastService.hide();
        }, err => {
          this._tipService.warn(err);
          this._toastService.hide();
          this.bufferInfo = new MaterialBufferInfo();
          this.isInputing = false;
          this.materialBufferElem.nativeElement.select();
        });
    }
  }

  requestOperatorData = () => {
    this.isInputing = false;

    if (!this.inputData.badge) {
      this.operatorInfo = new OperatorInfo();
      return;
    }

    if (this.inputData.badge !== this.operatorInfo.badge) {
      this.isInputing = true;
      this._toastService['loading']();

      this._fetchService.getOperatorByBadge(this.inputData.badge).subscribe((operatorInfo: OperatorInfo) => {
        this._toastService.hide();
        this.operatorInfo = operatorInfo;
        this.isInputing = false;
      }, (error) => {
        this._tipService.warn(error);
        this._toastService.hide();
        this.operatorInfo = new OperatorInfo();
        this.isInputing = false;
        this.operatorElem.nativeElement.select();
      });
    }
  }
  //#endregion

  //#region Event Handler

  BatchEntered(event) {
    stopEvent(event);

    if (this.form.controls['batch'].invalid) {
      this.batchElem.nativeElement.select();
      return;
    }

    this.materialBufferElem.nativeElement.focus();
  }

  MaterialBufferEntered(event) {
    stopEvent(event);

    if (this.form.controls['materialBuffer'].invalid) {
      this.materialBufferElem.nativeElement.select();
      return;
    }

    this.operatorElem.nativeElement.focus();
  }

  OperatorEntered(event) {
    stopEvent(event);

    if (this.form.controls['operator'].invalid) {
      this.operatorElem.nativeElement.select();
      return;
    }

    this.operatorElem.nativeElement.blur();
  }

  //#endregion

  //#region Exeuction

  createBatch() {
    if (this.isInputing) {
      return;
    }

    this._toastService['loading']();

    // Create Batch
    this._bapiService
      .createBatch(
        this.inputData.batchName,
        this.inputData.material,
        this.inputData.qty,
        this.inputData.materialBuffer,
        this.inputData.badge
      ).pipe(
        tap((ret) => {
          if (!ret.isSuccess) {
            throwError(ret.description);
          }
        })
      ).subscribe(ret => {
        this._tipService['primary'](`Batch ${this.batchInfo.name} Created!`);
        this._toastService.hide();
        this.resetForm();
      },
        error => {
          this._tipService.warn(error);
          this._toastService.hide();
          this.resetForm();
        }
      );
  }

  //#endregion

  //#region Private methods

  isDisable() {
    return !this.form.valid;
  }

  resetForm() {
    this.bufferInfo = new MaterialBufferInfo();
    this.batchInfo = new BatchInfo();
    this.operatorInfo = new OperatorInfo();

    this.inputData = new InputData();
    this.isInputing = false;

    this.batchElem.nativeElement.focus();
  }

  //#endregion
}
